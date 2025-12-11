package com.trello.backend.list;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ListRepository extends JpaRepository<ListEntity, UUID> {
    // board-scoped ordered query
    List<ListEntity> findByBoardIdOrderByPositionAsc(UUID boardId);

    // helper to fetch a list by id and board
    Optional<ListEntity> findByIdAndBoardId(UUID id, UUID boardId);

    // owner/scoped delete (boardId ensures we don't accidentally delete across boards)
    Long deleteByIdAndBoardId(UUID id, UUID boardId);
}
