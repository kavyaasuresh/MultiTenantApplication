package tenant.project.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import tenant.project.dto.AuthRequest;
import tenant.project.dto.AuthResponse;
import tenant.project.dto.RegisterTenantRequest;
import tenant.project.entity.Role;
import tenant.project.entity.Tenant;
import tenant.project.entity.User;
import tenant.project.repository.TenantRepository;
import tenant.project.repository.UserRepository;
import tenant.project.security.JwtUtils;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/register-tenant")
    public ResponseEntity<?> registerTenant(@Valid @RequestBody RegisterTenantRequest request) {
        if (tenantRepository.findByName(request.getTenantName()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Tenant name is already taken!");
        }

        if (userRepository.findByUsername(request.getAdminUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

        // Create new tenant
        Tenant tenant = new Tenant();
        tenant.setName(request.getTenantName());
        tenantRepository.save(tenant);

        // Create admin user for this tenant
        User admin = new User();
        admin.setUsername(request.getAdminUsername());
        admin.setPassword(passwordEncoder.encode(request.getAdminPassword()));
        admin.setRole(Role.ADMIN);
        admin.setTenant(tenant);
        userRepository.save(admin);

        return ResponseEntity.ok("Tenant and Admin user registered successfully!");
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody AuthRequest loginRequest) {
        Optional<User> userOpt = userRepository.findByUsername(loginRequest.getUsername());

        if (userOpt.isEmpty() || !passwordEncoder.matches(loginRequest.getPassword(), userOpt.get().getPassword())) {
            return ResponseEntity.badRequest().body("Error: Invalid username or password");
        }

        User user = userOpt.get();
        String jwt = jwtUtils.generateJwtToken(user.getUsername(), user.getRole().name(), user.getTenant().getId(), user.getId());

        return ResponseEntity.ok(new AuthResponse(jwt, user.getUsername(), user.getRole().name()));
    }
}
