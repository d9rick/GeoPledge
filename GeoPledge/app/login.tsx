// /app/login.tsx
import { AuthContext, useAuth } from '@/contexts/AuthContext';
import { categorizeError } from '@/utils/errorHandling';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import {
    AccessibilityInfo,
    ActivityIndicator,
    Alert,
    Animated,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export const screenOptions = {
    headerShown: false,
};

// Error types for better categorization
type ErrorType = 
    | 'validation'
    | 'network'
    | 'authentication'
    | 'server'
    | 'unknown';

interface ValidationErrors {
    email?: string;
    password?: string;
    general?: string;
}

interface NetworkError {
    type: ErrorType;
    message: string;
    retryable: boolean;
}

export default function LoginScreen() {
    const router = useRouter();
    const { signIn } = useContext(AuthContext);
    const { userToken } = useAuth();
    
    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Error state
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [networkError, setNetworkError] = useState<NetworkError | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    
    // Focus state for better UX
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);

    // Add to component state
    const [shakeAnimation] = useState(new Animated.Value(0));

    useEffect(() => {
        // Redirect to map if user is already logged in
        if (userToken) {
            router.replace('/pledges');
        }
    }, [userToken]);

    // Clear errors when user starts typing
    useEffect(() => {
        if (email && validationErrors.email) {
            setValidationErrors((prev: ValidationErrors) => ({ ...prev, email: undefined }));
        }
    }, [email]);

    useEffect(() => {
        if (password && validationErrors.password) {
            setValidationErrors((prev: ValidationErrors) => ({ ...prev, password: undefined }));
        }
    }, [password]);

    // Input validation
    const validateEmail = (email: string): string | undefined => {
        if (!email.trim()) {
            return 'Email is required';
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return 'Please enter a valid email address';
        }
        
        if (email.length > 254) {
            return 'Email is too long';
        }
        
        return undefined;
    };

    const validatePassword = (password: string): string | undefined => {
        if (!password) {
            return 'Password is required';
        }
        
        if (password.length < 6) {
            return 'Password must be at least 6 characters';
        }
        
        if (password.length > 128) {
            return 'Password is too long';
        }
        
        return undefined;
    };

    // Announce error to screen readers
    const announceError = (message: string) => {
        if (Platform.OS === 'ios') {
            AccessibilityInfo.announceForAccessibility(message);
        }
    };

    const triggerShake = () => {
        Animated.sequence([
            Animated.timing(shakeAnimation, {
                toValue: 10,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(shakeAnimation, {
                toValue: -10,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(shakeAnimation, {
                toValue: 10,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(shakeAnimation, {
                toValue: 0,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handleLogin = async () => {
        setValidationErrors({});
        setNetworkError(null);

        // Validate inputs
        const emailError = validateEmail(email);
        const passwordError = validatePassword(password);

        if (emailError || passwordError) {
            const errors: ValidationErrors = {};
            if (emailError) errors.email = emailError;
            if (passwordError) errors.password = passwordError;
            setValidationErrors(errors);
            announceError(emailError || passwordError);
            return;
        }

        setIsSubmitting(true);

        try {
            await signIn(email.trim(), password);
            router.replace('/pledges');
        } catch (err: any) {
            console.log('handleLogin error:', err);
            console.log('error.response:', err.response);
            console.log('error.status:', err.status);
            console.log('error.data:', err.data);
            const categorizedError = categorizeError(err, 'login');
            setNetworkError(categorizedError);
            announceError(categorizedError.message);

            // Show alert for authentication errors
            if (categorizedError.type === 'authentication') {
                Alert.alert(
                    'Login Failed',
                    categorizedError.message,
                    [{ text: 'OK', style: 'default' }]
                );
                triggerShake();
            }
            // Show alert for network/server errors
            else if (categorizedError.type === 'server' || categorizedError.type === 'network') {
                Alert.alert(
                    'Connection Error',
                    categorizedError.message,
                    [
                        { text: 'OK', style: 'default' },
                        ...(categorizedError.retryable ? [{ text: 'Retry', onPress: handleLogin }] : [])
                    ]
                );
            }

            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRetry = () => {
        if (networkError?.retryable) {
            handleLogin();
        }
    };

    const getInputStyle = (field: 'email' | 'password', focused: boolean) => {
        const hasError = validationErrors[field];
        
        return {
            ...styles.input,
            ...(hasError && styles.inputError),
            ...(focused && !hasError && styles.inputFocused),
        };
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView 
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <Animated.View 
                    style={[
                        styles.formContainer,
                        { transform: [{ translateX: shakeAnimation }] }
                    ]}
                >
                    <View style={styles.form}>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Sign in to continue with your pledges</Text>

                        {/* Email Field */}
                        <Text style={styles.label}>Email</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={getInputStyle('email', emailFocused)}
                                placeholder="you@example.com"
                                placeholderTextColor="#999"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                autoComplete="email"
                                value={email}
                                onChangeText={setEmail}
                                onFocus={() => setEmailFocused(true)}
                                onBlur={() => setEmailFocused(false)}
                                editable={!isSubmitting}
                                accessibilityLabel="Email input field"
                                accessibilityHint="Enter your email address"
                                accessibilityRole="text"
                            />
                            {validationErrors.email && (
                                <MaterialIcons name="error" size={20} color="#DC3545" style={styles.errorIcon} />
                            )}
                        </View>
                        {validationErrors.email && (
                            <Text style={styles.errorText} accessibilityRole="alert">
                                {validationErrors.email}
                            </Text>
                        )}

                        {/* Password Field */}
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={[getInputStyle('password', passwordFocused), styles.passwordInput]}
                                placeholder="Enter your password"
                                placeholderTextColor="#999"
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                autoCorrect={false}
                                autoComplete="password"
                                value={password}
                                onChangeText={setPassword}
                                onFocus={() => setPasswordFocused(true)}
                                onBlur={() => setPasswordFocused(false)}
                                editable={!isSubmitting}
                                accessibilityLabel="Password input field"
                                accessibilityHint="Enter your password"
                                accessibilityRole="text"
                            />
                            <TouchableOpacity
                                style={styles.eyeIcon}
                                onPress={() => setShowPassword(!showPassword)}
                                disabled={isSubmitting}
                                accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                                accessibilityRole="button"
                            >
                                <MaterialIcons 
                                    name={showPassword ? "visibility" : "visibility-off"} 
                                    size={20} 
                                    color="#666" 
                                />
                            </TouchableOpacity>
                            {validationErrors.password && (
                                <MaterialIcons name="error" size={20} color="#DC3545" style={styles.errorIcon} />
                            )}
                        </View>
                        {validationErrors.password && (
                            <Text style={styles.errorText} accessibilityRole="alert">
                                {validationErrors.password}
                            </Text>
                        )}

                        {/* Network Error Display */}
                        {networkError && (
                            <View style={styles.networkErrorContainer}>
                                <MaterialIcons 
                                    name={networkError.type === "network" ? "wifi-off" : "error"} 
                                    size={20} 
                                    color="#DC3545" 
                                />
                                <Text style={styles.networkErrorText} accessibilityRole="alert">
                                    {networkError.message}
                                </Text>
                                {networkError.retryable && (
                                    <TouchableOpacity
                                        style={styles.retryButton}
                                        onPress={handleRetry}
                                        disabled={isSubmitting}
                                        accessibilityLabel="Retry login"
                                        accessibilityRole="button"
                                    >
                                        <Text style={styles.retryButtonText}>Retry</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        {/* Login Button */}
                        <TouchableOpacity
                            style={[
                                styles.loginButton,
                                isSubmitting && styles.loginButtonDisabled
                            ]}
                            onPress={handleLogin}
                            disabled={isSubmitting}
                            accessibilityLabel="Login button"
                            accessibilityRole="button"
                            accessibilityState={{ disabled: isSubmitting }}
                        >
                            {isSubmitting ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="small" color="#fff" />
                                    <Text style={styles.loginButtonText}>Logging in...</Text>
                                </View>
                            ) : (
                                <Text style={styles.loginButtonText}>Log In</Text>
                            )}
                        </TouchableOpacity>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Don't have an account? </Text>
                            <TouchableOpacity
                                onPress={() => router.push('/signup')}
                                disabled={isSubmitting}
                                accessibilityLabel="Navigate to sign up page"
                                accessibilityRole="button"
                            >
                                <Text style={styles.link}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#f8f9fa'
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    formContainer: {
        width: '90%',
        maxWidth: 400,
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    title: { 
        fontSize: 28, 
        fontWeight: '700', 
        marginBottom: 8, 
        textAlign: 'center',
        color: '#1a1a1a'
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 32,
    },
    label: { 
        marginTop: 16, 
        fontWeight: '600', 
        color: '#333',
        fontSize: 16,
    },
    inputContainer: {
        position: 'relative',
        marginTop: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 16,
        fontSize: 16,
        backgroundColor: '#fff',
        color: '#333',
    },
    passwordInput: {
        paddingRight: 50, // Space for eye icon
    },
    inputFocused: {
        borderColor: '#007AFF',
        borderWidth: 2,
    },
    inputError: {
        borderColor: '#DC3545',
        borderWidth: 2,
    },
    eyeIcon: {
        position: 'absolute',
        right: 12,
        top: 16,
        padding: 4,
    },
    errorIcon: {
        position: 'absolute',
        right: 12,
        top: 16,
    },
    errorText: {
        color: '#DC3545',
        fontSize: 14,
        marginTop: 4,
        marginLeft: 4,
    },
    networkErrorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8D7DA',
        borderColor: '#F5C6CB',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginTop: 16,
        flexWrap: 'wrap',
    },
    networkErrorText: {
        color: '#721C24',
        fontSize: 14,
        flex: 1,
        marginLeft: 8,
    },
    retryButton: {
        backgroundColor: '#DC3545',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        marginLeft: 8,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    loginButton: {
        backgroundColor: '#007AFF',
        marginTop: 24,
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    loginButtonDisabled: {
        opacity: 0.6,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 8,
    },
    footer: { 
        flexDirection: 'row', 
        justifyContent: 'center', 
        marginTop: 24,
        flexWrap: 'wrap',
    },
    footerText: {
        color: '#666',
        fontSize: 16,
    },
    link: { 
        color: '#007AFF', 
        fontWeight: '600',
        fontSize: 16,
    },
});