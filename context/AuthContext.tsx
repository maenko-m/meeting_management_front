import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../api/auth'; 
import { FullEmployee } from '../types';
import { useRouter } from 'next/router';

interface AuthContextType {
  user: FullEmployee | null;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
  updateUser: (updatedUser: Partial<FullEmployee>) => void;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FullEmployee | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error('Ошибка инициализации авторизации:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const login = async (token: string) => {
    localStorage.setItem('jwt', token);
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.error('Ошибка после логина:', err);
      setUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem('jwt');
    setUser(null);
    router.push('/auth');
  };

  const updateUser = (updatedUser: Partial<FullEmployee>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedUser } : null));
  };

  const hasRole = (role: string) => {
    return user?.roles?.includes(role) || false;
  };
  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser, hasRole }}>
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