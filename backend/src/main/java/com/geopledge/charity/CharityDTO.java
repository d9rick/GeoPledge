// src/main/java/com/geopledge/charity/CharityDTO.java
package com.geopledge.charity;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class CharityDTO {
    private UUID id;
    private String name;
}
