package com.trello.backend.auth.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
// import java.util.UUID;

@Service
public class JwtService {

    private final JwtProperties props;
    private final Key key;

    public JwtService(JwtProperties props) {
        this.props = props;
        if (props.getSecret() == null || props.getSecret().length() < 32) {
            throw new IllegalStateException("JWT secret must be set and at least 32 bytes for HS256");
        }
        this.key = Keys.hmacShaKeyFor(props.getSecret().getBytes());
    }

    // generate token with subject = user id (UUID string)
    public String generateToken(String userId) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setSubject(userId)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + props.getExpirationMs()))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Validate token and return subject (user id).
     * Uses a small allowed clock skew to avoid immediate expiry due to clock differences.
     */
    public String validateAndGetSubject(String token) throws JwtException {
        Jws<Claims> jws = Jwts.parserBuilder()
                .setSigningKey(key)
                // allow small clock skew (in seconds) to account for minor clock drift
                .setAllowedClockSkewSeconds(60) // 60s leeway
                .build()
                .parseClaimsJws(token);
        return jws.getBody().getSubject();
    }
}
