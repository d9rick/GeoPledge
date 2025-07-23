// /utils/errorHandling.ts

// Error types for better categorization
export type ErrorType = 
    | 'validation'
    | 'network'
    | 'authentication'
    | 'server'
    | 'unknown';

export interface ValidationErrors {
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
}

export interface NetworkError {
    type: ErrorType;
    message: string;
    retryable: boolean;
}

// Input validation functions
export const validateEmail = (email: string): string | undefined => {
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

export const validatePassword = (password: string): string | undefined => {
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

export const validateConfirmPassword = (confirmPassword: string, password: string): string | undefined => {
    if (!confirmPassword) {
        return 'Please confirm your password';
    }
    
    if (confirmPassword !== password) {
        return 'Passwords do not match';
    }
    
    return undefined;
};

// Network error categorization
export const categorizeError = (error: any, context: 'login' | 'signup' | 'check-email' = 'login'): NetworkError => {
    console.log('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
    });

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
                message: data?.error || data?.message || 'Invalid request. Please check your input.',
                retryable: false
            };
        case 401:
            return {
                type: 'authentication',
                message: data?.error || 'Invalid email or password. Please try again.',
                retryable: false
            };
        case 403:
            return {
                type: 'authentication',
                message: data?.error || 'Account is locked or disabled. Please contact support.',
                retryable: false
            };
        case 404:
            return {
                type: 'server',
                message: `${context === 'login' ? 'Login' : 'Signup'} service not found. Please try again later.`,
                retryable: true
            };
        case 409:
            return {
                type: 'authentication',
                message: data?.error || 'An account with this email already exists. Please try logging in instead.',
                retryable: false
            };
        case 429:
            return {
                type: 'authentication',
                message: data?.error || `Too many ${context} attempts. Please wait a few minutes before trying again.`,
                retryable: true
            };
        case 500:
        case 502:
        case 503:
        case 504:
            return {
                type: 'server',
                message: data?.error || 'Server is temporarily unavailable. Please try again in a few minutes.',
                retryable: true
            };
        default:
            return {
                type: 'unknown',
                message: data?.error || 'An unexpected error occurred. Please try again.',
                retryable: true
            };
    }
};

// Error message constants
export const ERROR_MESSAGES = {
    NETWORK: {
        NO_CONNECTION: 'Unable to connect to our servers. Please check your internet connection and try again.',
        TIMEOUT: 'The request took too long to complete. Please try again.',
        SERVER_DOWN: 'Our servers are temporarily unavailable. Please try again in a few minutes.',
    },
    VALIDATION: {
        EMAIL_REQUIRED: 'Email is required',
        EMAIL_INVALID: 'Please enter a valid email address',
        EMAIL_TOO_LONG: 'Email is too long',
        PASSWORD_REQUIRED: 'Password is required',
        PASSWORD_TOO_SHORT: 'Password must be at least 6 characters',
        PASSWORD_TOO_LONG: 'Password is too long',
        PASSWORD_WEAK: 'Please choose a stronger password',
        CONFIRM_PASSWORD_REQUIRED: 'Please confirm your password',
        PASSWORDS_DONT_MATCH: 'Passwords do not match',
        GENERAL: 'An error occurred. Please try again.',
    },
    AUTHENTICATION: {
        INVALID_CREDENTIALS: 'The email or password you entered is incorrect. Please try again.',
        ACCOUNT_LOCKED: 'Your account has been temporarily locked due to too many failed attempts. Please try again in 15 minutes.',
        EMAIL_EXISTS: 'An account with this email already exists. Would you like to log in instead?',
        TOO_MANY_ATTEMPTS: 'Too many login attempts. Please wait a few minutes before trying again.',
        ACCOUNT_DISABLED: 'Your account has been disabled. Please contact support for assistance.',
    },
} as const;

// Helper function to get user-friendly error messages
export const getUserFriendlyMessage = (error: any, context: 'login' | 'signup' | 'check-email' = 'login'): string => {
    const categorizedError = categorizeError(error, context);
    return categorizedError.message;
};

// Helper function to check if error is retryable
export const isErrorRetryable = (error: any, context: 'login' | 'signup' | 'check-email' = 'login'): boolean => {
    const categorizedError = categorizeError(error, context);
    return categorizedError.retryable;
};

// Helper function to get error type
export const getErrorType = (error: any, context: 'login' | 'signup' | 'check-email' = 'login'): ErrorType => {
    const categorizedError = categorizeError(error, context);
    return categorizedError.type;
};

export class RetryManager {
    private static retryCount = 0;
    private static maxRetries = 3;
    
    static async retryWithBackoff<T>(
        operation: () => Promise<T>,
        baseDelay = 1000
    ): Promise<T> {
        try {
            return await operation();
        } catch (error) {
            if (this.retryCount >= this.maxRetries || !isErrorRetryable(error)) {
                throw error;
            }
            
            this.retryCount++;
            const delay = baseDelay * Math.pow(2, this.retryCount - 1);
            await new Promise(resolve => setTimeout(resolve, delay));
            
            return this.retryWithBackoff(operation, baseDelay);
        }
    }
}

/*
export const trackError = (error: any, context: string) => {
    const errorData = {
        type: getErrorType(error),
        message: error.message,
        status: error.response?.status,
        context,
        timestamp: new Date().toISOString(),
        userId: getCurrentUserId()
    };
    
    // Send to analytics service
    analytics.track('error_occurred', errorData);
}; 
*/ 