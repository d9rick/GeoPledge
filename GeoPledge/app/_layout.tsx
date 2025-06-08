// /app/_layout.tsx
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

function AppStack() {
    const { userToken, isLoading } = useAuth();

    console.log(
        'AppStack render - isLoading:',
        isLoading,
        'userToken:',
        userToken ? 'exists' : 'null'
    );

    // 1) show a loading spinner while we're checking AsyncStorage for token
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    // 2) once isLoading===false, render the appropriate Stack.Screens
    return (
        <Stack screenOptions={{ headerShown: false }}>
            {/* Always include index */}
            <Stack.Screen name="index" />

            {/* Mount all screens */}
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
            <Stack.Screen
                name="pledges"
                options={{
                    headerShown: true,
                    title: 'Your Pledges',
                }}
            />
            <Stack.Screen
                name="map"
                options={{
                    headerShown: true,
                    title: 'Pick a Location',
                }}
            />

        </Stack>
    );
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <AppStack />
        </AuthProvider>
    );
}
