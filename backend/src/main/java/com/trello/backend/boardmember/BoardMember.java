package com.trello.backend.boardmember;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "board_members")
public class BoardMember {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "board_id", nullable = false)
    private UUID boardId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 30)
    private BoardMemberRole role;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    protected BoardMember() {}

    public BoardMember(UUID id, UUID boardId, UUID userId, BoardMemberRole role, OffsetDateTime createdAt) {
        this.id = id;
        this.boardId = boardId;
        this.userId = userId;
        this.role = role;
        this.createdAt = createdAt;
    }

    public static BoardMember create(UUID boardId, UUID userId, BoardMemberRole role) {
        return new BoardMember(UUID.randomUUID(), boardId, userId, role, OffsetDateTime.now());
    }

    public UUID getId() { return id; }
    public UUID getBoardId() { return boardId; }
    public UUID getUserId() { return userId; }
    public BoardMemberRole getRole() { return role; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
