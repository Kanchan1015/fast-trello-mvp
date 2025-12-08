package com.trello.backend.board;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request payload for creating a board.
 */
public class CreateBoardRequest {
    @NotBlank
    @Size(max = 200)
    private String name;

    public CreateBoardRequest() {}

    public CreateBoardRequest(String name) { this.name = name; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
