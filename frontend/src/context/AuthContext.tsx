import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (login: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  demoLogin: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('skilltrack_access_token');
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (err) {
          console.error('Session restoration failed:', err);
          localStorage.removeItem('skilltrack_access_token');
          localStorage.removeItem('skilltrack_refresh_token');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (loginId: string, pass: string) => {
    const data = await authService.login(loginId, pass);
    localStorage.setItem('skilltrack_access_token', data.tokens.access);
    localStorage.setItem('skilltrack_refresh_token', data.tokens.refresh);
    setUser(data.user);
  };

  const register = async (regData: any) => {
    const data = await authService.register(regData);
    localStorage.setItem('skilltrack_access_token', data.tokens.access);
    localStorage.setItem('skilltrack_refresh_token', data.tokens.refresh);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('skilltrack_access_token');
    localStorage.removeItem('skilltrack_refresh_token');
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const demoLogin = async (role: UserRole) => {
    if (role === 'STUDENT') {
      await login('student@skilltrack.dev', 'StudentPass123!');
    } else if (role === 'MENTOR') {
      await login('mentor@skilltrack.dev', 'MentorPass123!');
    } else if (role === 'ADMIN') {
      await login('admin@skilltrack.dev', 'AdminPass123!');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        demoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
