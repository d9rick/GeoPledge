// /utils/api.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from "react-native";

const API_BASE_URL = Platform.select({
    ios: 'http://10.21.175.179:8080',
    android: 'http://10.21.175.179:8080',
    web: 'http://localhost:8080'
});

console.log('API Base URL:', API_BASE_URL);

// Create an axios instance
const api = axios.create({
    baseURL: `${API_BASE_URL}/`,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
});

// Request interceptor to add Authorization header
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (token) {
                config.headers!['Authorization'] = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error retrieving token from SecureStore:', error);
        }

        // Log outgoing requests for debugging
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        if (config.data) {
            console.log('Request data:', config.data);
        }

        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for debugging
api.interceptors.response.use(
    (response) => {
        // Log successful responses
        console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
        return response;
    },
    (error) => {
        // Log error responses
        if (error.response) {
            console.error(`API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} - Status: ${error.response.status}`);
            console.error('Error data:', error.response.data);
        } else if (error.request) {
            console.error('API Error: No response received');
            console.error('Request URL:', error.config?.url);
            console.error('This usually means the server is not running or not reachable');
        } else {
            console.error('API Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default api;