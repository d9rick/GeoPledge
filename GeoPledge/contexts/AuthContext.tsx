// /contexts/AuthContext.tsx
import React, {
    createContext,
    useState,
    useEffect,
    ReactNode,
    useContext,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../utils/api';
import { Alert } from 'react-native';

type AuthContextType = {
    userToken: string | null;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    userToken: null,
    isLoading: true,
    signIn: async () => {},
    signUp: async () => {},
    signOut: async () => {},
});

export function useAuth() {
    return useContext(AuthContext);
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [userToken, setUserToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSigningUp, setIsSigningUp] = useState(false);

    // On mount, load any existing token from SecureStore
    useEffect(() => {
        const loadToken = async () => {
            console.log('AuthContext: Starting to load token...');
            try {
                const token = await SecureStore.getItemAsync('userToken');
                console.log('AuthContext: Token loaded:', token ? 'Token exists' : 'No token');
                if (token) {
                    setUserToken(token);
                }
            } catch (e) {
                console.warn('Error reading token from SecureStore', e);
            } finally {
                console.log('AuthContext: Setting isLoading to false');
                setIsLoading(false);
            }
        };
        loadToken();
    }, []);

    const signIn = async (email: string, password: string) => {
        try {
            const res = await api.post('/api/auth/login', { email, password });

            // Debug logging to see what the server returns
            console.log('Login response:', res.data);

            // The backend returns { token: "xxx", tokenType: "Bearer" }
            const token = res.data?.token;

            // Validate that token exists and is a string
            if (!token) {
                console.error('Server response:', res.data);
                throw new Error('No token received from server');
            }

            if (typeof token !== 'string') {
                console.error('Token received is not a string:', typeof token, token);
                throw new Error(`Token must be a string, received ${typeof token}`);
            }

            // Store the token
            await SecureStore.setItemAsync('userToken', token);
            setUserToken(token);

        } catch (err: any) {
            console.error('Login failed:', err);

            // Check if it's a SecureStore error
            if (err.message?.includes('Invalid value provided to SecureStore')) {
                Alert.alert(
                    'Login Error',
                    'Authentication token format error. Please contact support.'
                );
            } else if (err.response?.data?.message) {
                // Backend error message (e.g., "Error: Invalid password")
                Alert.alert('Login Error', err.response.data.message);
            } else if (err.response?.status === 404) {
                Alert.alert('Login Error', 'Server not found. Please check your connection.');
            } else {
                Alert.alert('Login Error', err.message || 'Unable to log in');
            }
            throw err;
        }
    };

    const signUp = async (email: string, password: string) => {
        // Prevent multiple signup attempts
        if (isSigningUp) return;

        setIsSigningUp(true);
        try {
            const res = await api.post('/api/auth/signup', { email, password });

            // Debug logging
            console.log('Signup response:', res.data);

            // Backend returns { message: "User registered successfully!" }
            // No token is returned from signup, so we need to login
            if (res.data?.message) {
                console.log('Signup successful, logging in...');
                // Auto-login after successful signup
                await signIn(email, password);
            } else {
                throw new Error('Unexpected response from signup');
            }

        } catch (err: any) {
            console.error('Sign Up failed:', err);

            // Handle specific backend errors
            if (err.response?.data?.message) {
                // Backend error (e.g., "Error: Email is already in use!")
                Alert.alert('Sign Up Error', err.response.data.message);
            } else if (err.response?.status === 404) {
                Alert.alert('Sign Up Error', 'Server not found. Please check your connection.');
            } else if (err.message && !err.message.includes('Login failed')) {
                // Don't show login errors during signup auto-login
                Alert.alert('Sign Up Error', err.message);
            }
            throw err;
        } finally {
            setIsSigningUp(false);
        }
    };

    const signOut = async () => {
        if (!userToken) {
            console.warn('No user token found, skipping logout');
            return setUserToken(null);
        }
        try {
            await api.post('/api/auth/logout');
        } catch (err) {
            console.warn('Logout request failed', err);
            // Continue with local logout even if server request fails
        } finally {
            // Always clear local token
            try {
                await SecureStore.deleteItemAsync('userToken');
            } catch (e) {
                console.error('Error deleting token from SecureStore:', e);
            }
            setUserToken(null);
        }
    };

    return (
        <AuthContext.Provider value={{ userToken, isLoading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext };