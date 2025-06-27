
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Use environment variable or fallback to localhost:3001
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    const name = localStorage.getItem('name');
    const id = localStorage.getItem('id');
    
    if (token && email && name && id) {
      setUser({ id, token, email, name });
    }
    setIsLoading(false);
  }, []);

  const makeApiRequest = async (endpoint: string, data: any) => {
    console.log(`Making API request to: ${API_BASE_URL}${endpoint}`);
    console.log('Request data:', data);
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Check if response is ok first
      if (!response.ok) {
        // Try to get error message from response if possible
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.text();
          console.log('Error response text:', errorData);
          
          // Try to parse as JSON if possible
          try {
            const errorJson = JSON.parse(errorData);
            errorMessage = errorJson.detail?.message || errorJson.message || errorMessage;
          } catch {
            // If not JSON, use the text as error message
            errorMessage = errorData || errorMessage;
          }
        } catch {
          // If can't read response, use default error
        }
        throw new Error(errorMessage);
      }

      // Check if response has content
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      if (!responseText) {
        throw new Error('Empty response from server');
      }

      // Try to parse JSON
      try {
        const data = JSON.parse(responseText);
        console.log('Parsed response data:', data);
        return data;
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
      }
    } catch (error) {
      console.error('API request failed:', error);
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Cannot connect to server at ${API_BASE_URL}. Please ensure the backend is running.`);
      }
      
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await makeApiRequest('/auth/login', { email, password });

      if (data.success) {
        const userData = {
          id: data.id || data.userId || email, // Fallback to email if no id provided
          token: data.jwtToken,
          email: data.email,
          name: data.name,
        };
        
        setUser(userData);
        localStorage.setItem('id', userData.id);
        localStorage.setItem('token', data.jwtToken);
        localStorage.setItem('email', data.email);
        localStorage.setItem('name', data.name);
        
        console.log('Login successful, user data stored');
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await makeApiRequest('/auth/register', { name, email, password });

      if (data.success) {
        // After successful registration, automatically log in
        await login(email, password);
        console.log('Registration and auto-login successful');
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('id');
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('name');
    console.log('User logged out');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
