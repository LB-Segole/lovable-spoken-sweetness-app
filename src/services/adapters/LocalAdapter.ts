
/**
 * Local Backend Adapter
 * 
 * This adapter handles communication with the local Express.js backend
 * running on port 3001. It implements the same interface as other adapters
 * to maintain consistency across different backend implementations.
 */

import { 
  BackendAdapter, 
  AuthUser, 
  DatabaseRecord 
} from './types';

const API_BASE_URL = 'http://localhost:3001';

export default class LocalAdapter implements BackendAdapter {
  private token: string | null = null;

  constructor() {
    // Try to load token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
    console.log('LocalAdapter initialized, token present:', !!this.token);
  }

  // Auth methods
  async signUp(email: string, password: string, metadata?: any): Promise<AuthUser> {
    console.log('LocalAdapter: Signing up user with email:', email);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name: metadata?.name || ''
        }),
      });

      const data = await response.json();
      console.log('Signup response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // Store the token
      this.token = data.token;
      localStorage.setItem('auth_token', data.token);
      
      return {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name
      };
    } catch (error) {
      console.error('LocalAdapter signup error:', error);
      throw error;
    }
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    console.log('LocalAdapter: Signing in user with email:', email);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        }),
      });

      const data = await response.json();
      console.log('Signin response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Signin failed');
      }

      // Store the token
      this.token = data.token;
      localStorage.setItem('auth_token', data.token);
      
      return {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name
      };
    } catch (error) {
      console.error('LocalAdapter signin error:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    console.log('LocalAdapter: Signing out user');
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    console.log('LocalAdapter: Getting current user, token present:', !!this.token);
    
    if (!this.token) {
      console.log('No token found, returning null');
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.log('Failed to get current user, status:', response.status);
        if (response.status === 401 || response.status === 403) {
          // Token is invalid, clear it
          this.token = null;
          localStorage.removeItem('auth_token');
        }
        return null;
      }

      const data = await response.json();
      console.log('Current user response:', data);
      
      return {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name
      };
    } catch (error) {
      console.error('LocalAdapter getCurrentUser error:', error);
      return null;
    }
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void): (() => void) {
    // For local backend, we don't have real-time auth state changes
    // This is a simple implementation that could be enhanced with websockets
    return () => {};
  }

  // Database methods
  async select<T = DatabaseRecord>(table: string, query?: any): Promise<T[]> {
    if (!this.token) {
      throw new Error('Authentication required');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${table}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${table}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error(`LocalAdapter select error for ${table}:`, error);
      throw error;
    }
  }

  async insert<T = DatabaseRecord>(table: string, data: any): Promise<T> {
    if (!this.token) {
      throw new Error('Authentication required');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${table}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to insert into ${table}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error(`LocalAdapter insert error for ${table}:`, error);
      throw error;
    }
  }

  async update<T = DatabaseRecord>(table: string, id: string, data: any): Promise<T> {
    if (!this.token) {
      throw new Error('Authentication required');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${table}/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to update ${table}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error(`LocalAdapter update error for ${table}:`, error);
      throw error;
    }
  }

  async delete(table: string, id: string): Promise<void> {
    if (!this.token) {
      throw new Error('Authentication required');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${table}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete from ${table}`);
      }
    } catch (error) {
      console.error(`LocalAdapter delete error for ${table}:`, error);
      throw error;
    }
  }

  subscribe(table: string, callback: (payload: any) => void): (() => void) {
    // For local backend, we don't have real-time subscriptions yet
    // This could be implemented with websockets in the future
    return () => {};
  }

  // Voice service methods
  createVoiceWebSocketUrl(path: string, params?: Record<string, string>): string {
    const wsUrl = new URL(`ws://localhost:3001${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        wsUrl.searchParams.set(key, value);
      });
    }
    return wsUrl.toString();
  }

  processAudioData(audioData: Float32Array): string {
    // Convert Float32Array to base64 string for transmission
    const uint8Array = new Uint8Array(audioData.buffer);
    return btoa(String.fromCharCode(...uint8Array));
  }

  handleVoiceMessage(message: any): void {
    // Handle voice-specific message processing
    console.log('Voice message received:', message);
  }

  // Utility methods
  getCurrentBackendType(): string {
    return 'local';
  }

  isRailwayBackend(): boolean {
    return false;
  }

  isSupabaseBackend(): boolean {
    return false;
  }

  isLocalBackend(): boolean {
    return true;
  }
}
