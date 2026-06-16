package com.trello.backend.card;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CardRepository extends JpaRepository<CardEntity, UUID> {
    List<CardEntity> findByListIdOrderByPositionAsc(UUID listId);
    List<CardEntity> findByListIdInOrderByPositionAsc(List<UUID> listIds);
    Optional<CardEntity> findByIdAndListId(UUID id, UUID listId);
    Long deleteByIdAndListId(UUID id, UUID listId);
}
