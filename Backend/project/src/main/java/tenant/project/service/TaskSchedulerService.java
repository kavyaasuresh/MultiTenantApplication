package tenant.project.service;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tenant.project.entity.Task;
import tenant.project.entity.TaskStatus;
import tenant.project.repository.TaskRepository;
import tenant.project.entity.AuditLog;
import tenant.project.repository.AuditLogRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskSchedulerService {

    private final TaskRepository taskRepository;
    private final AuditLogRepository auditLogRepository;

    @Scheduled(fixedRate = 60000) // Run every minute
    @Transactional
    public void checkOverdueTasks() {
        LocalDateTime now = LocalDateTime.now();
        
        // Find tasks that are not completed, not already marked overdue, and past deadline
        List<Task> potentialOverdueTasks = taskRepository.findAll().stream()
                .filter(t -> !t.isDeleted())
                .filter(t -> t.getStatus() != TaskStatus.COMPLETED)
                .filter(t -> t.getStatus() != TaskStatus.OVERDUE)
                .filter(t -> t.getDeadline() != null && t.getDeadline().isBefore(now))
                .toList();

        for (Task task : potentialOverdueTasks) {
            task.setStatus(TaskStatus.OVERDUE);
            taskRepository.save(task);

            // Log the system alert
            AuditLog log = new AuditLog();
            log.setAction("SYSTEM ALERT: Task '" + task.getTitle() + "' is now OVERDUE.");
            log.setTimestamp(now);
            log.setTenantId(task.getTenantId());
            // No specific user assigned as actor for system-generated alerts
            auditLogRepository.save(log);
            
            System.out.println("Automated Task Manager: Marked task '" + task.getTitle() + "' as OVERDUE.");
        }
    }
}
