import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, signupUser, getMyProfile } from '../api/authApi';

// 1. Create the Authentication Context
export const AuthContext = createContext(null);

// 2. Custom hook for consuming auth context cleanly
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 3. AuthProvider component (RAFCE format)
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('twitter_token') || null);
  const [loading, setLoading] = useState(true);

  // Helper to fetch current logged-in user profile from backend (/api/v1/users/me)
  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await getMyProfile();
      if (response && response.success && response.data) {
        setUser(response.data);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.warn('Session verification failed:', err.message);
      // If token is invalid or expired, clear local storage
      localStorage.removeItem('twitter_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token, fetchCurrentUser]);

  // Login action: supports username or email as identifier
  const login = async (identifier, password) => {
    try {
      const res = await loginUser({ identifier, password });
      // The backend returns: { success: true, message: 'Successfully Logged In', data: '<token>' }
      const receivedToken = res.data;
      if (!receivedToken) {
        throw new Error('No authentication token received from server.');
      }

      localStorage.setItem('twitter_token', receivedToken);
      setToken(receivedToken);

      // Now fetch user details using the newly stored token
      const profileRes = await getMyProfile();
      if (profileRes && profileRes.success) {
        setUser(profileRes.data);
      }

      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  // Signup action: creates new user with username, then automatically logs them in
  const signup = async (name, username, email, password) => {
    try {
      // 1. Call backend signup
      const signupRes = await signupUser({ name, username, email, password });
      if (!signupRes.success) {
        throw new Error(signupRes.message || 'Signup failed');
      }

      // 2. Automatically log the user in to get token (using username or email)
      await login(username || email, password);

      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  // Logout action: clears stored credentials and resets state
  const logout = () => {
    localStorage.removeItem('twitter_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    signup,
    logout,
    refreshUser: fetchCurrentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
