package com.trello.backend.card;

import java.time.OffsetDateTime;
import java.util.UUID;

public class CardDto {
    private UUID id;
    private UUID listId;
    private String title;
    private String description;
    private Double position;
    private OffsetDateTime createdAt;

    public static CardDto fromEntity(CardEntity e) {
        CardDto d = new CardDto();
        d.id = e.getId();
        d.listId = e.getListId();
        d.title = e.getTitle();
        d.description = e.getDescription();
        d.position = e.getPosition();
        d.createdAt = e.getCreatedAt();
        return d;
    }

    public UUID getId() { return id; }
    public UUID getListId() { return listId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public Double getPosition() { return position; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
