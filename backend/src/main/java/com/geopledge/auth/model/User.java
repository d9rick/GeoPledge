// src/main/java/com/geopledge/auth/model/User.java
package com.geopledge.auth.model;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.UUID;

@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "email")
})
public class User {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(length = 36, updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "expo_push_token", length = 255)
    private String expoPushToken;

    @Column(nullable = false)
    private String password; // stored as BCrypt‐hashed

    public User() {}

    public User(String email, String password) {
        this.email = email;
        this.password = password;
    }

    // Getters
    public UUID getId() { return id; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getPushToken() { return expoPushToken; }

    // Setters
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public void setPushToken(String token) { this.expoPushToken = token; }
}
