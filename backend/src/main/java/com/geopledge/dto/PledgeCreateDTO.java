package com.geopledge.dto;

import java.util.List;
import java.util.UUID;

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

    // Getters
    public String getName() { return name; }
    public double getTargetLatitude() { return targetLatitude; }
    public double getTargetLongitude() { return targetLongitude; }
    public int getRadiusMeters() { return radiusMeters; }
    public long getStakeCents() { return stakeCents; }
    public UUID getCharityId() { return charityId; }
    public List<Integer> getDaysOfWeek() { return daysOfWeek; }
    public int getTimeHour() { return timeHour; }
    public int getTimeMinute() { return timeMinute; }

    // Setters
    public void setName(String name) { this.name = name; }
    public void setTargetLatitude(double targetLatitude) { this.targetLatitude = targetLatitude; }
    public void setTargetLongitude(double targetLongitude) { this.targetLongitude = targetLongitude; }
    public void setRadiusMeters(int radiusMeters) { this.radiusMeters = radiusMeters; }
    public void setStakeCents(long stakeCents) { this.stakeCents = stakeCents; }
    public void setCharityId(UUID charityId) { this.charityId = charityId; }
    public void setDaysOfWeek(List<Integer> daysOfWeek) { this.daysOfWeek = daysOfWeek; }
    public void setTimeHour(int timeHour) { this.timeHour = timeHour; }
    public void setTimeMinute(int timeMinute) { this.timeMinute = timeMinute; }
}
