import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.ts';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (password: string, username?: string) => Promise<boolean>;
  logout: () => void;
  error: string | null;
  isEditMode: boolean;
  setEditMode: (enabled: boolean) => void;
  toggleEditMode: () => void;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'maker_tank_admin_token';
const EDIT_MODE_KEY = 'maker_tank_edit_mode';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY);
  });
  const [error, setError] = useState<string | null>(null);

  const [isEditMode, setIsEditModeState] = useState<boolean>(() => {
    const saved = localStorage.getItem(EDIT_MODE_KEY);
    return !!token && saved === 'true';
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const isAuthenticated = !!token;

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      setIsEditModeState(false);
      localStorage.removeItem(EDIT_MODE_KEY);
    }
  }, [token]);

  useEffect(() => {
    const onSessionExpired = () => {
      setToken(null);
      setIsEditModeState(false);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(EDIT_MODE_KEY);
      setIsLoginModalOpen(true);
    };
    window.addEventListener('admin-session-expired', onSessionExpired);
    return () => window.removeEventListener('admin-session-expired', onSessionExpired);
  }, []);

  const setEditMode = (enabled: boolean) => {
    if (!isAuthenticated && enabled) {
      setIsLoginModalOpen(true);
      return;
    }
    const val = isAuthenticated && enabled;
    setIsEditModeState(val);
    localStorage.setItem(EDIT_MODE_KEY, val ? 'true' : 'false');
  };

  const toggleEditMode = () => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    setEditMode(!isEditMode);
  };

  const login = async (password: string, username?: string): Promise<boolean> => {
    try {
      setError(null);
      const res = await api.adminLogin(password, username);
      if (res.success && res.token) {
        setToken(res.token);
        setIsEditModeState(true);
        localStorage.setItem(EDIT_MODE_KEY, 'true');
        setIsLoginModalOpen(false);
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message || 'Login failed');
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setIsEditModeState(false);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EDIT_MODE_KEY);
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        token,
        login,
        logout,
        error,
        isEditMode: isAuthenticated && isEditMode,
        setEditMode,
        toggleEditMode,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
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
