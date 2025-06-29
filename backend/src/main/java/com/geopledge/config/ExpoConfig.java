// src/main/java/com/geopledge/config/ExpoConfig.java
package com.geopledge.config;

import com.niamedtech.expo.exposerversdk.ExpoPushNotificationClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.springframework.context.annotation.Bean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ExpoConfig {

    // Spring will fall back to empty string if EXPO_ACCESS_TOKEN is unset
    @Value("${EXPO_ACCESS_TOKEN:}")
    private String accessToken;

    @Bean
    public ExpoPushNotificationClient expoPushNotificationClient() {
        var builder = ExpoPushNotificationClient.builder()
                .setHttpClient(HttpClients.createDefault());
        if (!accessToken.isBlank()) {
            builder.setAccessToken(accessToken);
        }
        return builder.build();
    }
}

