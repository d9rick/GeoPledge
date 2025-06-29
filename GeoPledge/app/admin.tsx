// app/admin.tsx
import React, { useContext, useEffect, useState } from 'react';
import {ScrollView, View, Text, Button, StyleSheet, Alert} from 'react-native';
import { AuthContext } from '@/contexts/AuthContext';
import { jwtDecode } from 'jwt-decode';
import api from '../utils/api';
import { registerForPushNotificationsAsync } from '@/utils/pushNotifications';

export default function AdminPage() {
    const { userToken } = useContext(AuthContext);
    const [userId, setUserId] = useState<string | null>(null);
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
    const [testResult, setTestResult] = useState<string>('');

    // 1️⃣ Decode userId from JWT
    useEffect(() => {
        if (userToken) {
            try {
                const payload: any = jwtDecode(userToken);
                setUserId(payload.sub ?? null);
            } catch {
                setUserId(null);
            }
        }
    }, [userToken]);

    // 2️⃣ Handler to re-register for push token
    const handleGetExpoToken = async () => {
        try {
            // 1️⃣ Ask Expo for a push token
            const token = await registerForPushNotificationsAsync();
            console.log('[AdminPage] Expo token:', token);
            setExpoPushToken(token);

            // 2️⃣ POST it to your backend
            if (token && userId && userToken) {
                console.log('[AdminPage] Sending token to server for user', userId);
                const response = await api.post(
                    `/api/users/${userId}/push-token`,
                    { token },
                    { headers: { Authorization: `Bearer ${userToken}` } }
                );
                console.log('[AdminPage] Server response:', response.status, response.data);
                Alert.alert('Success', 'Push token saved on server!');
            } else {
                Alert.alert('Error', 'Missing token, userId or JWT');
            }

        } catch (error: any) {
            console.error('[AdminPage] Error saving push token:', error);
            Alert.alert('Error', error.message || 'Failed to save push token');
        }
    };

    // 3️⃣ Handler to call your test-push endpoint
    const handleTestPush = async () => {
        if (!userId) {
            setTestResult('❌ no userId decoded');
            return;
        }
        try {
            const res = await api.get(`/api/test/push/${userId}`);
            setTestResult(JSON.stringify(res.data));
        } catch (err: any) {
            setTestResult(`Error: ${err.message}`);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>🛠️ Admin Test Page</Text>

            <Text style={styles.label}>JWT:</Text>
            <Text selectable style={styles.value}>
                {userToken ?? '– not signed in –'}
            </Text>

            <Text style={styles.label}>User ID:</Text>
            <Text selectable style={styles.value}>
                {userId ?? '– unknown –'}
            </Text>

            <View style={styles.spacer}>
                <Button title="Get Expo Push Token" onPress={handleGetExpoToken} />
            </View>
            {expoPushToken ? (
                <>
                    <Text style={styles.label}>Expo Push Token:</Text>
                    <Text selectable style={styles.value}>{expoPushToken}</Text>
                </>
            ) : null}

            <View style={styles.spacer}>
                <Button title="Test Push Notification" onPress={handleTestPush} />
            </View>
            {testResult ? (
                <>
                    <Text style={styles.label}>Test Result:</Text>
                    <Text selectable style={styles.value}>{testResult}</Text>
                </>
            ) : null}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16 },
    header:    { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
    label:     { fontWeight: '600', marginTop: 12 },
    value:     { marginTop: 4, marginBottom: 8, color: '#333' },
    spacer:    { marginVertical: 8 },
});
