// src/main/java/com/geopledge/charity/CharityDTO.java
package com.geopledge.charity;

import java.util.UUID;

public class CharityDTO {
    private UUID id;
    private String name;

    public CharityDTO() {}

    public CharityDTO(UUID id, String name) {
        this.id = id;
        this.name = name;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
