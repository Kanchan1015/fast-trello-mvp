package com.trello.backend.auth.ratelimit;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class AuthRateLimitingFilter extends OncePerRequestFilter {
    private static final int CAPACITY = 10;
    private static final double REFILL_PER_SECOND = CAPACITY / (double) Duration.ofMinutes(1).toSeconds();

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        if (!isLimitedEndpoint(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        String key = request.getRequestURI() + ":" + clientIp(request);
        Bucket bucket = buckets.computeIfAbsent(key, ignored -> new Bucket(CAPACITY, System.nanoTime()));
        if (!bucket.tryConsume()) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"rate_limited\",\"message\":\"Too many authentication attempts\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean isLimitedEndpoint(HttpServletRequest request) {
        if (!"POST".equalsIgnoreCase(request.getMethod())) {
            return false;
        }
        String uri = request.getRequestURI();
        return "/api/auth/login".equals(uri) || "/api/auth/register".equals(uri);
    }

    private String clientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private static class Bucket {
        private double tokens;
        private long lastRefillNanos;

        Bucket(double tokens, long lastRefillNanos) {
            this.tokens = tokens;
            this.lastRefillNanos = lastRefillNanos;
        }

        synchronized boolean tryConsume() {
            refill();
            if (tokens < 1) {
                return false;
            }
            tokens -= 1;
            return true;
        }

        private void refill() {
            long now = System.nanoTime();
            double elapsedSeconds = (now - lastRefillNanos) / 1_000_000_000.0;
            tokens = Math.min(CAPACITY, tokens + elapsedSeconds * REFILL_PER_SECOND);
            lastRefillNanos = now;
        }
    }
}
