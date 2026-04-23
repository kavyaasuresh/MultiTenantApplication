package tenant.project.dto;

import lombok.Data;
import tenant.project.entity.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class UserDto {
    @NotBlank
    private String username;

    @NotBlank
    private String password;

    @NotNull
    private Role role;

    private String profileImageUrl;
}
