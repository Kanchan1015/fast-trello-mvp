package com.trello.backend.auth.dto;

public class AuthResponse {
    private UserDto user;

    public AuthResponse() {}

    public AuthResponse(UserDto user) {
        this.user = user;
    }

    public UserDto getUser() { return user; }
    public void setUser(UserDto user) { this.user = user; }
}
