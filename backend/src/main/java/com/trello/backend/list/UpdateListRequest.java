package com.trello.backend.list;

/**
 * PATCH request – partial update.
 * Either title, position, or both can be present.
 */
public class UpdateListRequest {
    private String title;
    private Double position;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Double getPosition() { return position; }
    public void setPosition(Double position) { this.position = position; }
}
