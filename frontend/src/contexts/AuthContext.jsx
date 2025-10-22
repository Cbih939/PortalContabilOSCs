// src/contexts/AuthContext.jsx

import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
} from 'react';
// Assumindo que Spinner.jsx existirá em ../components/common/Spinner.jsx
import Spinner from '../components/common/Spinner';

// 1. Criar o Contexto e EXPORTÁ-LO
export const AuthContext = createContext(null);

/**
 * Provedor de Autenticação
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true); // Começa true para checar a sessão

  // Efeito para checar o localStorage na inicialização
  useEffect(() => {
    const loadSession = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          // --- Lógica Mock (Atual) ---
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        } catch (error) {
          console.error('Falha ao carregar sessão:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    loadSession();
  }, []);

  /**
   * Função de Login (Mock)
   */
  const login = (userData) => {
    const mockToken = `mock-token-for-${userData.role}-${Date.now()}`;
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', mockToken);
    setUser(userData);
    setToken(mockToken);
  };

  /**
   * Função de Logout
   */
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  // Memoiza o valor do contexto
  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
    }),
    [user, token, isLoading]
  );

  // Spinner de carregamento inicial
  if (isLoading) {
    return <Spinner fullscreen text="Carregando sessão..." />;
  }

  // Fornece o contexto para a aplicação
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}