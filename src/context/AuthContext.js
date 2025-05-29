'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from './CartContext';

// Types for better development experience
const AuthContext = createContext();

// Configuration
const CONFIG = {
  TOKEN_KEY: 'auth_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
  MAX_RETRY_ATTEMPTS: 3,
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
  REDIRECT_AFTER_LOGIN_KEY: 'redirect_after_login',
};

const INACTIVITY_LIMIT = 5 * 60 * 1000; // 30 minutes

// Utility functions
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
};

const getTokenExpiry = (token) => {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000;
  } catch {
    return null;
  }
};

// Add a key for user persistence
const USER_KEY = 'user';

// Helper to decode user from JWT
function decodeUserFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Adjust this if your JWT structure is different
    // If user info is directly in payload, return payload
    // If user info is nested, e.g., payload.user, return payload.user
    return payload.user || payload;
  } catch {
    return null;
  }
}

// Use localStorage for persistence
const secureStorage = {
  get: (key) => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set: (key, value) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('Failed to store auth data:', error);
    }
  },
  remove: (key) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove auth data:', error);
    }
  },
  clear: () => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(CONFIG.TOKEN_KEY);
      localStorage.removeItem(CONFIG.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.warn('Failed to clear auth data:', error);
    }
  }
};

// API client with interceptors
class AuthAPI {
  constructor() {
    this.retryCount = 0;
  }

  async request(endpoint, options = {}) {
    const url = `${CONFIG.API_BASE_URL}${endpoint}`;
    const token = secureStorage.get(CONFIG.TOKEN_KEY);
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new AuthError(
          errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.code
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError('Network error occurred', 0, 'NETWORK_ERROR');
    }
  }

  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(name, email, password) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  async refreshToken(refreshToken) {
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async logout() {
    const refreshToken = secureStorage.get(CONFIG.REFRESH_TOKEN_KEY);
    if (refreshToken) {
      try {
        await this.request('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
      } catch (error) {
        // Log but don't throw - we still want to clear local storage
        console.warn('Server logout failed:', error);
      }
    }
  }

  async verifyToken() {
    // No longer needed: removed call to /auth/verify
    // Instead, rely on JWT decoding and expiry check in AuthContext
    return { valid: true };
  }

  // New method for creating orders
  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  // New method for fetching user orders
  async getUserOrders() {
    return this.request('/orders', {
      method: 'GET',
    });
  }
}

// Custom error class
class AuthError extends Error {
  constructor(message, status = 0, code = 'UNKNOWN_ERROR') {
    super(message);
    this.name = 'AuthError';
    this.status = status;
    this.code = code;
  }
}

// Input validation
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 8;
};

const sanitizeInput = (input) => {
  return typeof input === 'string' ? input.trim() : input;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const authAPI = useRef(new AuthAPI()).current;
  const refreshTimeoutRef = useRef(null);
  const mountedRef = useRef(true);
  const router = useRouter();
  const inactivityTimeoutRef = useRef(null);
  const { clearCart } = useCart();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  // Token refresh scheduler
  const scheduleTokenRefresh = useCallback((token) => {
    if (!token || !mountedRef.current) return;
    
    const expiry = getTokenExpiry(token);
    if (!expiry) return;

    const refreshTime = expiry - Date.now() - CONFIG.TOKEN_REFRESH_THRESHOLD;
    
    if (refreshTime > 0) {
      refreshTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          refreshAuthToken();
        }
      }, refreshTime);
    }
  }, []);

  // Logout function - defined once
  const handleLogout = useCallback(async () => {
    console.log('Initiating logout...');
    
    // Clear refresh timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }

    try {
      // Attempt server-side logout
      await authAPI.logout();
      console.log('Server logout successful');
    } catch (error) {
      console.warn('Server logout failed:', error);
      // Continue with client-side logout even if server logout fails
    }

    // Clear client-side storage
    secureStorage.clear();
    secureStorage.remove(USER_KEY);
    
    // Update state if component is still mounted
    if (mountedRef.current) {
      setUser(null);
      setError(null);
      setIsRefreshing(false);
    }

    // Redirect to homepage after logout
    router.push('/');

    console.log('Logout completed');
  }, [authAPI, router]);

  // Refresh authentication token
  const refreshAuthToken = useCallback(async () => {
    if (isRefreshing || !mountedRef.current) return;

    const refreshToken = secureStorage.get(CONFIG.REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      handleLogout();
      return;
    }

    setIsRefreshing(true);
    setError(null);

    try {
      const response = await authAPI.refreshToken(refreshToken);
      if (response.accessToken && response.user) {
        secureStorage.set(CONFIG.TOKEN_KEY, response.accessToken);
        if (response.refreshToken) {
          secureStorage.set(CONFIG.REFRESH_TOKEN_KEY, response.refreshToken);
        }
        if (mountedRef.current) {
          setUser(response.user);
          scheduleTokenRefresh(response.accessToken);
        }
      } else {
        throw new AuthError('Invalid refresh response');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      if (mountedRef.current) {
        handleLogout();
        setError('Session expired. Please log in again.');
      }
    } finally {
      if (mountedRef.current) {
        setIsRefreshing(false);
      }
    }
  }, [isRefreshing, scheduleTokenRefresh, handleLogout]);

  // On mount, restore user from localStorage if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = secureStorage.get(USER_KEY);
      if (storedUser && !user) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {}
      }
    }
  }, []);

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      const token = secureStorage.get(CONFIG.TOKEN_KEY);
      if (!token || isTokenExpired(token)) {
        if (mountedRef.current) {
          setLoading(false);
        }
        return;
      }
      // Set user from token instantly for persistence
      const decodedUser = decodeUserFromToken(token);
      if (decodedUser && mountedRef.current) {
        setUser(decodedUser);
        secureStorage.set(USER_KEY, JSON.stringify(decodedUser));
      }
      // No API call to verifyToken; rely on JWT expiry only
      if (mountedRef.current) {
        scheduleTokenRefresh(token);
        setLoading(false);
      }
    };

    initAuth();
  }, [scheduleTokenRefresh, authAPI]);

  // Inactivity timer for auto-logout after 30 minutes
  useEffect(() => {
    if (!user) return;
    
    const resetTimer = () => {
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
      inactivityTimeoutRef.current = setTimeout(() => {
        handleLogout();
      }, INACTIVITY_LIMIT);
    };
    
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('scroll', resetTimer);
    resetTimer();
    
    return () => {
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('scroll', resetTimer);
    };
  }, [user, handleLogout]);

  // Only one definition for login
  const login = useCallback(async (email, password) => {
    // Validate inputs
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = sanitizeInput(password);

    if (!validateEmail(sanitizedEmail)) {
      throw new AuthError('Please enter a valid email address', 400, 'INVALID_EMAIL');
    }

    if (!validatePassword(sanitizedPassword)) {
      throw new AuthError('Password must be at least 8 characters long', 400, 'INVALID_PASSWORD');
    }

    setError(null);
    setLoading(true);

    try {
      console.log('Sending login request for email:', sanitizedEmail);
      
      const response = await authAPI.login(sanitizedEmail, sanitizedPassword);
      
      console.log('Login response:', response);
      
      if (!response.accessToken || !response.user) {
        throw new AuthError('Invalid login response from server');
      }

      // Store tokens securely
      secureStorage.set(CONFIG.TOKEN_KEY, response.accessToken);
      if (response.refreshToken) {
        secureStorage.set(CONFIG.REFRESH_TOKEN_KEY, response.refreshToken);
      }

      // Decode user from token and persist
      const decodedUser = decodeUserFromToken(response.accessToken);
      if (decodedUser) {
        secureStorage.set(USER_KEY, JSON.stringify(decodedUser));
        setUser(decodedUser);
      } else {
        setUser(response.user);
        secureStorage.set(USER_KEY, JSON.stringify(response.user));
      }
      scheduleTokenRefresh(response.accessToken);

      // Handle post-login redirect
      const redirectPath = secureStorage.get(CONFIG.REDIRECT_AFTER_LOGIN_KEY);
      if (redirectPath) {
        secureStorage.remove(CONFIG.REDIRECT_AFTER_LOGIN_KEY);
        router.push(redirectPath);
      } else {
        router.push('/'); // Default redirect to homepage
      }

      return { success: true, user: response.user };
    } catch (error) {
      console.error('Login error:', error);
      
      const authError = error instanceof AuthError ? error : 
        new AuthError(error.message || 'Login failed. Please try again.');
      
      if (mountedRef.current) {
        setError(authError.message);
      }
      
      return { success: false, error: authError.message };
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [scheduleTokenRefresh, authAPI, router]);

  // Only one definition for register
  const register = useCallback(async (name, email, password) => {
    // Validate inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = sanitizeInput(password);

    if (!sanitizedName || sanitizedName.length < 2) {
      throw new AuthError('Name must be at least 2 characters long', 400, 'INVALID_NAME');
    }

    if (!validateEmail(sanitizedEmail)) {
      throw new AuthError('Please enter a valid email address', 400, 'INVALID_EMAIL');
    }

    if (!validatePassword(sanitizedPassword)) {
      throw new AuthError('Password must be at least 8 characters long', 400, 'INVALID_PASSWORD');
    }

    setError(null);
    setLoading(true);

    try {
      console.log('Sending registration request:', { 
        name: sanitizedName, 
        email: sanitizedEmail, 
        passwordLength: sanitizedPassword.length 
      });

      const response = await authAPI.register(sanitizedName, sanitizedEmail, sanitizedPassword);
      
      console.log('Registration response:', response);
      
      // Check for success based on your API response structure
      if (response.success) {
        if (response.accessToken && response.user) {
          secureStorage.set(CONFIG.TOKEN_KEY, response.accessToken);
          if (response.refreshToken) {
            secureStorage.set(CONFIG.REFRESH_TOKEN_KEY, response.refreshToken);
          }
          // Decode user from token and persist
          const decodedUser = decodeUserFromToken(response.accessToken);
          if (decodedUser) {
            secureStorage.set(USER_KEY, JSON.stringify(decodedUser));
            setUser(decodedUser);
          } else {
            setUser(response.user);
            secureStorage.set(USER_KEY, JSON.stringify(response.user));
          }
          scheduleTokenRefresh(response.accessToken);
          router.push('/');
        }
        return {
          success: true,
          user: response.user,
          message: response.message || 'Registration successful',
          autoLogin: !!(response.accessToken && response.user)
        };
      } else {
        throw new AuthError(response.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      const authError = error instanceof AuthError ? error : 
        new AuthError(error.message || 'Registration failed. Please try again.');
      
      if (mountedRef.current) {
        setError(authError.message);
      }
      
      return { success: false, error: authError.message };
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [authAPI, router, scheduleTokenRefresh]);

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      const token = secureStorage.get(CONFIG.TOKEN_KEY);
      if (!token || isTokenExpired(token)) {
        if (mountedRef.current) {
          setLoading(false);
        }
        return;
      }
      // Set user from token instantly for persistence
      const decodedUser = decodeUserFromToken(token);
      if (decodedUser && mountedRef.current) {
        setUser(decodedUser);
        secureStorage.set(USER_KEY, JSON.stringify(decodedUser));
      }
      // No API call to verifyToken; rely on JWT expiry only
      if (mountedRef.current) {
        scheduleTokenRefresh(token);
        setLoading(false);
      }
    };

    initAuth();
  }, [scheduleTokenRefresh, authAPI]);

  // Inactivity timer for auto-logout after 30 minutes
  useEffect(() => {
    if (!user) return;
    
    const resetTimer = () => {
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
      inactivityTimeoutRef.current = setTimeout(() => {
        handleLogout();
      }, INACTIVITY_LIMIT);
    };
    
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('scroll', resetTimer);
    resetTimer();
    
    return () => {
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('scroll', resetTimer);
    };
  }, [user, handleLogout]);

  // New function to check authentication and redirect if needed
  const requireAuth = useCallback((redirectTo = null) => {
    if (!user) {
      // Store the intended destination for post-login redirect
      if (redirectTo) {
        secureStorage.set(CONFIG.REDIRECT_AFTER_LOGIN_KEY, redirectTo);
      }
      router.push('/login');
      return false;
    }
    return true;
  }, [user, router]);

  // New function to create an order
  const createOrder = useCallback(async (orderData) => {
    if (!user) {
      throw new AuthError('You must be logged in to place an order', 401, 'UNAUTHORIZED');
    }

    setError(null);
    setLoading(true);

    try {
      // Include user ID in the order data
      const orderWithUser = {
        ...orderData,
        userId: user.id,
        customerName: user.name,
        customerEmail: user.email,
      };

      const response = await authAPI.createOrder(orderWithUser);

      if (response.success && response.order) {
        // Clear cart after successful order creation
        clearCart();
        // Redirect to orders page after successful order creation
        router.push('/shop/orders');
        
        return { 
          success: true, 
          order: response.order,
          message: 'Order placed successfully!'
        };
      } else {
        throw new AuthError(response.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      
      const authError = error instanceof AuthError ? error : 
        new AuthError(error.message || 'Failed to place order. Please try again.');
      
      if (mountedRef.current) {
        setError(authError.message);
      }
      
      return { success: false, error: authError.message };
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [user, authAPI, router, clearCart]);

  // New function to fetch user orders
  const fetchUserOrders = useCallback(async () => {
    if (!user) {
      throw new AuthError('You must be logged in to view orders', 401, 'UNAUTHORIZED');
    }

    setError(null);
    setLoading(true);

    try {
      const response = await authAPI.getUserOrders();
      console.log('Raw API response:', response);
      if (Array.isArray(response)) {
        // If API returns array directly
        return { 
          success: true, 
          orders: response 
        };
      } else if (response.success && response.orders) {
        // If API returns { success, orders }
        return { 
          success: true, 
          orders: response.orders 
        };
      } else {
        throw new AuthError(response.error || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
      
      const authError = error instanceof AuthError ? error : 
        new AuthError(error.message || 'Failed to fetch orders. Please try again.');
      
      if (mountedRef.current) {
        setError(authError.message);
      }
      
      return { success: false, error: authError.message, orders: [] };
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [user, authAPI]);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Update user profile function
  const updateProfile = useCallback(async (userData) => {
    setError(null);
    setLoading(true);

    try {
      const response = await authAPI.request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(userData),
      });

      if (response.user && mountedRef.current) {
        setUser(response.user);
        return { success: true, user: response.user };
      }

      throw new AuthError('Invalid profile update response');
    } catch (error) {
      const authError = error instanceof AuthError ? error : 
        new AuthError('Profile update failed. Please try again.');
      
      if (mountedRef.current) {
        setError(authError.message);
      }
      
      return { success: false, error: authError.message };
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [authAPI]);

  // Change password function
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    if (!validatePassword(newPassword)) {
      throw new AuthError('New password must be at least 8 characters long', 400, 'INVALID_PASSWORD');
    }

    setError(null);
    setLoading(true);

    try {
      const response = await authAPI.request('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      return { success: true, message: response.message || 'Password changed successfully' };
    } catch (error) {
      const authError = error instanceof AuthError ? error : 
        new AuthError('Password change failed. Please try again.');
      
      if (mountedRef.current) {
        setError(authError.message);
      }
      
      return { success: false, error: authError.message };
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [authAPI]);

  // Forgot password function
  const forgotPassword = useCallback(async (email) => {
    const sanitizedEmail = sanitizeInput(email);

    if (!validateEmail(sanitizedEmail)) {
      throw new AuthError('Please enter a valid email address', 400, 'INVALID_EMAIL');
    }

    setError(null);
    setLoading(true);

    try {
      const response = await authAPI.request('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: sanitizedEmail }),
      });

      return { success: true, message: response.message || 'Password reset email sent' };
    } catch (error) {
      const authError = error instanceof AuthError ? error : 
        new AuthError('Failed to send password reset email. Please try again.');
      
      if (mountedRef.current) {
        setError(authError.message);
      }
      
      return { success: false, error: authError.message };
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [authAPI]);

  // Reset password function
  const resetPassword = useCallback(async (token, newPassword) => {
    if (!validatePassword(newPassword)) {
      throw new AuthError('Password must be at least 8 characters long', 400, 'INVALID_PASSWORD');
    }

    setError(null);
    setLoading(true);

    try {
      const response = await authAPI.request('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      });

      return { success: true, message: response.message || 'Password reset successfully' };
    } catch (error) {
      const authError = error instanceof AuthError ? error : 
        new AuthError('Password reset failed. Please try again.');
      
      if (mountedRef.current) {
        setError(authError.message);
      }
      
      return { success: false, error: authError.message };
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [authAPI]);

  // Context value
  const value = {
    // State
    user,
    loading: loading || isRefreshing,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    
    // Actions
    login,
    register,
    logout: handleLogout,
    clearError,
    refreshToken: refreshAuthToken,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    
    // New order-related functions
    createOrder,
    fetchUserOrders,
    requireAuth,
    
    // Utilities
    hasRole: (role) => user?.roles?.includes(role) || user?.role === role,
    hasPermission: (permission) => user?.permissions?.includes(permission),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Enhanced higher-order component for route protection
export function withAuth(Component, options = {}) {
  const { requireAdmin = false, requiredRole = null, requiredPermission = null, redirectTo = '/login' } = options;
  
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, isAdmin, hasRole, hasPermission, loading, requireAuth } = useAuth();
    
    useEffect(() => {
      if (!loading && !isAuthenticated) {
        requireAuth(typeof window !== 'undefined' ? window.location.pathname : null);
      }
    }, [loading, isAuthenticated, requireAuth]);
    
    if (loading) {
      return <div>Loading...</div>; // Replace with your loading component
    }
    
    if (!isAuthenticated) {
      return null; // Component will redirect via useEffect
    }
    
    if (requireAdmin && !isAdmin) {
      return <div>Admin access required.</div>;
    }
    
    if (requiredRole && !hasRole(requiredRole)) {
      return <div>Insufficient permissions.</div>;
    }
    
    if (requiredPermission && !hasPermission(requiredPermission)) {
      return <div>Insufficient permissions.</div>;
    }
    
    return <Component {...props} />;
  };
}

// New hook for protected actions
export function useProtectedAction() {
  const { isAuthenticated, requireAuth } = useAuth();
  
  const executeProtected = useCallback((action, redirectTo = null) => {
    if (!isAuthenticated) {
      requireAuth(redirectTo);
      return false;
    }
    
    if (typeof action === 'function') {
      action();
    }
    return true;
  }, [isAuthenticated, requireAuth]);
  
  return executeProtected;
}

export { AuthError };