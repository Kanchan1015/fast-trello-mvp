package com.trello.backend.config;

import com.trello.backend.auth.AuthCookieService;
import com.trello.backend.auth.jwt.JwtAuthenticationFilter;
import com.trello.backend.auth.jwt.JwtService;
import com.trello.backend.auth.ratelimit.AuthRateLimitingFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtService jwtService;
    private final AuthCookieService cookieService;
    private final AuthRateLimitingFilter authRateLimitingFilter;

    public SecurityConfig(
            JwtService jwtService,
            AuthCookieService cookieService,
            AuthRateLimitingFilter authRateLimitingFilter
    ) {
        this.jwtService = jwtService;
        this.cookieService = cookieService;
        this.authRateLimitingFilter = authRateLimitingFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        JwtAuthenticationFilter jwtFilter = new JwtAuthenticationFilter(jwtService, cookieService);

        http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            // make the app stateless — JWT on every request
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // permit health and auth endpoints for anonymous access
                .requestMatchers("/health", "/api/auth/**", "/ws/**", "/v3/api-docs/**", "/swagger-ui/**").permitAll()
                // everything else requires authentication
                .anyRequest().authenticated()
            );

        // ensure JWT filter runs before Spring's username/password filter
        http.addFilterBefore(authRateLimitingFilter, UsernamePasswordAuthenticationFilter.class);
        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // password encoder for registering users
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // CORS config - allow frontend local origin
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(List.of(
            "http://localhost:5173",
            "http://127.0.0.1:5173"
        )); // frontend dev
        cfg.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        cfg.setAllowedHeaders(List.of("Authorization","Content-Type","Accept"));
        cfg.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }
}
