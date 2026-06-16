package com.trello.backend.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
public class DatabaseTransportSecurityValidator {
    private final String jdbcUrl;

    public DatabaseTransportSecurityValidator(@Value("${spring.datasource.url:}") String jdbcUrl) {
        this.jdbcUrl = jdbcUrl;
    }

    @PostConstruct
    public void validate() {
        String normalized = jdbcUrl == null ? "" : jdbcUrl.toLowerCase(Locale.ROOT);
        if (!normalized.startsWith("jdbc:postgresql:")) {
            return;
        }
        if (!requiresEncryptedPostgresConnection(normalized)) {
            throw new IllegalStateException(
                    "PostgreSQL JDBC URL must include sslmode=require, sslmode=verify-ca, or sslmode=verify-full"
            );
        }
    }

    private boolean requiresEncryptedPostgresConnection(String url) {
        return url.contains("sslmode=require")
                || url.contains("sslmode=verify-ca")
                || url.contains("sslmode=verify-full");
    }
}
