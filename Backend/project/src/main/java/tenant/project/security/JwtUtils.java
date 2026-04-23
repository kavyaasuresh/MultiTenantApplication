package tenant.project.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtUtils {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private int jwtExpirationMs;

    @jakarta.annotation.PostConstruct
    public void init() {
        if (jwtSecret == null || jwtSecret.isBlank()) {
            System.err.println("CRITICAL: JWT Secret is not loaded!");
        } else {
            System.out.println("JWT Utils initialized with secret length: " + jwtSecret.length());
        }
    }

    private SecretKey key() {
        byte[] keyBytes = java.util.HexFormat.of().parseHex(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateJwtToken(String username, String role, UUID tenantId, UUID userId) {
        return Jwts.builder()
                .subject(username)
                .claim("userId", userId.toString())
                .claim("role", role)
                .claim("tenantId", tenantId.toString())
                .issuedAt(new Date())
                .expiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key(), Jwts.SIG.HS256)
                .compact();
    }

    public String getUserNameFromJwtToken(String token) {
        return Jwts.parser().verifyWith(key()).build().parseSignedClaims(token).getPayload().getSubject();
    }

    public String getRoleFromJwtToken(String token) {
        return Jwts.parser().verifyWith(key()).build().parseSignedClaims(token).getPayload().get("role", String.class);
    }

    public UUID getTenantIdFromJwtToken(String token) {
        String tenantIdStr = Jwts.parser().verifyWith(key()).build().parseSignedClaims(token).getPayload().get("tenantId", String.class);
        return UUID.fromString(tenantIdStr);
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parser().verifyWith(key()).build().parseSignedClaims(authToken);
            return true;
        } catch (JwtException e) {
            System.err.println("JWT Validation Error: " + e.getMessage());
            e.printStackTrace();
        } catch (Exception e) {
            System.err.println("JWT Unexpected Error: " + e.getMessage());
            e.printStackTrace();
        }
        return false;
    }
}
