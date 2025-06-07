// /app/login.tsx
import React, {useState, useContext, useEffect} from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext, useAuth } from '@/contexts/AuthContext';

export const screenOptions = {
    headerShown: false,
};

export default function LoginScreen() {
    const router = useRouter();
    const { signIn } = useContext(AuthContext);
    const { userToken } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Redirect to map if user is already logged in
        if (userToken) {
            router.replace('/map');
        }
    })

    const handleLogin = async () => {
        if (!email || !password) {
            alert('Please enter both email and password.');
            return;
        }

        setIsSubmitting(true);
        try {
            await signIn(email.trim(), password);
            router.replace('/map');
        } catch {
            // Error is already handled in signIn
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.form}>
                <Text style={styles.title}>Log In</Text>

                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    editable={!isSubmitting}
                />

                <Text style={styles.label}>Password</Text>
                <TextInput
                    style={styles.input}
                    placeholder="password"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    editable={!isSubmitting}
                />

                <TouchableOpacity
                    style={[styles.button, isSubmitting && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.buttonText}>Log In</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text>Don&#39;t have an account? </Text>
                    <TouchableOpacity
                        onPress={() => router.push('/signup')}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.link}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    form: {
        width: '85%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 8,
        elevation: 3,
    },
    title: { fontSize: 24, fontWeight: '600', marginBottom: 20, textAlign: 'center' },
    label: { marginTop: 12, fontWeight: '500', color: '#333' },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 10,
        marginTop: 6,
    },
    button: {
        backgroundColor: '#007AFF',
        marginTop: 20,
        paddingVertical: 12,
        borderRadius: 6,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: { color: 'white', fontWeight: '600', textAlign: 'center' },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
    link: { color: '#007AFF', fontWeight: '500' },
});