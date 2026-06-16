package com.trello.backend.auth;

import com.trello.backend.auth.dto.AuthResponse;
import com.trello.backend.auth.dto.LoginRequest;
import com.trello.backend.auth.dto.RegisterRequest;
import com.trello.backend.auth.dto.UserDto;
import com.trello.backend.auth.jwt.JwtProperties;
import com.trello.backend.auth.jwt.JwtService;
import com.trello.backend.auth.refresh.IssuedRefreshToken;
import com.trello.backend.auth.refresh.RefreshTokenService;
import jakarta.servlet.http.HttpServletRequest;
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
    private final RefreshTokenService refreshTokenService;

    public AuthController(
            AuthService authService,
            AuthCookieService cookieService,
            JwtService jwtService,
            JwtProperties jwtProperties,
            RefreshTokenService refreshTokenService
    ) {
        this.authService = authService;
        this.cookieService = cookieService;
        this.jwtService = jwtService;
        this.jwtProperties = jwtProperties;
        this.refreshTokenService = refreshTokenService;
    }

    // Register -> sets HttpOnly access cookie + returns user
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        AuthResponse resp = authService.register(req);
        return withSessionCookies(ResponseEntity.status(HttpStatus.CREATED), resp);
    }

    // Login -> sets HttpOnly access cookie + returns user
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        AuthResponse resp = authService.authenticate(req);
        return withSessionCookies(ResponseEntity.ok(), resp);
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

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(HttpServletRequest request) {
        String refreshToken = cookieService.refreshToken(request)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Missing refresh token"
                ));
        RefreshTokenService.RotationResult result = refreshTokenService.rotate(refreshToken);
        AuthResponse resp = new AuthResponse(UserDto.fromEntity(result.user()));
        return withSessionCookies(ResponseEntity.ok(), resp, result.refreshToken());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        cookieService.refreshToken(request).ifPresent(refreshTokenService::revoke);
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, cookieService.clearAccessCookie().toString())
                .header(HttpHeaders.SET_COOKIE, cookieService.clearRefreshCookie().toString())
                .build();
    }

    private ResponseEntity<AuthResponse> withSessionCookies(ResponseEntity.BodyBuilder builder, AuthResponse resp) {
        IssuedRefreshToken refreshToken = refreshTokenService.issue(resp.getUser().getId());
        return withSessionCookies(builder, resp, refreshToken);
    }

    private ResponseEntity<AuthResponse> withSessionCookies(
            ResponseEntity.BodyBuilder builder,
            AuthResponse resp,
            IssuedRefreshToken refreshToken
    ) {
        String token = jwtService.generateToken(resp.getUser().getId().toString());
        return builder
                .header(HttpHeaders.SET_COOKIE, cookieService.accessCookie(
                        token,
                        Duration.ofMillis(jwtProperties.getExpirationMs())
                ).toString())
                .header(HttpHeaders.SET_COOKIE, cookieService.refreshCookie(
                        refreshToken.token(),
                        refreshToken.ttl()
                ).toString())
                .body(resp);
    }
}
