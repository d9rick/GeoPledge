package com.geopledge.model;

import jakarta.persistence.*;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "pledge_checks")
public class PledgeCheck {
    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "pledge_id", nullable = false)
    private UUID pledgeId;

    @Column(name = "scheduled_for", nullable = false)
    private ZonedDateTime scheduledFor;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status;

    @Column(name = "user_latitude", nullable = false)
    private double userLatitude;

    @Column(name = "user_longitude", nullable = false)
    private double userLongitude;

    @Column(name = "checked_at", nullable = false)
    private ZonedDateTime checkedAt;

    public enum Status { MET, VIOLATED }

    // Getters and setters
    public UUID getId() {
        return id;
    }
    public void setId(UUID id) {
        this.id = id;
    }
    public UUID getPledgeId() {
        return pledgeId;
    }
    public void setPledgeId(UUID pledgeId) {
        this.pledgeId = pledgeId;
    }
    public ZonedDateTime getScheduledFor() {
        return scheduledFor;
    }
    public void setScheduledFor(ZonedDateTime scheduledFor) {
        this.scheduledFor = scheduledFor;
    }
    public Status getStatus() {
        return status;
    }
    public void setStatus(Status status) {
        this.status = status;
    }
    public double getUserLatitude() {
        return userLatitude;
    }
    public void setUserLatitude(double userLatitude) {
        this.userLatitude = userLatitude;
    }
    public double getUserLongitude() {
        return userLongitude;
    }
    public void setUserLongitude(double userLongitude) {
        this.userLongitude = userLongitude;
    }
    public ZonedDateTime getCheckedAt() {
        return checkedAt;
    }
    public void setCheckedAt(ZonedDateTime checkedAt) {
        this.checkedAt = checkedAt;
    }
}
