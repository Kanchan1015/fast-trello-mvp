package com.trello.backend.board;

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
 * BoardController exposes owner-scoped CRUD endpoints for boards.
 *
 * Important: ownerId is taken from Authentication.getName() which we expect to be the user's UUID string.
 */
@RestController
@RequestMapping("/api/boards")
@Validated
public class BoardController {

    private final BoardService service;

    public BoardController(BoardService service) {
        this.service = service;
    }

    // Create a new board. Returns 201 + created board DTO.
    @PostMapping
    public ResponseEntity<BoardDto> create(@Valid @RequestBody CreateBoardRequest req,
                                           Authentication authentication) {
        UUID ownerId = parseUserId(authentication);
        Board created = service.createBoard(req.getName(), ownerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(BoardDto.fromEntity(created));
    }

    // List boards for current user
    @GetMapping
    public ResponseEntity<List<BoardDto>> list(Authentication authentication) {
        UUID ownerId = parseUserId(authentication);
        List<Board> boards = service.listBoards(ownerId);
        List<BoardDto> dtos = boards.stream().map(BoardDto::fromEntity).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Get a single board by id (owner only)
    @GetMapping("/{id}")
    public ResponseEntity<BoardDto> getOne(@PathVariable("id") UUID id,
                                           Authentication authentication) {
        UUID ownerId = parseUserId(authentication);
        Board b = service.getBoard(id, ownerId);
        return ResponseEntity.ok(BoardDto.fromEntity(b));
    }

    // Delete a board (owner only) - returns 204 No Content on success
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") UUID id,
                                       Authentication authentication) {
        UUID ownerId = parseUserId(authentication);
        service.deleteBoard(id, ownerId);
        return ResponseEntity.noContent().build();
    }

    // Helper: parse user id from Authentication.getName(); throw 401 if missing/invalid
    private UUID parseUserId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        try {
            return UUID.fromString(authentication.getName());
        } catch (IllegalArgumentException ex) {
            // fallback: sometimes principal might be email; treat as unauthorized here
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid principal");
        }
    }
}
