package com.trello.backend.boardmember;

import com.trello.backend.auth.User;
import java.time.OffsetDateTime;
import java.util.UUID;

public class BoardMemberDto {
    private UUID userId;
    private String name;
    private String email;
    private BoardMemberRole role;
    private OffsetDateTime createdAt;

    public BoardMemberDto(UUID userId, String name, String email, BoardMemberRole role, OffsetDateTime createdAt) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.createdAt = createdAt;
    }

    public static BoardMemberDto owner(User user) {
        return new BoardMemberDto(user.getId(), user.getName(), user.getEmail(), BoardMemberRole.OWNER, user.getCreatedAt());
    }

    public static BoardMemberDto fromMember(BoardMember member, User user) {
        return new BoardMemberDto(user.getId(), user.getName(), user.getEmail(), member.getRole(), member.getCreatedAt());
    }

    public UUID getUserId() { return userId; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public BoardMemberRole getRole() { return role; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
