package tenant.project.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class RegisterTenantRequest {
    @NotBlank
    private String tenantName;

    @NotBlank
    private String adminUsername;

    @NotBlank
    private String adminPassword;
}
