package com.trello.backend.list;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class ListNotFoundException extends ResponseStatusException {
    public ListNotFoundException() {
        super(HttpStatus.NOT_FOUND, "List not found");
    }

    public ListNotFoundException(String message) {
        super(HttpStatus.NOT_FOUND, message);
    }
}
