package com.trello.backend.board;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BoardRepository extends JpaRepository<Board, UUID> {
    // list boards that belong to a specific owner
    List<Board> findByOwnerId(UUID ownerId);

    // helpful owner-scoped find
    Optional<Board> findByIdAndOwnerId(UUID id, UUID ownerId);

    // helpful owner-scoped delete
    Long deleteByIdAndOwnerId(UUID id, UUID ownerId);
}
