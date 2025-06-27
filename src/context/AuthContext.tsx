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
        // Add a timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        );
        
        const userPromise = backendService.getCurrentUser();
        const currentUser = await Promise.race([userPromise, timeoutPromise]);
        console.log('User loaded successfully:', currentUser);
        setUser(currentUser);
      } catch (error) {
        console.warn('Failed to load user:', error);
        setUser(null);
      } finally {
        console.log('Setting isLoading to false');
        setIsLoading(false);
      }
    };

    loadUser();
    
    // Fallback timeout to ensure app renders
    const fallbackTimeout = setTimeout(() => {
      if (isLoading) {
        console.warn('Auth loading timeout, forcing render');
        setIsLoading(false);
      }
    }, 10000);

    return () => clearTimeout(fallbackTimeout);
  }, [isLoading]);

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
    // Simulate password reset in local mode
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const updatePassword = async (_newPassword: string): Promise<void> => {
    console.log('Password update requested');
    // Simulate password update in local mode
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

  return (
    <AuthContext.Provider value={value}>
      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
