//package com.geopledge.service;
//
//import com.geopledge.model.Pledge;
//import com.geopledge.model.PledgeCheck;
//import com.geopledge.auth.model.User;
//import com.geopledge.repository.PledgeCheckRepository;
//import com.geopledge.auth.repository.UserRepository;
//
//import com.niamedtech.expo.exposerversdk.ExpoPushNotificationClient;
//import com.niamedtech.expo.exposerversdk.request.PushNotification;
//import com.niamedtech.expo.exposerversdk.response.TicketResponse;
//
//import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
//import org.apache.hc.client5.http.impl.classic.HttpClients;
//
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//
//import org.springframework.scheduling.annotation.Async;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.io.IOException;
//import java.math.BigDecimal;
//import java.util.List;
//import java.util.Optional;
//import java.util.UUID;
//
//@Service
//@RequiredArgsConstructor
//@Slf4j
//public class PenaltyService {
//
//    // your existing payment code
//    // private final StripeService stripeService;
//
//    private final UserRepository userRepo;
//    private final PledgeCheckRepository checkRepo;
//
//    /** One shared client – thread-safe for the JVM **/
//    private final ExpoPushNotificationClient pushClient =
//            ExpoPushNotificationClient.builder()
//                    .setHttpClient(HttpClients.createDefault())
//                    // only set the access token if present
//                    .setAccessToken(System.getenv("EXPO_ACCESS_TOKEN"))
//                    .build();
//
//    /**
//     * Charge the stake and push-notify the user that the pledge was violated.
//     * Runs async so it never blocks the request thread.
//     */
//    @Async
//    @Transactional
//    public void charge(UUID userId, Pledge pledge) {
//        // 1️⃣ Charge the user
//        long cents = pledge.getStakeCents(); // stored as cents
////        stripeService.chargeCustomer(
////                userId,
////                cents,
////                "GeoPledge penalty (“" + pledge.getDisplayName() + "”)"
////        );
//
//        // 2️⃣ Persist the violation
//        PledgeCheck check = new PledgeCheck();
//        check.setId(UUID.randomUUID());
//        check.setPledgeId(pledge.getId());
//        check.setStatus(PledgeCheck.Status.VIOLATED);
//        checkRepo.save(check);
//
//        // 3️⃣ Send push if token is valid
//        userRepo.findById(userId)
//                .map(User::getExpoPushToken)
//                .filter(ExpoPushNotificationClient::isExpoPushToken)
//                .ifPresent(token -> sendExpoPush(token, pledge, cents));
//    }
//
//    /* --- helper ---------------------------------------------------------- */
//
//    private void sendExpoPush(String expoToken, Pledge pledge, int cents) {
//        // build the notification payload
//        PushNotification notification = new PushNotification();
//        notification.setTo(List.of(expoToken));
//        notification.setTitle("GeoPledge missed!");
//        notification.setBody(
//                "We donated $"
//                        + BigDecimal.valueOf(cents, 2)
//                        + " to "
//                        + pledge.getCharityName()
//                        + " because you missed your pledge at "
//                        + pledge.getDisplayName()
//                        + "."
//        );
//        notification.setSound("default");
//        notification.setPriority("default");
//
//        try {
//            // send and log each ticket
//            List<TicketResponse.Ticket> tickets =
//                    pushClient.sendPushNotifications(List.of(notification));
//            tickets.forEach(t ->
//                    log.info("Expo push ticket id={}, status={}", t.getId(), t.getStatus())
//            );
//
//        } catch (IOException | RuntimeException e) {
//            log.warn("Expo push failed: {}", e.getMessage(), e);
//        }
//    }
//}
