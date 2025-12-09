package com.trello.backend.board;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * Thrown when a board is not found or doesn't belong to the caller.
 * We use ResponseStatusException for simplicity so controllers don't need extra mapping.
 */
public class BoardNotFoundException extends ResponseStatusException {
    public BoardNotFoundException() {
        super(HttpStatus.NOT_FOUND, "Board not found");
    }

    public BoardNotFoundException(String message) {
        super(HttpStatus.NOT_FOUND, message);
    }
}
