package com.trello.backend.auth.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class UserDto {
    private UUID id;
    private String name;
    private String email;
    private OffsetDateTime createdAt;

    public UserDto() {}

    public UserDto(UUID id, String name, String email, OffsetDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    // helper to convert from entity
    public static UserDto fromEntity(com.trello.backend.auth.User user) {
        return new UserDto(user.getId(), user.getName(), user.getEmail(), user.getCreatedAt());
    }
}
