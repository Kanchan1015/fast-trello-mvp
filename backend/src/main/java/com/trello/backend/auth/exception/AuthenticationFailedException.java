package com.trello.backend.auth.exception;

public class AuthenticationFailedException extends RuntimeException {
    public AuthenticationFailedException() { super("Invalid credentials"); }
}
