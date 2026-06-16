package com.trello.backend.boardmember;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BoardMemberRepository extends JpaRepository<BoardMember, UUID> {
    boolean existsByBoardIdAndUserId(UUID boardId, UUID userId);
    Optional<BoardMember> findByBoardIdAndUserId(UUID boardId, UUID userId);
    List<BoardMember> findByBoardIdOrderByCreatedAtAsc(UUID boardId);
    Long deleteByBoardIdAndUserId(UUID boardId, UUID userId);
}
