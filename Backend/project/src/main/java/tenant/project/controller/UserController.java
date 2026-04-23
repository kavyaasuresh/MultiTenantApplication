package tenant.project.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import tenant.project.dto.UserDto;
import tenant.project.entity.Role;
import tenant.project.entity.Tenant;
import tenant.project.entity.User;
import tenant.project.repository.TenantRepository;
import tenant.project.repository.UserRepository;
import tenant.project.security.TenantContext;
import tenant.project.service.AuditService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuditService auditService;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<List<User>> getTenantUsers() {
        UUID tenantId = TenantContext.getCurrentTenant();
        Tenant tenant = tenantRepository.findById(tenantId).orElseThrow(() -> new RuntimeException("Tenant not found"));
        return ResponseEntity.ok(userRepository.findByTenant(tenant));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<?> createUser(@RequestBody UserDto userDto) {
        if (userRepository.findByUsername(userDto.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

        UUID tenantId = TenantContext.getCurrentTenant();
        Tenant tenant = tenantRepository.findById(tenantId).orElseThrow(() -> new RuntimeException("Tenant not found"));

        User newUser = new User();
        newUser.setUsername(userDto.getUsername());
        newUser.setPassword(passwordEncoder.encode(userDto.getPassword()));
        newUser.setRole(userDto.getRole());
        newUser.setTenant(tenant);

        userRepository.save(newUser);
        
        auditService.logAction("Created user: " + newUser.getUsername(), getCurrentUser(), null);

        return ResponseEntity.ok(newUser);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<?> updateUser(@PathVariable UUID id, @RequestBody UserDto userDto) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        
        // Don't allow managers to edit admins
        if (getCurrentUser().getRole() == Role.MANAGER && user.getRole() == Role.ADMIN) {
            return ResponseEntity.status(403).body("Managers cannot edit Admin users");
        }

        user.setRole(userDto.getRole());
        user.setProfileImageUrl(userDto.getProfileImageUrl());
        
        if (userDto.getPassword() != null && !userDto.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        }

        userRepository.save(user);
        auditService.logAction("Updated user: " + user.getUsername(), getCurrentUser(), null);
        
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable UUID id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getId().equals(getCurrentUser().getId())) {
            return ResponseEntity.badRequest().body("You cannot delete yourself!");
        }

        userRepository.delete(user);
        auditService.logAction("Deleted user: " + user.getUsername(), getCurrentUser(), null);
        
        return ResponseEntity.ok().build();
    }
}
