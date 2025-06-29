// src/main/java/com/geopledge/controller/PushTestController.java
package com.geopledge.controller;

import com.geopledge.auth.model.User;
import com.geopledge.auth.repository.UserRepository;

import com.niamedtech.expo.exposerversdk.ExpoPushNotificationClient;
import com.niamedtech.expo.exposerversdk.request.PushNotification;
import com.niamedtech.expo.exposerversdk.response.TicketResponse;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class PushTestController {

    private final UserRepository userRepo;
    private final ExpoPushNotificationClient pushClient;

    @GetMapping("/push/{userId}")
    public ResponseEntity<String> sendTestPush(@PathVariable UUID userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // <-- replace getPushToken() with your actual getter
        String token = userOpt.get().getPushToken();
        if (!isValidExpoPushToken(token)) {
            return ResponseEntity.badRequest()
                    .body("Invalid Expo push token");
        }

        PushNotification note = new PushNotification();
        note.setTo(List.of(token));
        note.setTitle("GeoPledge Test");
        note.setBody("🎉 This is a test notification from GeoPledge!");
        note.setSound("default");

        try {
            List<TicketResponse.Ticket> tickets =
                    pushClient.sendPushNotifications(List.of(note));

            String result = tickets.stream()
                    .map(t -> t.getId() + ":" + t.getStatus())
                    .collect(Collectors.joining(", "));
            return ResponseEntity.ok("Tickets: " + result);

        } catch (IOException e) {
            return ResponseEntity.status(500)
                    .body("Push failed: " + e.getMessage());
        }
    }

    /** Simple check—Expo tokens always begin with "ExpoPushToken[" or "ExponentPushToken[" */
    private boolean isValidExpoPushToken(String token) {
        return token != null &&
                (token.startsWith("ExpoPushToken[") || token.startsWith("ExponentPushToken["));
    }
}
