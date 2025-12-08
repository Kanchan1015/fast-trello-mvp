package com.trello.backend.board;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Response DTO for board objects sent to the client.
 * Avoids sending internal JPA entities directly.
 */
public class BoardDto {
    private UUID id;
    private String name;
    private UUID ownerId;
    private OffsetDateTime createdAt;

    public BoardDto() {}

    public BoardDto(UUID id, String name, UUID ownerId, OffsetDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.ownerId = ownerId;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public UUID getOwnerId() { return ownerId; }
    public void setOwnerId(UUID ownerId) { this.ownerId = ownerId; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public static BoardDto fromEntity(Board b) {
        return new BoardDto(b.getId(), b.getName(), b.getOwnerId(), b.getCreatedAt());
    }
}
