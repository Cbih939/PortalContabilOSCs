import React, { createContext, useState, useEffect, useMemo } from 'react';
import Spinner from '../components/common/Spinner.jsx';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);
        } catch (error) {
          console.error('[AuthContext] Erro ao carregar sessão:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };
    loadSession();
  }, []);

  const login = (apiResponseData) => {
    const { user: userData, token: apiToken } = apiResponseData || {};

    if (!userData || !apiToken) {
        console.error("[AuthContext] Dados inválidos da API.");
        return null;
    }

    // Persistência
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', apiToken);

    // Estado React
    setUser(userData);
    setToken(apiToken);

    console.log('[AuthContext] Login efetuado:', userData.role);
    
    // Retorna o destino baseado no perfil para a LoginPage navegar
    if (userData.role === 'ADMIN' || userData.role === 'FINANCEIRO') {
      return '/admin/dashboard';
    } else if (userData.role === 'OSC' && userData.is_in_debt === 1) {
      return '/dashboard/financeiro';
    }
    return '/dashboard';
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    window.location.href = '/login';
  };

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  }), [user, token, isLoading]);

  if (isLoading) {
    return <Spinner fullscreen text="Validando acesso..." />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}