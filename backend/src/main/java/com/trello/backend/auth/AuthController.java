package com.trello.backend.auth;

import com.trello.backend.auth.dto.AuthResponse;
import com.trello.backend.auth.dto.LoginRequest;
import com.trello.backend.auth.dto.RegisterRequest;
import com.trello.backend.auth.dto.UserDto;
import com.trello.backend.auth.jwt.JwtProperties;
import com.trello.backend.auth.jwt.JwtService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
@Validated
public class AuthController {

    private final AuthService authService;
    private final AuthCookieService cookieService;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;

    public AuthController(AuthService authService, AuthCookieService cookieService, JwtService jwtService, JwtProperties jwtProperties) {
        this.authService = authService;
        this.cookieService = cookieService;
        this.jwtService = jwtService;
        this.jwtProperties = jwtProperties;
    }

    // Register -> sets HttpOnly access cookie + returns user
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        AuthResponse resp = authService.register(req);
        return withAccessCookie(ResponseEntity.status(HttpStatus.CREATED), resp);
    }

    // Login -> sets HttpOnly access cookie + returns user
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        AuthResponse resp = authService.authenticate(req);
        return withAccessCookie(ResponseEntity.ok(), resp);
    }

    // /me -> protected endpoint that returns current user's UserDto
    @GetMapping("/me")
    public ResponseEntity<UserDto> me() {
        UserDto user = authService.getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(user);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, cookieService.clearAccessCookie().toString())
                .build();
    }

    private ResponseEntity<AuthResponse> withAccessCookie(ResponseEntity.BodyBuilder builder, AuthResponse resp) {
        String token = jwtService.generateToken(resp.getUser().getId().toString());
        return builder
                .header(HttpHeaders.SET_COOKIE, cookieService.accessCookie(
                        token,
                        Duration.ofMillis(jwtProperties.getExpirationMs())
                ).toString())
                .body(resp);
    }
}
