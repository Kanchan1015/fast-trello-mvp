package com.trello.backend.card;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "cards")
public class CardEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "list_id", nullable = false)
    private UUID listId;

    @Column(name = "title", nullable = false, length = 300)
    private String title;

    @Column(name = "description")
    private String description;

    @Column(name = "position", nullable = false)
    private Double position;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    protected CardEntity() {}

    public CardEntity(UUID id, UUID listId, String title, String description, Double position, OffsetDateTime createdAt) {
        this.id = id;
        this.listId = listId;
        this.title = title;
        this.description = description;
        this.position = position;
        this.createdAt = createdAt;
    }

    public static CardEntity create(UUID listId, String title, String description, Double position) {
        return new CardEntity(UUID.randomUUID(), listId, title, description, position, OffsetDateTime.now());
    }

    public UUID getId() { return id; }
    public UUID getListId() { return listId; }
    public void setListId(UUID listId) { this.listId = listId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Double getPosition() { return position; }
    public void setPosition(Double position) { this.position = position; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
