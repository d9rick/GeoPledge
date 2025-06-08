package com.geopledge.charity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity @Data @NoArgsConstructor @AllArgsConstructor
public class Charity {
    @Id
    @GeneratedValue
    private UUID id;

    private String name;
}