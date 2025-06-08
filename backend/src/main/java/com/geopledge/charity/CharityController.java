// src/main/java/com/geopledge/charity/CharityController.java
package com.geopledge.charity;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/charities")
@RequiredArgsConstructor
public class CharityController {

    private final CharityRepository repo;

    @GetMapping
    public List<CharityDTO> listAll() {
        return repo.findAll().stream()
                .map(c -> new CharityDTO(c.getId(), c.getName()))
                .collect(Collectors.toList());
    }
}
