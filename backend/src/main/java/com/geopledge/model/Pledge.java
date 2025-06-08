package com.geopledge.model;

import jakarta.persistence.*;
import java.time.ZonedDateTime;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "geo_pledges")
public class Pledge {
    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "name")
    private String name;

    @Column(name = "target_latitude", nullable = false)
    private double targetLatitude;

    @Column(name = "target_longitude", nullable = false)
    private double targetLongitude;

    @Column(name = "radius_meters", nullable = false)
    private int radiusMeters = 100;

    @Column(name = "stake_cents", nullable = false)
    private long stakeCents;

    @Column(name = "charity_id", nullable = false)
    private UUID charityId;

    @ElementCollection
    @CollectionTable(name = "geo_pledges_days_of_week", joinColumns = @JoinColumn(name = "pledge_id"))
    @Column(name = "day_index")
    private List<Integer> daysOfWeek;

    @Column(name = "time_hour", nullable = false)
    private int timeHour;

    @Column(name = "time_minute", nullable = false)
    private int timeMinute;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    @Column(name = "created_at", nullable = false)
    private ZonedDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private ZonedDateTime updatedAt;

    // Getters and setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public double getTargetLatitude() {
        return targetLatitude;
    }

    public void setTargetLatitude(double targetLatitude) {
        this.targetLatitude = targetLatitude;
    }

    public double getTargetLongitude() {
        return targetLongitude;
    }

    public void setTargetLongitude(double targetLongitude) {
        this.targetLongitude = targetLongitude;
    }

    public int getRadiusMeters() {
        return radiusMeters;
    }

    public void setRadiusMeters(int radiusMeters) {
        this.radiusMeters = radiusMeters;
    }

    public long getStakeCents() {
        return stakeCents;
    }

    public void setStakeCents(long stakeCents) {
        this.stakeCents = stakeCents;
    }

    public int getTimeHour() {
        return timeHour;
    }

    public void setTimeHour(int timeHour) {
        this.timeHour = timeHour;
    }

    public int getTimeMinute() {
        return timeMinute;
    }

    public void setTimeMinute(int timeMinute) {
        this.timeMinute = timeMinute;
    }

    public Collection<Object> getDaysOfWeek() {
        return Collections.singleton(daysOfWeek);
    }

    public void setDaysOfWeek(List<Integer> daysOfWeek) {
        this.daysOfWeek = daysOfWeek;
    }

    public UUID getCharityId() {
        return charityId;
    }

    public void setCharityId(UUID charityId) {
        this.charityId = charityId;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public ZonedDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(ZonedDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public ZonedDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(ZonedDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
