package com.trello.backend.auth;

import com.trello.backend.auth.dto.AuthResponse;
import com.trello.backend.auth.dto.LoginRequest;
import com.trello.backend.auth.dto.RegisterRequest;
import com.trello.backend.auth.dto.UserDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@Validated
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // Register -> returns token + user
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        AuthResponse resp = authService.register(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    // Login -> returns token + user
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        AuthResponse resp = authService.authenticate(req);
        return ResponseEntity.ok(resp);
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
}
