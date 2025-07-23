// /app/_layout.tsx
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

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
        <Stack screenOptions={{
            headerShown: false,
            headerBackVisible: false,
        }}>
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
            <Stack.Screen
                name="admin"
                options={{
                    headerShown: true,
                    title: 'Admin',
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
