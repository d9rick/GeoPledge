// src/main/java/com/geopledge/dto/ExpoPushTokenDTO.java
package com.geopledge.dto;

/** { "token": "ExponentPushToken[...]" } */
public class ExpoPushTokenDTO {
    private String token;

    public ExpoPushTokenDTO() {}

    public ExpoPushTokenDTO(String token) {
        this.token = token;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
}
