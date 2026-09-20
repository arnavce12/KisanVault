"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('kisanvault_jwt');
      if (token) {
        try {
          const userData = await authService.getMe();
          setUser(userData);
        } catch (error) {
          console.error('Session expired or invalid', error);
          localStorage.removeItem('kisanvault_jwt');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();

    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, []);

  const login = async (identifier, password) => {
    const response = await authService.login({ identifier, password });
    const token = response.access_token || response.token;
    if (token) {
      localStorage.setItem('kisanvault_jwt', token);
      setUser(response.user || { id: 'temp', name: 'Farmer' });
      router.push('/dashboard');
    }
    return response;
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    const token = response.access_token || response.token;
    if (token) {
      localStorage.setItem('kisanvault_jwt', token);
      setUser(response.user || { id: 'temp', name: userData.name });
      router.push('/dashboard');
    }
    return response;
  };

  const demoLogin = async () => {
    if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      throw new Error("Demo mode is disabled in this environment.");
    }
    // Perform a real login for the seeded demo user
    await login('demo@kisanvault.com', 'demo1234');
  };

  const logout = () => {
    localStorage.removeItem('kisanvault_jwt');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, demoLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
