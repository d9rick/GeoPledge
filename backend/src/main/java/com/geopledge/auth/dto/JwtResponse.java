package com.geopledge.auth.dto;

/**
 * Returned when login succeeds. Contains the generated JWT and (optionally) any user info.
 */
public class JwtResponse {
    private String token;
    private String tokenType = "Bearer";

    public JwtResponse(String token) {
        this.token = token;
    }

    public String getToken() {
        return token;
    }

    public String getTokenType() {
        return tokenType;
    }
}