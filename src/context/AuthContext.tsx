import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserRole, AuthContextType } from '../types';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'business_nexus_user';
const TOKEN_STORAGE_KEY = 'business_nexus_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
  const storedUser = localStorage.getItem(USER_STORAGE_KEY);
  if (storedUser) {
    setUser(JSON.parse(storedUser));
  }
  setIsLoading(false);
}, []);

  // Real login function
  const login = async (email: string, password: string, role: UserRole): Promise<void> => {
    setIsLoading(true);
    try {
      const data = await authAPI.login({ email, password });

      if (data.token) {
        const loggedInUser: User = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.name)}&background=random`,
          bio: '',
          isOnline: true,
          createdAt: new Date().toISOString()
        };
        setUser(loggedInUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
        localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
        toast.success('Successfully logged in!');
      } else {
        throw new Error(data.message || 'Invalid credentials');
      }
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Real register function
  const register = async (name: string, email: string, password: string, role: UserRole): Promise<void> => {
    setIsLoading(true);
    try {
      const data = await authAPI.register({ name, email, password, role });

      if (data.token) {
        const newUser: User = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.name)}&background=random`,
          bio: '',
          isOnline: true,
          createdAt: new Date().toISOString()
        };
        setUser(newUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
        localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
        toast.success('Account created successfully!');
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  // Login using an already-obtained token (used after 2FA OTP verification)
  const loginWithToken = (token: string, userData: any): void => {
    const loggedInUser: User = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`,
      bio: '',
      isOnline: true,
      createdAt: new Date().toISOString()
    };
    setUser(loggedInUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    toast.success('Successfully logged in!');
  };

  // Forgot password (mock for now)
  const forgotPassword = async (email: string): Promise<void> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password reset instructions sent to your email');
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    }
  };

  // Reset password (mock for now)
  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password reset successfully');
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    }
  };

  // Logout
  const logout = (): void => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    toast.success('Logged out successfully');
  };

  // Update profile
  const updateProfile = async (userId: string, updates: Partial<User>): Promise<void> => {
    try {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!token) throw new Error('Not authenticated');

      const data = await authAPI.updateProfile(token, updates);

      const updatedUser = { ...user, ...updates } as User;
      setUser(updatedUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    }
  };

  const value = {
    user,
    login,
    loginWithToken,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    isAuthenticated: !!user,
    isLoading
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};