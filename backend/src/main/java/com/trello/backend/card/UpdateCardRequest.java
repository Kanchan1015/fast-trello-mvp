package com.trello.backend.card;

import java.util.UUID;

public class UpdateCardRequest {
    private String title;
    private String description;
    private UUID listId;
    private Double position;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public UUID getListId() { return listId; }
    public void setListId(UUID listId) { this.listId = listId; }
    public Double getPosition() { return position; }
    public void setPosition(Double position) { this.position = position; }
}
