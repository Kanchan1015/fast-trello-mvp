package com.trello.backend.auth;

import com.trello.backend.auth.exception.AuthenticationFailedException;
import com.trello.backend.auth.exception.EmailAlreadyExistsException;
import com.trello.backend.board.BoardNotFoundException;
import com.trello.backend.card.CardNotFoundException;
import com.trello.backend.list.ListNotFoundException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.validation.FieldError;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<Object> handleEmailExists(EmailAlreadyExistsException ex) {
        Map<String, String> body = Map.of("error", "email_exists", "message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(AuthenticationFailedException.class)
    public ResponseEntity<Object> handleAuthFailed(AuthenticationFailedException ex) {
        Map<String, String> body = Map.of("error", "invalid_credentials", "message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }

    @ExceptionHandler({BoardNotFoundException.class, ListNotFoundException.class, CardNotFoundException.class})
    public ResponseEntity<Object> handleNotFound(RuntimeException ex) {
        Map<String, String> body = Map.of("error", "not_found", "message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    protected ResponseEntity<Object> handleValidation(MethodArgumentNotValidException ex, WebRequest request) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError err : ex.getBindingResult().getFieldErrors()) {
            errors.put(err.getField(), err.getDefaultMessage());
        }
        Map<String, Object> body = Map.of("error", "validation_failed", "details", errors);
        return new ResponseEntity<>(body, new HttpHeaders(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(org.springframework.web.server.ResponseStatusException.class)
    public ResponseEntity<Object> handleResponseStatus(org.springframework.web.server.ResponseStatusException ex) {
        String errorName = ex.getReason() != null ? ex.getReason().toLowerCase().replace(" ", "_") : "error";
        String message = ex.getReason() != null ? ex.getReason() : ex.getMessage();
        Map<String, String> body = Map.of("error", errorName, "message", message);
        return ResponseEntity.status(ex.getStatusCode()).body(body);
    }

    // Fallback
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleAll(Exception ex) {
        Map<String, String> body = Map.of("error", "server_error", "message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
