package tenant.project.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tenant.project.dto.TaskDto;
import tenant.project.entity.Role;
import tenant.project.entity.Task;
import tenant.project.entity.User;
import tenant.project.repository.TaskRepository;
import tenant.project.repository.UserRepository;
import tenant.project.security.TenantContext;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.ArrayList;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditService auditService;

    @Transactional
    public Task createTask(TaskDto taskDto, User creator) {
        if (creator.getRole() == Role.EMPLOYEE) {
            throw new RuntimeException("Employees cannot create tasks");
        }
        Task task = new Task();
        task.setTitle(taskDto.getTitle());
        task.setDescription(taskDto.getDescription());
        if (taskDto.getStatus() != null) task.setStatus(taskDto.getStatus());
        if (taskDto.getPriority() != null) task.setPriority(taskDto.getPriority());
        task.setDeadline(taskDto.getDeadline());
        task.setTenantId(TenantContext.getCurrentTenant());

        if (taskDto.getAssignedUserIds() != null && !taskDto.getAssignedUserIds().isEmpty()) {
            List<User> users = userRepository.findAllById(taskDto.getAssignedUserIds());
            task.setAssignedUsers(users);
        }

        Task savedTask = taskRepository.save(task);
        auditService.logAction("Created Task: " + task.getTitle(), creator, savedTask.getId());
        return savedTask;
    }

    public List<Task> getTasksForUser(User user) {
        UUID tenantId = TenantContext.getCurrentTenant();
        
        if (user.getRole() == Role.ADMIN || user.getRole() == Role.MANAGER) {
            return taskRepository.findByTenantIdAndDeletedFalse(tenantId);
        } else {
            return taskRepository.findByTenantIdAndAssignedUsersContainingAndDeletedFalse(tenantId, user);
        }
    }

    public Optional<Task> getTaskById(UUID id) {
        return taskRepository.findById(id).filter(t -> t.getTenantId().equals(TenantContext.getCurrentTenant()) && !t.isDeleted());
    }

    @Transactional
    public Task updateTask(UUID id, TaskDto taskDto, User updater) {
        Task task = getTaskById(id).orElseThrow(() -> new RuntimeException("Task not found"));
        
        if (updater.getRole() == Role.EMPLOYEE) {
            // Employee can ONLY update status
            if (taskDto.getStatus() != null) {
                task.setStatus(taskDto.getStatus());
            } else {
                throw new RuntimeException("Employees can only update task status");
            }
        } else {
            // ADMIN or MANAGER can update everything
            if (taskDto.getTitle() != null) task.setTitle(taskDto.getTitle());
            if (taskDto.getDescription() != null) task.setDescription(taskDto.getDescription());
            if (taskDto.getStatus() != null) task.setStatus(taskDto.getStatus());
            if (taskDto.getPriority() != null) task.setPriority(taskDto.getPriority());
            if (taskDto.getDeadline() != null) task.setDeadline(taskDto.getDeadline());

            if (taskDto.getAssignedUserIds() != null) {
                List<User> users = userRepository.findAllById(taskDto.getAssignedUserIds());
                task.setAssignedUsers(users);
            }
        }

        Task updatedTask = taskRepository.save(task);
        auditService.logAction("Updated Task: " + task.getTitle(), updater, task.getId());
        return updatedTask;
    }

    @Transactional
    public Task updateTaskStatus(UUID id, tenant.project.entity.TaskStatus status, User user) {
        Task task = getTaskById(id).orElseThrow(() -> new RuntimeException("Task not found"));
        
        // Check if employee is assigned to this task or is admin/manager
        if (user.getRole() == Role.EMPLOYEE) {
            boolean isAssigned = task.getAssignedUsers().stream()
                    .anyMatch(u -> u.getId().equals(user.getId()));
            if (!isAssigned) {
                throw new RuntimeException("You can only update status for tasks assigned to you");
            }
        }

        task.setStatus(status);
        Task updatedTask = taskRepository.save(task);
        auditService.logAction("Changed status to " + status + " for Task: " + task.getTitle(), user, task.getId());
        return updatedTask;
    }

    @Transactional
    public void softDeleteTask(UUID id, User deleter) {
        if (deleter.getRole() == Role.EMPLOYEE) {
            throw new RuntimeException("Employees cannot delete tasks");
        }
        Task task = getTaskById(id).orElseThrow(() -> new RuntimeException("Task not found"));
        task.setDeleted(true);
        taskRepository.save(task);
        auditService.logAction("Deleted Task: " + task.getTitle(), deleter, task.getId());
    }
}
