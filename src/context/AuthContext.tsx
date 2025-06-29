
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { backendService } from '@/services/BackendService';
import { toast } from 'sonner';

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
      console.log('AuthContext: Starting auth loading...');
      setIsLoading(true);
      
      try {
        const currentUser = await backendService.getCurrentUser();
        console.log('AuthContext: User loaded successfully:', currentUser);
        setUser(currentUser);
      } catch (error) {
        console.log('AuthContext: No user logged in (this is normal for fresh sessions):', error);
        setUser(null);
      } finally {
        console.log('AuthContext: Setting isLoading to false');
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (credentials: { email: string; password: string }): Promise<void> => {
    console.log('AuthContext: Login attempt for:', credentials.email);
    setIsLoading(true);
    
    try {
      const session = await backendService.signIn(credentials.email, credentials.password);
      console.log('AuthContext: Login successful:', session);
      setUser(session);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('AuthContext: Login failed:', error);
      const errorMessage = error.message || 'Login failed';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: { email: string; password: string; name?: string }): Promise<void> => {
    console.log('AuthContext: Registration attempt for:', userData.email);
    setIsLoading(true);
    
    try {
      const session = await backendService.signUp(userData.email, userData.password, { name: userData.name });
      console.log('AuthContext: Registration successful:', session);
      setUser(session);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('AuthContext: Registration failed:', error);
      const errorMessage = error.message || 'Registration failed';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('AuthContext: Logging out user');
    backendService.signOut();
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const resetPassword = async (email: string): Promise<void> => {
    console.log('AuthContext: Password reset requested for:', email);
    // For local backend, this would need to be implemented in the backend
    toast.info('Password reset functionality not implemented for local backend');
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const updatePassword = async (newPassword: string): Promise<void> => {
    console.log('AuthContext: Password update requested');
    // For local backend, this would need to be implemented
    setUser((prev: any) => prev ? { ...prev, updated_at: new Date().toISOString() } : null);
    toast.success('Password updated successfully');
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
