package com.geopledge.dto;

import java.time.Instant;

public record LocationFixDTO(
        double lat,
        double lon,
        Instant at
) {}