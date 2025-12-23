package com.trello.backend.list;

import java.time.OffsetDateTime;
import java.util.UUID;

public class ListDto {

    private UUID id;
    private UUID boardId;
    private String title;
    private Double position;
    private OffsetDateTime createdAt;

    public static ListDto fromEntity(ListEntity e) {
        ListDto d = new ListDto();
        d.id = e.getId();
        d.boardId = e.getBoardId();
        d.title = e.getTitle();
        d.position = e.getPosition();
        d.createdAt = e.getCreatedAt();
        return d;
    }

    public UUID getId() { return id; }
    public UUID getBoardId() { return boardId; }
    public String getTitle() { return title; }
    public Double getPosition() { return position; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
