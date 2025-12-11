package com.trello.backend.list;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Entity mapping for the "lists" table.
 * Named ListEntity to avoid collision with java.util.List.
 */
@Entity
@Table(name = "lists")
public class ListEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "board_id", nullable = false)
    private UUID boardId;

    @Column(name = "title", nullable = false, length = 300)
    private String title;

    // store as Double to match DOUBLE PRECISION in DB
    @Column(name = "position", nullable = false)
    private Double position;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    protected ListEntity() {}

    public ListEntity(UUID id, UUID boardId, String title, Double position, OffsetDateTime createdAt) {
        this.id = id;
        this.boardId = boardId;
        this.title = title;
        this.position = position;
        this.createdAt = createdAt;
    }

    public static ListEntity create(UUID boardId, String title, Double position) {
        return new ListEntity(UUID.randomUUID(), boardId, title, position, OffsetDateTime.now());
    }

    // getters / setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getBoardId() { return boardId; }
    public void setBoardId(UUID boardId) { this.boardId = boardId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Double getPosition() { return position; }
    public void setPosition(Double position) { this.position = position; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
