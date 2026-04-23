package tenant.project.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tenant.project.entity.AuditLog;
import tenant.project.entity.User;
import tenant.project.repository.AuditLogRepository;
import tenant.project.security.TenantContext;

import java.util.List;
import java.util.UUID;

@Service
public class AuditService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public void logAction(String action, User user, UUID taskId) {
        AuditLog log = new AuditLog();
        log.setAction(action);
        log.setUser(user);
        log.setTaskId(taskId);
        log.setTenantId(TenantContext.getCurrentTenant());
        auditLogRepository.save(log);
    }

    public List<AuditLog> getTenantAuditLogs() {
        return auditLogRepository.findByTenantIdOrderByTimestampDesc(TenantContext.getCurrentTenant());
    }

    public List<AuditLog> getUserAuditLogs(UUID userId) {
        return auditLogRepository.findByUserIdAndTenantIdOrderByTimestampDesc(userId, TenantContext.getCurrentTenant());
    }
}
