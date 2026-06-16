package com.trello.backend.realtime;

import java.time.OffsetDateTime;
import java.util.UUID;

public class BoardEvent {
    private String type;
    private UUID boardId;
    private Object payload;
    private OffsetDateTime occurredAt;

    public BoardEvent(String type, UUID boardId, Object payload, OffsetDateTime occurredAt) {
        this.type = type;
        this.boardId = boardId;
        this.payload = payload;
        this.occurredAt = occurredAt;
    }

    public static BoardEvent of(String type, UUID boardId, Object payload) {
        return new BoardEvent(type, boardId, payload, OffsetDateTime.now());
    }

    public String getType() { return type; }
    public UUID getBoardId() { return boardId; }
    public Object getPayload() { return payload; }
    public OffsetDateTime getOccurredAt() { return occurredAt; }
}
