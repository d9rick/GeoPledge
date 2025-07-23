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
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
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
        
        return undefined;
    };

    const validatePassword = (password: string): string | undefined => {
        if (!password) {
            return 'Password is required';
        }
        
        if (password.length < 6) {
            return 'Password must be at least 6 characters';
        }
        
        return undefined;
    };

    // Announce error to screen readers
    const announceError = (message: string) => {
        if (Platform.OS !== 'web') {
            AccessibilityInfo.announceForAccessibility(message);
        }
    };

    const triggerShake = () => {
        Animated.sequence([
            Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: -10, duration: 100, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: 0, duration: 100, useNativeDriver: true }),
        ]).start();
    };

    const handleLogin = async () => {
        setValidationErrors({});
        setNetworkError(null);

        const emailError = validateEmail(email);
        const passwordError = validatePassword(password);

        if (emailError || passwordError) {
            const errors: ValidationErrors = {};
            if (emailError) errors.email = emailError;
            if (passwordError) errors.password = passwordError;
            setValidationErrors(errors);
            announceError(emailError || passwordError || 'Please correct the errors.');
            triggerShake();
            return;
        }

        setIsSubmitting(true);

        try {
            await signIn(email.trim(), password);
            router.replace('/pledges');
        } catch (err: any) {
            const categorizedError = categorizeError(err, 'login');
            setNetworkError(categorizedError);
            announceError(categorizedError.message);
            triggerShake();

            if (categorizedError.type === 'authentication' || categorizedError.type === 'server' || categorizedError.type === 'network') {
                Alert.alert(
                    categorizedError.type.charAt(0).toUpperCase() + categorizedError.type.slice(1) + ' Error',
                    categorizedError.message,
                    [{ text: 'OK' }]
                );
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.innerContainer}>
                    <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnimation }] }]}>
                        <Text style={styles.title}>Log In</Text>

                        {/* Email Input */}
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={[styles.input, validationErrors.email ? styles.inputError : null]}
                                placeholder="Email / Username"
                                placeholderTextColor="#555"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                                editable={!isSubmitting}
                            />
                            {validationErrors.email && <Text style={styles.errorText}>{validationErrors.email}</Text>}
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputWrapper}>
                             <View style={[styles.input, styles.passwordContainer, validationErrors.password ? styles.inputError : null]}>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="Password"
                                    placeholderTextColor="#555"
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    value={password}
                                    onChangeText={setPassword}
                                    editable={!isSubmitting}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                    <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color="#555" />
                                </TouchableOpacity>
                            </View>
                            {validationErrors.password && <Text style={styles.errorText}>{validationErrors.password}</Text>}
                        </View>
                        
                        {/* Forgot Password */}
                        <TouchableOpacity style={styles.forgotPasswordContainer}>
                            <Text style={styles.forgotPasswordText}>forgot password?</Text>
                        </TouchableOpacity>

                        {/* Login Button */}
                        <TouchableOpacity
                            style={[styles.button, isSubmitting ? styles.buttonDisabled : null]}
                            onPress={handleLogin}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Login</Text>
                            )}
                        </TouchableOpacity>
                        
                         {/* General Error Display */}
                        {networkError && (
                            <View style={styles.networkErrorContainer}>
                                <Text style={styles.networkErrorText}>{networkError.message}</Text>
                            </View>
                        )}

                        {/* Sign Up Link */}
                         <View style={styles.footer}>
                            <Text style={styles.footerText}>Don't have an account? </Text>
                            <TouchableOpacity
                                onPress={() => router.push('/signup')}
                                disabled={isSubmitting}
                            >
                                <Text style={styles.link}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>

                    </Animated.View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff', // Or a background color that fits the theme
    },
    innerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        width: 322,
        height: 'auto',
        backgroundColor: '#fe7743',
        borderRadius: 20,
        borderWidth: 0.5,
        borderColor: '#000',
        paddingVertical: 30,
        paddingHorizontal: 33,
        alignItems: 'center',
    },
    title: {
        fontFamily: 'SpaceMono-Regular',
        fontSize: 16,
        color: '#000',
        marginBottom: 33,
    },
    inputWrapper: {
        width: '100%',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        height: 39,
        backgroundColor: '#d9d9d9',
        borderRadius: 20,
        borderWidth: 0.5,
        borderColor: '#000',
        paddingLeft: 26,
        fontFamily: 'SpaceMono-Regular',
        fontSize: 12,
        color: '#000',
    },
    inputError: {
        borderColor: '#ff0000',
        borderWidth: 1,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 0, // Remove padding to use TextInput's padding
    },
    passwordInput: {
        flex: 1,
        height: '100%',
        paddingLeft: 26,
        fontFamily: 'SpaceMono-Regular',
        fontSize: 12,
        color: '#000',
    },
    eyeIcon: {
        padding: 8,
        marginRight: 8,
    },
    errorText: {
        color: 'white',
        fontFamily: 'SpaceMono-Regular',
        fontSize: 12,
        marginTop: 5,
        textAlign: 'center',
    },
    forgotPasswordContainer: {
        marginBottom: 18,
    },
    forgotPasswordText: {
        fontFamily: 'SpaceMono-Regular',
        fontSize: 12,
        color: '#000',
        textDecorationLine: 'underline',
    },
    button: {
        width: '100%',
        height: 39,
        backgroundColor: '#447d9b',
        borderRadius: 20,
        borderWidth: 0.5,
        borderColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        fontFamily: 'SpaceMono-Regular',
        fontSize: 12,
        color: '#fff',
    },
    networkErrorContainer: {
        marginTop: 15,
        padding: 10,
        backgroundColor: 'rgba(255, 0, 0, 0.2)',
        borderRadius: 10,
    },
    networkErrorText: {
        color: 'white',
        fontFamily: 'SpaceMono-Regular',
        fontSize: 12,
        textAlign: 'center',
    },
    footer: {
        flexDirection: 'row',
        marginTop: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        fontFamily: 'SpaceMono-Regular',
        fontSize: 12,
        color: '#000',
    },
    link: {
        fontFamily: 'SpaceMono-Regular',
        fontSize: 12,
        color: '#000',
        textDecorationLine: 'underline',
        fontWeight: 'bold',
    },
});