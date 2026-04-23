package tenant.project.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tenant.project.entity.Task;
import tenant.project.entity.User;

import java.util.List;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {
    List<Task> findByTenantIdAndDeletedFalse(UUID tenantId);
    List<Task> findByTenantIdAndAssignedUsersContainingAndDeletedFalse(UUID tenantId, User user);
    long countByTenantIdAndDeletedFalse(UUID tenantId);
}
