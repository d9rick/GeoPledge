package com.geopledge.charity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
public class Charity {
    @Id
    @GeneratedValue
    private UUID id;

    private String name;

    public Charity() {}

    public Charity(UUID id, String name) {
        this.id = id;
        this.name = name;
    }

    // Getters
    public UUID getId() { return id; }
    public String getName() { return name; }

    // Setters
    public void setId(UUID id) { this.id = id; }
    public void setName(String name) { this.name = name; }
}