// /app/signup.tsx
import { AuthContext } from '@/contexts/AuthContext';
import api from '@/utils/api';
import { categorizeError } from '@/utils/errorHandling';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import {
    AccessibilityInfo,
    ActivityIndicator,
    Animated,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
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
}

interface NetworkError {
    type: ErrorType;
    message: string;
    retryable: boolean;
}

export default function SignUpScreen() {
    const router = useRouter();
    const { signUp } = useContext(AuthContext);

    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [networkError, setNetworkError] = useState<NetworkError | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [shakeAnimation] = useState(new Animated.Value(0));

    const triggerShake = () => {
        Animated.sequence([
            Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: -10, duration: 100, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: 0, duration: 100, useNativeDriver: true }),
        ]).start();
    };

    const announceError = (message: string) => {
        if (Platform.OS !== 'web') {
            AccessibilityInfo.announceForAccessibility(message);
        }
    };
    
    const validateEmail = (email: string): string | undefined => {
        if (!email.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) return 'Please enter a valid email address';
        return undefined;
    };

    const handleContinue = async () => {
        setValidationErrors({});
        setNetworkError(null);
        const emailError = validateEmail(email);
        if (emailError) {
            setValidationErrors({ email: emailError });
            announceError(emailError);
            triggerShake();
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post('/api/auth/check-email', { email: email.trim() });
            setStep(2);
        } catch (err: any) {
            const categorized = categorizeError(err, 'check-email');
            if (categorized.type === 'authentication') { // Email exists
                 setValidationErrors({ email: categorized.message });
                 announceError(categorized.message);
                 triggerShake();
            } else {
                setNetworkError(categorized);
                announceError(categorized.message);
                triggerShake();
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const validatePasswords = () => {
        if (!password) return 'Password is required';
        if (password.length < 6) return 'Password must be at least 6 characters';
        if (password !== confirmPassword) return 'Passwords do not match';
        return undefined;
    }

    const handleSignUp = async () => {
        setValidationErrors({});
        setNetworkError(null);

        const passwordError = validatePasswords();
        if (passwordError) {
            setValidationErrors({ password: passwordError });
            announceError(passwordError);
            triggerShake();
            return;
        }

        setIsSubmitting(true);
        try {
            await signUp(email.trim(), password);
            router.replace('/pledges');
        } catch (err: any) {
            const categorized = categorizeError(err, 'signup');
            setNetworkError(categorized);
            announceError(categorized.message);
            triggerShake();
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStepOne = () => (
        <Animated.View style={[styles.card, styles.cardStepOne, { transform: [{ translateX: shakeAnimation }] }]}>
            <Text style={[styles.title, styles.titleStepOne]}>Sign Up</Text>
            <View style={styles.inputWrapper}>
                <TextInput
                    style={[styles.input, validationErrors.email ? styles.inputError : null]}
                    placeholder="Email"
                    placeholderTextColor="#555"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    editable={!isSubmitting}
                />
                {validationErrors.email && <Text style={styles.errorText}>{validationErrors.email}</Text>}
            </View>
            <TouchableOpacity
                style={[styles.button, styles.buttonStepOne, isSubmitting ? styles.buttonDisabled : null]}
                onPress={handleContinue}
                disabled={isSubmitting}
            >
                {isSubmitting ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonTextStepOne}>Continue</Text>}
            </TouchableOpacity>
        </Animated.View>
    );

    const renderStepTwo = () => (
        <Animated.View style={[styles.card, styles.cardStepTwo, { transform: [{ translateX: shakeAnimation }] }]}>
            <Text style={[styles.title, styles.titleStepTwo]}>Sign Up</Text>
            
            {/* Password */}
            <View style={styles.inputWrapper}>
                 <View style={[styles.input, styles.passwordContainer, validationErrors.password ? styles.inputError : null]}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Password"
                        placeholderTextColor="#555"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                    />
                     <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                        <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color="#555" />
                    </TouchableOpacity>
                </View>
            </View>
            
            {/* Confirm Password */}
             <View style={styles.inputWrapper}>
                 <View style={[styles.input, styles.passwordContainer, validationErrors.password ? styles.inputError : null]}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Confirm Password"
                        placeholderTextColor="#555"
                        secureTextEntry={!showConfirmPassword}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                        <MaterialIcons name={showConfirmPassword ? "visibility" : "visibility-off"} size={20} color="#555" />
                    </TouchableOpacity>
                </View>
                {validationErrors.password && <Text style={styles.errorText}>{validationErrors.password}</Text>}
            </View>

            <TouchableOpacity
                style={[styles.button, styles.buttonStepTwo, isSubmitting ? styles.buttonDisabled : null]}
                onPress={handleSignUp}
                disabled={isSubmitting}
            >
                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonTextStepTwo}>Continue</Text>}
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.innerContainer}>
                    {step === 1 ? renderStepOne() : renderStepTwo()}
                    {networkError && (
                        <View style={styles.networkErrorContainer}>
                            <Text style={styles.networkErrorText}>{networkError.message}</Text>
                        </View>
                    )}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => router.push('/login')} disabled={isSubmitting}>
                            <Text style={styles.link}>Log In</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    innerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    card: {
        width: 322,
        borderRadius: 20,
        borderWidth: 0.5,
        borderColor: '#000',
        paddingHorizontal: 33,
        alignItems: 'center',
    },
    cardStepOne: {
        height: 248,
        backgroundColor: '#273f4f',
        justifyContent: 'space-between',
        paddingVertical: 40,
    },
    cardStepTwo: {
        backgroundColor: '#447d9b',
        paddingVertical: 32,
    },
    title: { fontFamily: 'SpaceMono-Regular', fontSize: 16 },
    titleStepOne: { color: '#fff' },
    titleStepTwo: { color: '#fff', marginBottom: 32 },
    inputWrapper: { width: '100%', marginBottom: 10 },
    input: {
        width: '100%',
        height: 39,
        backgroundColor: '#d9d9d9',
        borderRadius: 20,
        borderWidth: 0.5,
        borderColor: '#000',
        fontFamily: 'SpaceMono-Regular',
        fontSize: 12,
        color: '#000',
        paddingHorizontal: 22,
    },
    inputError: { borderColor: '#ff0000', borderWidth: 1 },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 0,
    },
    passwordInput: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 22,
        fontFamily: 'SpaceMono-Regular',
        fontSize: 12,
        color: '#000',
    },
    eyeIcon: { padding: 8, marginRight: 8 },
    errorText: {
        color: '#fff',
        fontFamily: 'SpaceMono-Regular',
        fontSize: 12,
        marginTop: 5,
        textAlign: 'center',
    },
    button: {
        width: '100%',
        height: 39,
        borderRadius: 20,
        borderWidth: 0.5,
        borderColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonStepOne: { backgroundColor: '#fe7743' },
    buttonStepTwo: { backgroundColor: '#273f4f', marginTop: 20 },
    buttonDisabled: { opacity: 0.7 },
    buttonTextStepOne: { fontFamily: 'SpaceMono-Regular', fontSize: 12, color: '#000' },
    buttonTextStepTwo: { fontFamily: 'SpaceMono-Regular', fontSize: 12, color: '#fff' },
    networkErrorContainer: {
        position: 'absolute',
        bottom: 80,
        padding: 10,
        backgroundColor: 'rgba(255, 0, 0, 0.5)',
        borderRadius: 10,
    },
    networkErrorText: {
        color: 'white',
        fontFamily: 'SpaceMono-Regular',
        fontSize: 12,
        textAlign: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: { fontFamily: 'SpaceMono-Regular', fontSize: 12, color: '#000' },
    link: {
        fontFamily: 'SpaceMono-Regular',
        fontSize: 12,
        color: '#fe7743',
        textDecorationLine: 'underline',
        fontWeight: 'bold',
    },
});