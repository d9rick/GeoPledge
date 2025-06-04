package com.geopledge.auth.dto;

/**
 * A simple wrapper for sending back messages (e.g. "User registered successfully", "Logged out").
 */
public class MessageResponse {
    private String message;

    public MessageResponse(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }
}