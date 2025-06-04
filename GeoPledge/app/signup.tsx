// /app/signup.tsx
import React, { useState, useContext } from 'react';
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
import { Stack, useRouter } from 'expo-router';
import { AuthContext } from '../contexts/AuthContext';

export default function SignUpScreen() {
    const router = useRouter();
    const { signUp } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSignUp = async () => {
        if (!email || !password) {
            alert('Please enter both email and password.');
            return;
        }

        setIsSubmitting(true);
        try {
            await signUp(email.trim(), password);
            // Navigation will be handled automatically by _layout.tsx
        } catch (error) {
            // Error is already handled in signUp
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.form}>
                <Text style={styles.title}>Sign Up</Text>

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
                    placeholder="••••••••"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    editable={!isSubmitting}
                />

                <TouchableOpacity
                    style={[styles.button, isSubmitting && styles.buttonDisabled]}
                    onPress={handleSignUp}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.buttonText}>Create Account</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text>Already have an account? </Text>
                    <TouchableOpacity
                        onPress={() => router.push('/login')}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.link}>Log In</Text>
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
        backgroundColor: '#28A745',
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