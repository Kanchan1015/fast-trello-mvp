package com.trello.backend.card;

import jakarta.validation.constraints.NotBlank;

public class CreateCardRequest {
    @NotBlank
    private String title;
    private String description;
    private Double position;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Double getPosition() { return position; }
    public void setPosition(Double position) { this.position = position; }
}
