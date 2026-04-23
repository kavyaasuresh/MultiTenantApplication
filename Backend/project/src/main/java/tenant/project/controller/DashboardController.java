package tenant.project.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tenant.project.entity.AuditLog;
import tenant.project.entity.Task;
import tenant.project.entity.TaskStatus;
import tenant.project.entity.User;
import tenant.project.entity.Role;
import tenant.project.repository.TaskRepository;
import tenant.project.repository.UserRepository;
import tenant.project.security.TenantContext;
import tenant.project.service.AuditService;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private tenant.project.repository.TenantRepository tenantRepository;

    @Autowired
    private AuditService auditService;

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        UUID tenantId = TenantContext.getCurrentTenant();
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username).orElseThrow();

        List<Task> tasks;
        if (currentUser.getRole() == Role.ADMIN || currentUser.getRole() == Role.MANAGER) {
            tasks = taskRepository.findByTenantIdAndDeletedFalse(tenantId);
        } else {
            // Only tasks assigned to this specific user
            tasks = taskRepository.findByTenantIdAndDeletedFalse(tenantId).stream()
                    .filter(t -> t.getAssignedUsers().stream().anyMatch(u -> u.getId().equals(currentUser.getId())))
                    .toList();
        }

        long totalTasks = tasks.size();
        long completedTasks = tasks.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();
        long pendingTasks = tasks.stream().filter(t -> t.getStatus() == TaskStatus.PENDING).count();
        long inProgressTasks = tasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();
        long overdueTasks = tasks.stream().filter(t -> t.getStatus() == TaskStatus.OVERDUE).count();

        // Priority breakdown
        Map<String, Long> priorityStats = new HashMap<>();
        for (tenant.project.entity.TaskPriority p : tenant.project.entity.TaskPriority.values()) {
            priorityStats.put(p.name(), tasks.stream().filter(t -> t.getPriority() == p).count());
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalTasks", totalTasks);
        stats.put("completedTasks", completedTasks);
        stats.put("pendingTasks", pendingTasks);
        stats.put("inProgressTasks", inProgressTasks);
        stats.put("overdueTasks", overdueTasks);
        stats.put("priorityBreakdown", priorityStats);
        stats.put("role", currentUser.getRole());
        stats.put("isBestPerformer", currentUser.getTenant().getBestPerformerName() != null && 
                                   currentUser.getTenant().getBestPerformerName().equalsIgnoreCase(currentUser.getUsername()));
        
        // Success rate calculation
        double successRate = totalTasks > 0 ? (double) completedTasks / totalTasks * 100 : 0;
        stats.put("successRate", Math.round(successRate * 10.0) / 10.0);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username).orElseThrow();

        if (currentUser.getRole() == Role.ADMIN || currentUser.getRole() == Role.MANAGER) {
            return ResponseEntity.ok(auditService.getTenantAuditLogs());
        } else {
            return ResponseEntity.ok(auditService.getUserAuditLogs(currentUser.getId()));
        }
    }

    @GetMapping("/employees")
    public ResponseEntity<List<User>> getEmployees() {
        UUID tenantId = TenantContext.getCurrentTenant();
        tenant.project.entity.Tenant tenant = new tenant.project.entity.Tenant();
        tenant.setId(tenantId);
        return ResponseEntity.ok(userRepository.findByTenant(tenant));
    }

    @GetMapping("/user-analytics/{userId}")
    public ResponseEntity<Map<String, Object>> getUserAnalytics(@org.springframework.web.bind.annotation.PathVariable UUID userId) {
        String requesterUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User requester = userRepository.findByUsername(requesterUsername).orElseThrow();

        if (requester.getRole() != Role.ADMIN && requester.getRole() != Role.MANAGER) {
            return ResponseEntity.status(403).build();
        }

        User targetUser = userRepository.findById(userId).orElseThrow();
        UUID tenantId = TenantContext.getCurrentTenant();

        List<Task> tasks = taskRepository.findByTenantIdAndDeletedFalse(tenantId).stream()
                .filter(t -> t.getAssignedUsers().stream().anyMatch(u -> u.getId().equals(targetUser.getId())))
                .toList();

        long totalTasks = tasks.size();
        long completedTasks = tasks.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();
        long overdueTasks = tasks.stream().filter(t -> t.getStatus() == TaskStatus.OVERDUE).count();
        
        double successRate = totalTasks > 0 ? (double) completedTasks / totalTasks * 100 : 0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("username", targetUser.getUsername());
        stats.put("totalTasks", totalTasks);
        stats.put("completedTasks", completedTasks);
        stats.put("overdueTasks", overdueTasks);
        stats.put("successRate", Math.round(successRate * 10.0) / 10.0);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/organization")
    public ResponseEntity<tenant.project.entity.Tenant> getOrganization() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username).orElseThrow();
        return ResponseEntity.ok(currentUser.getTenant());
    }
    
    @org.springframework.web.bind.annotation.PutMapping("/organization")
    public ResponseEntity<tenant.project.entity.Tenant> updateOrganization(@org.springframework.web.bind.annotation.RequestBody tenant.project.entity.Tenant updated) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username).orElseThrow();

        if (currentUser.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).build();
        }

        tenant.project.entity.Tenant tenant = currentUser.getTenant();
        tenant.setName(updated.getName());
        tenant.setAnnouncement(updated.getAnnouncement());
        tenant.setBestPerformerName(updated.getBestPerformerName());
        tenant.setOrganizationImageUrl(updated.getOrganizationImageUrl());
        
        tenantRepository.save(tenant);
        return ResponseEntity.ok(tenant);
    }
}
