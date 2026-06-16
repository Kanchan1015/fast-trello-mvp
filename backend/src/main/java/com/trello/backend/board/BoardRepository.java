package com.trello.backend.board;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BoardRepository extends JpaRepository<Board, UUID> {
    // list boards that belong to a specific owner
    List<Board> findByOwnerId(UUID ownerId);

    @Query("""
            select b from Board b
            where b.ownerId = :userId
               or exists (
                   select 1 from BoardMember bm
                   where bm.boardId = b.id and bm.userId = :userId
               )
            order by b.createdAt desc
            """)
    List<Board> findAccessibleByUserId(@Param("userId") UUID userId);

    // helpful owner-scoped find
    Optional<Board> findByIdAndOwnerId(UUID id, UUID ownerId);

    // helpful owner-scoped delete
    Long deleteByIdAndOwnerId(UUID id, UUID ownerId);
}
