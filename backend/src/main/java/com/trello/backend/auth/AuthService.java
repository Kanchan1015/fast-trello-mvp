package com.trello.backend.auth;

import com.trello.backend.auth.dto.*;
import com.trello.backend.auth.exception.AuthenticationFailedException;
import com.trello.backend.auth.exception.EmailAlreadyExistsException;
import com.trello.backend.auth.jwt.JwtService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // Register new user
    public AuthResponse register(RegisterRequest req) {
        String email = req.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException(email);
        }

        String hashed = passwordEncoder.encode(req.getPassword());
        UUID id = UUID.randomUUID();

        User user = new User(
                id,
                req.getName(),
                email,
                hashed,
                OffsetDateTime.now()
        );

        userRepository.save(user);

        return new AuthResponse(com.trello.backend.auth.dto.UserDto.fromEntity(user));
    }

    // Authenticate (login)
    public AuthResponse authenticate(LoginRequest req) {
        String email = req.getEmail().trim().toLowerCase();

        Optional<User> opt = userRepository.findByEmail(email);
        if (opt.isEmpty()) throw new AuthenticationFailedException();

        User user = opt.get();
        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new AuthenticationFailedException();
        }

        return new AuthResponse(com.trello.backend.auth.dto.UserDto.fromEntity(user));
    }

    // Get current user from Spring Security context (assumes subject == userId)
    public com.trello.backend.auth.dto.UserDto getCurrentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            return null;
        }

        // We expect principal to be userId (string) when the JWT filter sets it later.
        String principal = auth.getName(); // subject or username
        if (principal == null) return null;

        // try as UUID
        try {
            UUID userId = UUID.fromString(principal);
            return userRepository.findById(userId)
                    .map(com.trello.backend.auth.dto.UserDto::fromEntity)
                    .orElse(null);
        } catch (IllegalArgumentException e) {
            // fallback: maybe principal is email
            return userRepository.findByEmail(principal)
                    .map(com.trello.backend.auth.dto.UserDto::fromEntity)
                    .orElse(null);
        }
    }
}
