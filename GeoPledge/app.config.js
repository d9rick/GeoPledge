require('dotenv').config({ path: '../.env' });

export default {
    "expo": {
        "name": "GeoPledge",
        "slug": "GeoPledge",
        "version": "1.0.0",
        "orientation": "portrait",
        "icon": "./assets/images/icon.png",
        "scheme": "geopledge",
        "userInterfaceStyle": "automatic",
        "splash": {
            "image": "./assets/images/splash-icon.png",
            "resizeMode": "contain",
            "backgroundColor": "#ffffff"
        },
        "ios": {
            "supportsTablet": true,
            "bundleIdentifier": "com.geopledge",
            "config": {
                "googleMapsApiKey": process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
            },
            "infoPlist": {
                "NSLocationAlwaysAndWhenInUseUsageDescription": "GeoPledge needs your location to verify pledges, even when the app is closed.",
                "NSLocationWhenInUseUsageDescription": "GeoPledge needs your location to verify pledges.",
                "UIBackgroundModes": ["location", "fetch"]
            }
        },
        "android": {
            "adaptiveIcon": {
                "foregroundImage": "./assets/images/adaptive-icon.png",
                "backgroundColor": "#ffffff"
            },
            "config": {
                "googleMaps": {
                    "apiKey": process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
                }
            }
        },
        "web": {
            "bundler": "metro",
            "output": "static",
            "favicon": "./assets/images/favicon.png"
        },
        "plugins": [
            "expo-router",
            "expo-secure-store"
        ],
        "experiments": {
            "typedRoutes": true
        },
        "extra": {
            "eas": {
                "projectId": "130ece70-6802-489a-8159-210e1ceb645e"
            },
            "EXPO_PUBLIC_GOOGLE_MAPS_API_KEY": process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
        }
    }
};
