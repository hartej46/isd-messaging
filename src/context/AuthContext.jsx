import React, { createContext, useContext, useEffect, useState } from 'react';
import { storageService } from '@/services/storage';
import { formatNameFromEmail } from '@/utils/formatters';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      try {
        const session = await storageService.getSession();
        if (session) {
          setUser(session);
        }
        await storageService.seedInitialData();
      } catch (err) {
        console.error('Error during auth initialization:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (email, password) => {
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      return { success: false, error: 'Please enter both email and password.' };
    }

    const { name, initials } = formatNameFromEmail(cleanEmail);

    const session = {
      email: cleanEmail,
      name,
      loggedInAt: new Date().toISOString(),
      avatarInitials: initials,
    };

    try {
      await storageService.setSession(session);
      await storageService.seedInitialData();
      setUser(session);
      return { success: true };
    } catch (err) {
      console.error('Failed to persist session:', err);
      return { success: false, error: 'Could not save session. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await storageService.clearSession();
      setUser(null);
    } catch (err) {
      console.error('Failed to log out:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
