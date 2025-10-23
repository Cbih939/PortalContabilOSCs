// src/contexts/AuthContext.jsx

import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
} from 'react';
// Assumindo que Spinner.jsx existe em ../components/common/Spinner.jsx
import Spinner from '../components/common/Spinner.jsx';
// (Importar serviços API aqui se precisar validar token no useEffect futuramente)
// import * as authService from '../services/authService.js';
// import api from '../services/api.js'; // Para set/clear token header (embora interceptor faça)

// 1. Criar o Contexto e EXPORTÁ-LO
export const AuthContext = createContext(null);

/**
 * Provedor de Autenticação
 *
 * Envolve a aplicação e fornece o estado de autenticação
 * (utilizador, token, status) e as funções (login, logout).
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Estado do utilizador logado
  const [token, setToken] = useState(localStorage.getItem('token')); // Estado do token
  const [isLoading, setIsLoading] = useState(true); // Controla o spinner inicial

  // Efeito para carregar a sessão do localStorage na inicialização
  useEffect(() => {
    const loadSession = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          // --- Lógica Mock (Atual) ---
          // Simplesmente carrega do localStorage.
          // Numa app real, faria uma chamada à API (ex: authService.validateToken())
          // para confirmar se o token ainda é válido no backend.
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);
          // O interceptor em 'api.js' já adiciona o token aos headers automaticamente
        } catch (error) {
          // Se o 'user' no localStorage for inválido ou ocorrer outro erro
          console.error('[AuthContext] Falha ao carregar sessão do localStorage:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
        }
      }
      // Marca que a verificação inicial terminou (remove o spinner)
      setIsLoading(false);
    };

    loadSession();
  }, []); // O array vazio [] garante que rode apenas UMA VEZ na montagem

  /**
   * Função de Login (ATUALIZADA para API)
   * Recebe a resposta da API { user, token }.
   * Chamada pela LoginPage após um pedido de login bem-sucedido.
   *
   * @param {object} apiResponseData - Objeto esperado: { user: object, token: string }
   */
  const login = (apiResponseData) => {
    // Extrai user e token da resposta
    const { user: userData, token: apiToken } = apiResponseData || {}; // Garante que não é undefined

    // Validação básica dos dados recebidos
    if (!userData || !apiToken) {
        console.error("[AuthContext] Dados inválidos recebidos da API de login.", apiResponseData);
        // (Opcional) Poderia chamar 'addNotification' aqui se o importasse
        return; // Interrompe o processo de login
    }

    // 1. Guarda no localStorage para persistência entre recargas
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', apiToken);

    // 2. Atualiza o estado interno do React
    setUser(userData);
    setToken(apiToken);

    // 3. O interceptor em 'api.js' cuidará de adicionar o token
    //    aos headers das próximas requisições automaticamente.
    console.log('[AuthContext] Utilizador autenticado:', userData.email, 'Perfil:', userData.role);
  };

  /**
   * Função de Logout
   * Remove os dados do estado e do localStorage.
   */
  const logout = () => {
    // 1. Limpa o localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    // 2. Limpa o estado interno do React
    setUser(null);
    setToken(null);

    // 3. (Opcional) Chamar API de logout se o backend exigir
    // authService.logout().catch(err => console.error("Erro no logout da API:", err));

    console.log('[AuthContext] Utilizador deslogado.');
    // O redirecionamento para /login é tratado pelo ProtectedRoute/RootRedirect
  };

  // Memoiza o valor do contexto para otimização.
  // Recalcula apenas se user, token ou isLoading mudarem.
  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!user, // Converte 'user' num booleano (true se user não for null)
      isLoading,              // Estado do carregamento inicial da sessão
      login,                  // Função para fazer login
      logout,                 // Função para fazer logout
    }),
    [user, token, isLoading]
  );

  // Exibe um spinner em tela cheia apenas durante o carregamento inicial da sessão.
  if (isLoading) {
    return <Spinner fullscreen text="Carregando sessão..." />;
  }

  // Se o carregamento terminou, fornece o contexto (value) para os componentes filhos
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// O hook 'useAuth' fica no ficheiro 'src/hooks/useAuth.jsx'