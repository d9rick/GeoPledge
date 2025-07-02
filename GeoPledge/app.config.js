import 'dotenv/config';

export default {
    expo: {
        name: "GeoPledge",
        slug: "GeoPledge",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/images/icon.png",
        scheme: "geopledge",
        userInterfaceStyle: "automatic",
        newArchEnabled: true,
        ios: {
            supportsTablet: true,
            config: {
                googleMapsApiKey: process.env.MAPS_API_KEY,
            },
            infoPlist: {
                NSLocationAlwaysAndWhenInUseUsageDescription:
                    "GeoPledge needs your location to verify pledges, even when the app is closed.",
                NSLocationWhenInUseUsageDescription:
                    "GeoPledge needs your location to verify pledges.",
                UIBackgroundModes: ["location", "fetch"]
            },
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/images/adaptive-icon.png",
                backgroundColor: "#ffffff"
            },
            edgeToEdgeEnabled: true,
            config: {
                googleMaps: {
                    apiKey: process.env.MAPS_API_KEY,
                }
            }
        },
        web: {
            bundler: "metro",
            output: "static",
            favicon: "./assets/images/favicon.png",
            config: {
                // Disable react-native-maps on web
                resolver: {
                    alias: {
                        'react-native-maps': 'react-native-web'
                    }
                }
            }
        },
        plugins: [
            "expo-router",
            [
                "expo-splash-screen",
                {
                    image: "./assets/images/splash-icon.png",
                    imageWidth: 200,
                    resizeMode: "contain",
                    backgroundColor: "#ffffff"
                }
            ],
            "expo-secure-store"
        ],
        experiments: {
            typedRoutes: true
        },
        owner: "d9rick",
        extra: {
          eas: {
              owner: "d9rick",
              projectId: "130ece70-6802-489a-8159-210e1ceb645e"
          }
        }
    },
    owner: "d9rick",
};
