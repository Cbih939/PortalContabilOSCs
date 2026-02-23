import React, { createContext, useState, useEffect, useMemo } from 'react';
import Spinner from '../components/common/Spinner.jsx';

export const AuthContext = createContext(null);

/**
 * Provedor de Autenticação Centralizado
 * Gerencia o estado do utilizador, token e lógica de redirecionamento pós-login.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  // Efeito para restaurar a sessão ao carregar a página
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
          console.error('[AuthContext] Erro ao carregar sessão do localStorage:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };
    loadSession();
  }, []);

  /**
   * Função de Login
   * @param {object} apiResponseData - Dados vindos do backend { user, token }
   * @returns {string} - A rota de destino correta baseada no perfil e status
   */
  const login = (apiResponseData) => {
    const { user: userData, token: apiToken } = apiResponseData || {};

    if (!userData || !apiToken) {
        console.error("[AuthContext] Dados inválidos recebidos da API.");
        return null;
    }

    // 1. Persistência local para manter logado ao dar F5
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', apiToken);

    // 2. Atualiza o estado global da aplicação
    setUser(userData);
    setToken(apiToken);

    // 3. Lógica de Redirecionamento (Alinhada com AppRoutes.jsx)
    const role = userData.role?.toUpperCase().trim();
    const isDebt = Number(userData.is_in_debt) === 1;

    console.log(`[AuthContext] Login: ${userData.email} | Role: ${role} | Pendência: ${isDebt}`);

    if (role === 'ADMIN') {
      return '/admin/dashboard';
    } 
    
    if (role === 'FINANCEIRO') {
      return '/financeiro/dashboard';
    }

    if (role === 'CONTADOR') {
      return '/contador/dashboard';
    }

    if (role === 'OSC') {
      // Se tiver dívida, vai para a tela de pagamento, senão vai para o início da OSC
      return isDebt ? '/osc/financeiro' : '/osc/inicio';
    }

    // Fallback caso a role não seja reconhecida
    return '/login';
  };

  /**
   * Função de Logout
   */
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    // Redirecionamento forçado para limpar qualquer estado pendente
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