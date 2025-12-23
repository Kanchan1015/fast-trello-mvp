package com.trello.backend.list;

import jakarta.validation.constraints.NotBlank;

public class CreateListRequest {

    @NotBlank
    private String title;

    // optional – used when inserting between lists
    private Double position;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Double getPosition() { return position; }
    public void setPosition(Double position) { this.position = position; }
}
