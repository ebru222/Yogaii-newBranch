import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import ApiService, { User, LoginResponse } from '../services/ApiService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Uygulama başladığında token kontrolü yap
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (ApiService.isAuthenticated()) {
          const currentUser = await ApiService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Token geçersizse temizle
        ApiService.logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const response: LoginResponse = await ApiService.login(username, password);
      
      // User bilgisini localStorage'a kaydet
      localStorage.setItem('yogaii_user', JSON.stringify(response.user));
      setUser(response.user);
    } catch (error) {
      throw error; // Hata mesajını component'e ilet
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      await ApiService.register(username, email, password);
      // Kayıt başarılı, otomatik login yapmıyoruz
    } catch (error) {
      throw error; // Hata mesajını component'e ilet
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    ApiService.logout();
    setUser(null);
  };

  const isAuthenticated = !!user;

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 