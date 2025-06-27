
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { backendService } from '@/services/BackendService';

interface AuthContextProps {
  user: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
  register: (userData: any) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      console.log('Starting auth loading...');
      try {
        const currentUser = await backendService.getCurrentUser();
        console.log('User loaded successfully:', currentUser);
        setUser(currentUser);
      } catch (error) {
        console.warn('Failed to load user (this is normal for local backend):', error);
        setUser(null);
      } finally {
        console.log('Setting isLoading to false');
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (credentials: { email: string; password: string }): Promise<void> => {
    setIsLoading(true);
    try {
      const session = await backendService.signIn(credentials.email, credentials.password);
      setUser(session);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: { email: string; password: string; name?: string }): Promise<void> => {
    setIsLoading(true);
    try {
      const session = await backendService.signUp(userData.email, userData.password);
      setUser(session);
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    backendService.signOut();
    setUser(null);
    navigate('/login');
  };

  const resetPassword = async (email: string): Promise<void> => {
    console.log('Reset password requested for:', email);
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const updatePassword = async (_newPassword: string): Promise<void> => {
    console.log('Password update requested');
    setUser((prev: any) => prev ? { ...prev, updated_at: new Date().toISOString() } : null);
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const value: AuthContextProps = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    resetPassword,
    updatePassword
  };

  // Show loading screen only for a short time, then render children
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
