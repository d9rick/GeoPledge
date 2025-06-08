package com.geopledge.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Setter
@Getter
public class PledgeCreateDTO {
    private String name;
    private double targetLatitude;
    private double targetLongitude;
    private int radiusMeters;
    private long stakeCents;
    private UUID charityId;
    private List<Integer> daysOfWeek;
    private int timeHour;
    private int timeMinute;
}
