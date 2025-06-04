// /app/_layout.tsx
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

function AppStack() {
    const { userToken, isLoading } = useAuth();

    console.log('AppStack render - isLoading:', isLoading, 'userToken:', userToken ? 'exists' : 'null');

    // Show loading screen while checking authentication
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    // Show different stacks based on authentication state
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            {!userToken ? (
                // Not authenticated - show auth screens
                <>
                    <Stack.Screen name="login" />
                    <Stack.Screen name="signup" />
                </>
            ) : (
                // Authenticated - show app screens
                <>
                    <Stack.Screen
                        name="map"
                        options={{
                            headerShown: true,
                            title: 'Pick a Location'
                        }}
                    />
                </>
            )}
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