package com.trello.backend.list;

import com.trello.backend.board.BoardService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Lists are scoped under boards:
 * /api/boards/{boardId}/lists
 */
@RestController
@RequestMapping("/api/boards/{boardId}/lists")
@Validated
public class ListController {

    private final ListService listService;
    private final BoardService boardService;

    public ListController(ListService listService, BoardService boardService) {
        this.listService = listService;
        this.boardService = boardService;
    }

    /* ---------- Helpers ---------- */

    private UUID userId(Authentication auth) {
        return UUID.fromString(auth.getName());
    }

    private void verifyBoardOwnership(UUID boardId, Authentication auth) {
        // throws 404 if board not found or not owned by user
        boardService.getBoard(boardId, userId(auth));
    }

    /* ---------- Endpoints ---------- */

    @PostMapping
    public ResponseEntity<ListDto> create(
            @PathVariable UUID boardId,
            @Valid @RequestBody CreateListRequest req,
            Authentication auth
    ) {
        verifyBoardOwnership(boardId, auth);

        ListEntity created = listService.createList(
                boardId,
                req.getTitle(),
                req.getPosition()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ListDto.fromEntity(created));
    }

    @GetMapping
    public ResponseEntity<List<ListDto>> list(
            @PathVariable UUID boardId,
            Authentication auth
    ) {
        verifyBoardOwnership(boardId, auth);

        List<ListDto> lists = listService.listForBoard(boardId)
                .stream()
                .map(ListDto::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(lists);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ListDto> update(
            @PathVariable UUID boardId,
            @PathVariable UUID id,
            @RequestBody UpdateListRequest req,
            Authentication auth
    ) {
        verifyBoardOwnership(boardId, auth);

        if (req == null || (req.getTitle() == null && req.getPosition() == null)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "At least one of title or position must be provided");
        }

        ListEntity updated = null;

        if (req.getTitle() != null) {
            updated = listService.updateTitle(id, boardId, req.getTitle());
        }

        if (req.getPosition() != null) {
            updated = listService.updatePosition(id, boardId, req.getPosition());
        }

        return ResponseEntity.ok(ListDto.fromEntity(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID boardId,
            @PathVariable UUID id,
            Authentication auth
    ) {
        verifyBoardOwnership(boardId, auth);
        listService.deleteList(id, boardId);
        return ResponseEntity.noContent().build();
    }
}
