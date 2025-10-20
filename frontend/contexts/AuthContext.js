// src/contexts/AuthContext.js

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from 'react';
import Spinner from '../components/common/Spinner';
// import { setApiAuthHeader, clearApiAuthHeader } from '../services/api'; // (Passo futuro)
// import { validateToken } from '../services/authService'; // (Passo futuro)

// 1. Criar o Contexto
const AuthContext = createContext(null);

/**
 * Provedor de Autenticação
 *
 * Este componente envolve a aplicação e fornece o estado de autenticação
 * (usuário, token, status) e as funções (login, logout) para
 * todos os componentes filhos.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true); // Começa true para checar a sessão

  // Efeito para checar o localStorage na inicialização da aplicação
  useEffect(() => {
    const loadSession = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          // --- Lógica Futura com API Real ---
          // Aqui, você faria uma chamada à API para validar o 'storedToken'
          // const validUser = await validateToken(storedToken);
          // setUser(validUser);
          // setApiAuthHeader(storedToken);

          // --- Lógica Mock (Atual) ---
          // Por enquanto, apenas confiamos nos dados do localStorage
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        } catch (error) {
          // Se o token for inválido ou o 'user' for malformado
          console.error('Falha ao carregar sessão:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
        }
      }
      // Marca que a verificação inicial terminou
      setIsLoading(false);
    };

    loadSession();
  }, []); // O array vazio [] garante que isso rode apenas UMA VEZ

  /**
   * Função de Login
   * (Para a tela de Login)
   *
   * Em uma aplicação real, isso receberia (email, password),
   * chamaria a API, e receberia o 'user' e 'token' como resposta.
   *
   * Por enquanto, ela aceita o objeto 'userData' direto da nossa
   * tela de login mocada.
   */
  const login = (userData) => {
    // Simula um token (em uma API real, o backend retornaria isso)
    const mockToken = `mock-token-for-${userData.role}-${Date.now()}`;

    // 1. Salva no localStorage para persistência
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', mockToken);

    // 2. (Passo futuro) Adiciona o token aos headers da API
    // setApiAuthHeader(mockToken);

    // 3. Atualiza o estado global
    setUser(userData);
    setToken(mockToken);
  };

  /**
   * Função de Logout
   * (Para os botões de "Sair")
   */
  const logout = () => {
    // 1. Limpa o localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    // 2. (Passo futuro) Remove o token dos headers da API
    // clearApiAuthHeader();

    // 3. Limpa o estado global
    setUser(null);
    setToken(null);
  };

  // Memoiza o valor do contexto para evitar re-renderizações desnecessárias
  // dos componentes filhos.
  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!user, // Converte 'user' em um booleano (true/false)
      isLoading,
      login,
      logout,
    }),
    [user, token, isLoading] // Recalcula o 'value' apenas se estes mudarem
  );

  // Se ainda estivermos checando a sessão, exibe um spinner em tela cheia.
  // Isso previne que o usuário veja a tela de Login por 1 segundo
  // antes de ser redirecionado para o Dashboard.
  if (isLoading) {
    return <Spinner fullscreen text="Carregando sessão..." />;
  }

  // Se a verificação terminou, fornece o contexto para a aplicação
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook customizado: useAuth
 *
 * Facilita o acesso ao contexto de autenticação em qualquer
 * componente, sem precisar importar 'useContext' e 'AuthContext'
 * toda vez.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};