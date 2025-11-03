/**
 * @fileoverview Authentication service for managing user auth state and flows
 */

import { useState, useCallback, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthService {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  signup: (credentials: LoginCredentials) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getUser: () => User | null;
}

const LOCAL_STORAGE_KEY = 'auth_user';

/**
 * Custom hook providing authentication functionality
 */
export const useAuth = (): [AuthState, AuthService] => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  /**
   * Initialize auth state from local storage
   */
  useEffect(() => {
    const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setState(prev => ({
          ...prev,
          user,
          isAuthenticated: true,
          isLoading: false
        }));
      } catch (err) {
        console.error('Failed to parse stored user:', err);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  /**
   * Handles user login
   */
  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Simulate API call
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const user = await response.json();
      
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
      
      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as Error,
        isLoading: false
      }));
      throw error;
    }
  }, []);

  /**
   * Handles user logout
   */
  const logout = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Simulate API call
      await fetch('/api/logout', { method: 'POST' });
      
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as Error,
        isLoading: false
      }));
      throw error;
    }
  }, []);

  /**
   * Handles new user signup
   */
  const signup = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        throw new Error('Signup failed');
      }

      const user = await response.json();
      
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
      
      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as Error,
        isLoading: false
      }));
      throw error;
    }
  }, []);

  /**
   * Handles password reset request
   */
  const resetPassword = useCallback(async (email: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error('Password reset failed');
      }

      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as Error,
        isLoading: false
      }));
      throw error;
    }
  }, []);

  /**
   * Returns current user
   */
  const getUser = useCallback((): User | null => {
    return state.user;
  }, [state.user]);

  const service: AuthService = {
    login,
    logout,
    signup,
    resetPassword,
    getUser
  };

  return [state, service];
};

export default useAuth;