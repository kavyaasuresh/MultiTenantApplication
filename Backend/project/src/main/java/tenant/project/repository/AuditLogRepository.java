package tenant.project.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tenant.project.entity.AuditLog;

import java.util.List;
import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    List<AuditLog> findByTenantIdOrderByTimestampDesc(UUID tenantId);
    List<AuditLog> findByUserIdAndTenantIdOrderByTimestampDesc(UUID userId, UUID tenantId);
}
