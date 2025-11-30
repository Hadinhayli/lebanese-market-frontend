
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authAPI } from '../lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  
  // Check for existing user in localStorage on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  
  // Login function
  const login = async (email: string, password: string) => {
    const response = await authAPI.signin(email, password);
    if (response.success && response.data) {
      setUser(response.data.user);
    } else {
      throw new Error('Login failed');
    }
  };
  
  // Google login - redirects to Google OAuth
  const loginWithGoogle = async () => {
    try {
      console.log('Starting Google login...');
      const response = await authAPI.getGoogleAuthUrl();
      console.log('Received response:', response);
      
      if (response.success && response.data?.authUrl) {
        console.log('Redirecting to Google OAuth URL:', response.data.authUrl);
        // Redirect to Google OAuth
        window.location.href = response.data.authUrl;
      } else {
        console.error('Invalid response:', response);
        throw new Error(response.message || 'Failed to get Google auth URL');
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response,
      });
      throw error;
    }
  };
  
  // Signup function
  const signup = async (name: string, email: string, password: string) => {
    try {
      const response = await authAPI.signup(name, email, password);
      if (response.success && response.data) {
        if (response.data.user) {
          setUser(response.data.user);
        } else {
          throw new Error('User data not received');
        }
      } else {
        throw new Error(response.message || 'Signup failed');
      }
    } catch (error: any) {
      console.error('Signup context error:', error);
      throw error;
    }
  };
  
  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isAdmin: user?.isAdmin || false,
      login,
      loginWithGoogle,
      signup,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
