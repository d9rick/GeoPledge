// /app/signup.tsx
import { AuthContext, useAuth } from '@/contexts/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import {
    AccessibilityInfo,
    ActivityIndicator,
    Alert,
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
    confirmPassword?: string;
    general?: string;
}

interface NetworkError {
    type: ErrorType;
    message: string;
    retryable: boolean;
}

export default function SignUpScreen() {
    const router = useRouter();
    const { signUp } = useContext(AuthContext);
    const { userToken } = useAuth();
    
    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Error state
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [networkError, setNetworkError] = useState<NetworkError | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // Focus state for better UX
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

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

    useEffect(() => {
        if (confirmPassword && validationErrors.confirmPassword) {
            setValidationErrors((prev: ValidationErrors) => ({ ...prev, confirmPassword: undefined }));
        }
    }, [confirmPassword]);

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
        
        // Check for common weak passwords
        const weakPasswords = ['password', '123456', 'qwerty', 'abc123'];
        if (weakPasswords.includes(password.toLowerCase())) {
            return 'Please choose a stronger password';
        }
        
        return undefined;
    };

    const validateConfirmPassword = (confirmPassword: string, password: string): string | undefined => {
        if (!confirmPassword) {
            return 'Please confirm your password';
        }
        
        if (confirmPassword !== password) {
            return 'Passwords do not match';
        }
        
        return undefined;
    };

    // Network error categorization
    const categorizeError = (error: any): NetworkError => {
        if (!error.response) {
            // Network error - no response received
            return {
                type: 'network',
                message: 'Unable to connect to server. Please check your internet connection and try again.',
                retryable: true
            };
        }

        const status = error.response.status;
        const data = error.response.data;

        switch (status) {
            case 400:
                return {
                    type: 'validation',
                    message: data?.message || 'Invalid request. Please check your input.',
                    retryable: false
                };
            case 409:
                return {
                    type: 'authentication',
                    message: 'An account with this email already exists. Please try logging in instead.',
                    retryable: false
                };
            case 404:
                return {
                    type: 'server',
                    message: 'Signup service not found. Please try again later.',
                    retryable: true
                };
            case 429:
                return {
                    type: 'authentication',
                    message: 'Too many signup attempts. Please wait a few minutes before trying again.',
                    retryable: true
                };
            case 500:
            case 502:
            case 503:
            case 504:
                return {
                    type: 'server',
                    message: 'Server is temporarily unavailable. Please try again in a few minutes.',
                    retryable: true
                };
            default:
                return {
                    type: 'unknown',
                    message: 'An unexpected error occurred. Please try again.',
                    retryable: true
                };
        }
    };

    // Announce error to screen readers
    const announceError = (message: string) => {
        if (Platform.OS === 'ios') {
            AccessibilityInfo.announceForAccessibility(message);
        }
    };

    const handleSignUp = async () => {
        // Clear previous errors
        setValidationErrors({});
        setNetworkError(null);

        // Validate inputs
        const emailError = validateEmail(email);
        const passwordError = validatePassword(password);
        const confirmPasswordError = validateConfirmPassword(confirmPassword, password);

        if (emailError || passwordError || confirmPasswordError) {
            const errors: ValidationErrors = {};
            if (emailError) errors.email = emailError;
            if (passwordError) errors.password = passwordError;
            if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;
            
            setValidationErrors(errors);
            
            // Announce first error to screen reader
            const firstError = emailError || passwordError || confirmPasswordError;
            if (firstError) {
                announceError(firstError);
            }
            return;
        }

        setIsSubmitting(true);
        
        try {
            await signUp(email.trim(), password);
            // Navigation will be handled automatically by _layout.tsx
        } catch (error: any) {
            const categorizedError = categorizeError(error);
            setNetworkError(categorizedError);
            
            // Announce error to screen reader
            announceError(categorizedError.message);
            
            // Show additional alert for critical errors
            if (categorizedError.type === 'server' || categorizedError.type === 'network') {
                Alert.alert(
                    'Connection Error',
                    categorizedError.message,
                    [
                        { text: 'OK', style: 'default' },
                        ...(categorizedError.retryable ? [{ text: 'Retry', onPress: handleSignUp }] : [])
                    ]
                );
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRetry = () => {
        if (networkError?.retryable) {
            handleSignUp();
        }
    };

    const getInputStyle = (field: 'email' | 'password' | 'confirmPassword', focused: boolean) => {
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
                <View style={styles.form}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join GeoPledge to start making location-based commitments</Text>

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
                            placeholder="Create a password"
                            placeholderTextColor="#999"
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoComplete="new-password"
                            value={password}
                            onChangeText={setPassword}
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={() => setPasswordFocused(false)}
                            editable={!isSubmitting}
                            accessibilityLabel="Password input field"
                            accessibilityHint="Create a password"
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

                    {/* Confirm Password Field */}
                    <Text style={styles.label}>Confirm Password</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={[getInputStyle('confirmPassword', confirmPasswordFocused), styles.passwordInput]}
                            placeholder="Confirm your password"
                            placeholderTextColor="#999"
                            secureTextEntry={!showConfirmPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            onFocus={() => setConfirmPasswordFocused(true)}
                            onBlur={() => setConfirmPasswordFocused(false)}
                            editable={!isSubmitting}
                            accessibilityLabel="Confirm password input field"
                            accessibilityHint="Confirm your password"
                            accessibilityRole="text"
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={isSubmitting}
                            accessibilityLabel={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                            accessibilityRole="button"
                        >
                            <MaterialIcons 
                                name={showConfirmPassword ? "visibility" : "visibility-off"} 
                                size={20} 
                                color="#666" 
                            />
                        </TouchableOpacity>
                        {validationErrors.confirmPassword && (
                            <MaterialIcons name="error" size={20} color="#DC3545" style={styles.errorIcon} />
                        )}
                    </View>
                    {validationErrors.confirmPassword && (
                        <Text style={styles.errorText} accessibilityRole="alert">
                            {validationErrors.confirmPassword}
                        </Text>
                    )}

                    {/* Network Error Display */}
                    {networkError && (
                        <View style={styles.networkErrorContainer}>
                            <MaterialIcons 
                                name={networkError.retryable ? "wifi-off" : "error"} 
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
                                    accessibilityLabel="Retry signup"
                                    accessibilityRole="button"
                                >
                                    <Text style={styles.retryButtonText}>Retry</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {/* Sign Up Button */}
                    <TouchableOpacity
                        style={[styles.button, isSubmitting && styles.buttonDisabled]}
                        onPress={handleSignUp}
                        disabled={isSubmitting}
                        accessibilityLabel="Create account button"
                        accessibilityRole="button"
                        accessibilityHint="Tap to create your account"
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.buttonText}>Create Account</Text>
                        )}
                    </TouchableOpacity>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <TouchableOpacity
                            onPress={() => router.push('/login')}
                            disabled={isSubmitting}
                            accessibilityLabel="Navigate to login page"
                            accessibilityRole="button"
                        >
                            <Text style={styles.link}>Log In</Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
    form: {
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
        borderColor: '#28A745',
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
    button: {
        backgroundColor: '#28A745',
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
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: { 
        color: 'white', 
        fontWeight: '600', 
        fontSize: 16,
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