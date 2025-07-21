const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\+]?[1-9][\d]{0,15}$/;
const NAME_REGEX = /^[a-zA-Z\s]+$/;
const PASSWORD_MIN_LENGTH = 6;
const NAME_MIN_LENGTH = 2;

const TOKEN_KEY = 'yad2_token';
const USER_KEY = 'yad2_user';

interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const validateEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email);
};

export const validatePhone = (phone: string): boolean => {
  return PHONE_REGEX.test(phone);
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      isValid: false,
      message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
    };
  }

  if (!/(?=.*[a-z])(?=.*[A-Z])/.test(password)) {
    return {
      isValid: false,
      message:
        'Password must contain at least one uppercase and one lowercase letter',
    };
  }

  return { isValid: true };
};

export const validateName = (name: string): ValidationResult => {
  if (!name) {
    return { isValid: false, message: 'Name is required' };
  }

  if (name.length < NAME_MIN_LENGTH) {
    return {
      isValid: false,
      message: `Name must be at least ${NAME_MIN_LENGTH} characters`,
    };
  }

  if (!NAME_REGEX.test(name)) {
    return {
      isValid: false,
      message: 'Name can only contain letters and spaces',
    };
  }

  return { isValid: true };
};

export const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem(TOKEN_KEY);

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch {
    return true;
  }
};

export const formatAuthError = (error: unknown): string => {
  if (error instanceof Error) {
    const { message } = error;

    if (message.includes('401')) {
      return 'Invalid credentials. Please check your email and password.';
    }
    if (message.includes('403')) {
      return 'Access forbidden. Please contact support.';
    }
    if (message.includes('404')) {
      return 'User not found. Please check your credentials.';
    }
    if (message.includes('409')) {
      return 'An account with this email already exists.';
    }
    if (message.includes('500')) {
      return 'Server error. Please try again later.';
    }

    return message;
  }

  return 'An unexpected error occurred. Please try again.';
};

export const clearAuthStorage = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getStoredUser = (): any | null => {
  try {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user: any): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};
