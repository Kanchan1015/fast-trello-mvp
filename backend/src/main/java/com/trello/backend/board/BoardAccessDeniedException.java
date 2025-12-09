package com.trello.backend.board;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * Thrown when a user tries to access or mutate a board they don't own.
 */
public class BoardAccessDeniedException extends ResponseStatusException {
    public BoardAccessDeniedException() {
        super(HttpStatus.FORBIDDEN, "Access denied to board");
    }

    public BoardAccessDeniedException(String message) {
        super(HttpStatus.FORBIDDEN, message);
    }
}
