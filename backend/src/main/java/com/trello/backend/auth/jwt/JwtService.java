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
        // create signing key from secret (HMAC-SHA)
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

    // parse and validate token, return subject (userId)
    public String validateAndGetSubject(String token) throws JwtException {
        Jws<Claims> jws = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token);
        return jws.getBody().getSubject();
    }
}
