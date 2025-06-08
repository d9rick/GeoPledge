package com.geopledge.dto;

import java.time.ZonedDateTime;
import java.util.UUID;

public class PledgeDTO {
    private UUID id;
    private String name;
    private ZonedDateTime nextScheduledRun;
    private long stakeCents;
    private String lastStatus; // "MET", "VIOLATED", or null

    public PledgeDTO(UUID id, String name, ZonedDateTime nextScheduledRun, long stakeCents, String lastStatus) {
        this.id = id;
        this.name = name;
        this.nextScheduledRun = nextScheduledRun;
        this.stakeCents = stakeCents;
        this.lastStatus = lastStatus;
    }


    public UUID getId() {
        return id;
    }
    public String getName() {
        return name;
    }
    public ZonedDateTime getNextScheduledRun() {
        return nextScheduledRun;
    }
    public long getStakeCents() {
        return stakeCents;
    }
    public String getLastStatus() {
        return lastStatus;
    }
}
