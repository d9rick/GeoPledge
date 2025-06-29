// src/main/java/com/geopledge/controller/UserController.java
package com.geopledge.controller;

import com.geopledge.auth.model.User;
import com.geopledge.auth.repository.UserRepository;
import com.geopledge.dto.ExpoPushTokenDTO;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepo;

    /**
     * Client calls this with its current Expo token after login or whenever it changes.
     * e.g. POST /api/users/{userId}/push-token { "token": "ExponentPushToken[…]" }
     */
    @PostMapping("/{userId}/push-token")
    public ResponseEntity<Void> updatePushToken(
            @PathVariable UUID userId,
            @RequestBody ExpoPushTokenDTO body
    ) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setPushToken(body.getToken());
        userRepo.save(user);

        return ResponseEntity.noContent().build();
    }
}
