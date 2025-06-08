// /app/index.tsx
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
    const { userToken, isLoading } = useAuth();

    // Show loading while checking auth
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    // Redirect based on auth state
    if (userToken) {
        return <Redirect href="/pledges" />;
    } else {
        return <Redirect href="/login" />;
    }
}