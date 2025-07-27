import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { websocketClient } from '../services/websocketClient';
import {
  formatAuthError,
  clearAuthStorage,
  getStoredUser,
  setStoredUser,
  getAuthHeaders,
  isTokenExpired,
} from '../utils/authUtils';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  phone: string;
}

const TOKEN_KEY = 'yad2_token';
const USERS_API = 'http://192.168.1.217:4000/api/users';

const apiRequest = async (url: string, options: RequestInit = {}) => {
  const defaultHeaders = getAuthHeaders();

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
};

const createAuthenticatedState = (user: User): AuthState => ({
  user,
  isAuthenticated: true,
  isLoading: false,
  error: null,
});

const createUnauthenticatedState = (
  error: string | null = null
): AuthState => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error,
});

const useAuth = () => {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const setAuthData = useCallback((token: string, user: User) => {
    localStorage.setItem(TOKEN_KEY, token);
    setStoredUser(user);
  }, []);

  const clearError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: null }));
  }, []);

  const handleAuthSuccess = useCallback(
    (token: string, user: User) => {
      setAuthData(token, user);
      setAuthState(createAuthenticatedState(user));

      // Update WebSocket client with the new token
      websocketClient.setAuthToken(token);

      navigate('/');
    },
    [navigate, setAuthData]
  );

  const handleAuthError = useCallback((error: unknown) => {
    const errorMessage = formatAuthError(error);
    setAuthState((prev) => ({
      ...prev,
      error: errorMessage,
      isLoading: false,
    }));
    clearAuthStorage();

    // Clear WebSocket authentication on error
    websocketClient.setAuthToken('');
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        const user = getStoredUser();

        if (token && user) {
          if (isTokenExpired(token)) {
            clearAuthStorage();
            setAuthState(createUnauthenticatedState());
            return;
          }

          // Update WebSocket client with existing token
          websocketClient.setAuthToken(token);
          setAuthState(createAuthenticatedState(user));
        } else {
          setAuthState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        clearAuthStorage();
        setAuthState(createUnauthenticatedState());
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

        const response = await apiRequest(`${USERS_API}/login`, {
          method: 'POST',
          body: JSON.stringify(credentials),
        });

        if (!response.data.token || !response.data.user) {
          throw new Error('Invalid response from server');
        }

        handleAuthSuccess(response.data.token, response.data.user);
      } catch (error) {
        handleAuthError(error);
      }
    },
    [handleAuthSuccess, handleAuthError]
  );

  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      try {
        setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

        const response = await apiRequest(`${USERS_API}/signup`, {
          method: 'POST',
          body: JSON.stringify(credentials),
        });

        if (!response.token || !response.data) {
          throw new Error('Invalid response from server');
        }

        handleAuthSuccess(response.token, response.data);
      } catch (error) {
        handleAuthError(error);
      }
    },
    [handleAuthSuccess, handleAuthError]
  );

  const logout = useCallback(() => {
    clearAuthStorage();
    setAuthState(createUnauthenticatedState());

    // Clear WebSocket authentication
    websocketClient.setAuthToken('');

    navigate('/auth');
  }, [navigate]);

  const refreshAuth = useCallback(async () => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      logout();
    }
  }, [logout]);

  return {
    ...authState,
    login,
    register,
    logout,
    refreshAuth,
    clearError,
  };
};

export default useAuth;
