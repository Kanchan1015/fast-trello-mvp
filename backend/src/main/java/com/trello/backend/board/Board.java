package com.trello.backend.board;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Board entity mapped to db table "boards".
 *
 * Note (design choice): we store ownerId as UUID rather than mapping a @ManyToOne User relationship.
 * This keeps the entity lightweight and avoids unnecessary joins when authorization is performed
 * by comparing ownerId to the userId from the JWT. If you need eager user data later, you can
 * add a relationship.
 */
@Entity
@Table(name = "boards")
public class Board {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    protected Board() {}

    public Board(UUID id, String name, UUID ownerId, OffsetDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.ownerId = ownerId;
        this.createdAt = createdAt;
    }

    // convenience constructor
    public static Board create(String name, UUID ownerId) {
        return new Board(UUID.randomUUID(), name, ownerId, OffsetDateTime.now());
    }

    // getters / setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public UUID getOwnerId() { return ownerId; }
    public void setOwnerId(UUID ownerId) { this.ownerId = ownerId; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
