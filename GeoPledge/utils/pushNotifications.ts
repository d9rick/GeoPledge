// utils/pushNotifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

export async function registerForPushNotificationsAsync(): Promise<string | null> {
    if (!Device.isDevice) {
        console.warn('Must use a physical device to get push tokens');
        return null;
    }

    // 1) Ask for permission
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    if (finalStatus !== 'granted') {
        console.warn('Push notification permission not granted');
        return null;
    }

    // get the project id
    const projectId = Constants?.expoConfig?.extra?.eas.projectId;

    if (!projectId) {
        console.warn('Error getting projectId');
    }

    // 2) Get the token
    const tokenData = await Notifications.getExpoPushTokenAsync(projectId);
    return tokenData.data;
}