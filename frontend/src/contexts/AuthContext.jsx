import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import Spinner from '../components/common/Spinner.jsx';
import api from '../services/api.js';
import { normalizeRole, isOfficeAdmin as checkOfficeAdmin, homePathFor } from '../utils/constants.js';

export const AuthContext = createContext(null);

const ONBOARDING_LOCAL_KEY = 'onboarding_done_';

/**
 * Provedor de Autenticação Centralizado
 * Gerencia o estado do utilizador, token e lógica de redirecionamento pós-login.
 * O perfil e o status vêm sempre normalizados; a sessão é revalidada em /auth/me.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  const persistUser = useCallback((userData) => {
    const normalized = { ...userData, role: normalizeRole(userData.role) };
    localStorage.setItem('user', JSON.stringify(normalized));
    setUser(normalized);
    return normalized;
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  }, []);

  /** Recarrega os dados frescos do usuário (débito, escritório, ADM, onboarding). */
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      if (data?.user) return persistUser(data.user);
    } catch (error) {
      // 403 = conta inativa/perfil descontinuado. 401 já é tratado pelo interceptor do axios.
      if (error?.response?.status === 403) {
        clearSession();
        window.location.href = '/login';
      }
    }
    return null;
  }, [persistUser, clearSession]);

  // Restaura a sessão ao carregar a página e a revalida em segundo plano
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setUser({ ...JSON.parse(storedUser) });
        setToken(storedToken);
      } catch (error) {
        console.error('[AuthContext] Erro ao carregar sessão do localStorage:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);

    if (storedToken) refreshUser();
  }, [refreshUser]);

  /**
   * Login. Recebe { user, token } da API e devolve a rota de destino do perfil.
   */
  const login = (apiResponseData) => {
    const { user: userData, token: apiToken } = apiResponseData || {};

    if (!userData || !apiToken) {
      console.error('[AuthContext] Dados inválidos recebidos da API.');
      return null;
    }

    localStorage.setItem('token', apiToken);
    setToken(apiToken);
    const normalized = persistUser(userData);

    return homePathFor(normalized);
  };

  const logout = () => {
    clearSession();
    // Redirecionamento forçado para limpar qualquer estado pendente
    window.location.href = '/login';
  };

  /** Registra no servidor que o usuário concluiu (ou pulou) o tour de primeiro acesso. */
  const completeOnboarding = useCallback(async () => {
    if (!user) return;
    const stamp = new Date().toISOString();
    // Marca localmente na hora (também serve de reserva se a migração do banco ainda estiver pendente).
    localStorage.setItem(ONBOARDING_LOCAL_KEY + user.id, stamp);
    setUser((prev) => (prev ? { ...prev, onboarding_completed_at: stamp } : prev));
    try {
      await api.post('/auth/onboarding/complete');
      await refreshUser();
    } catch (error) {
      console.warn('[AuthContext] Onboarding registrado só localmente:', error?.response?.status);
    }
  }, [user, refreshUser]);

  const hasCompletedOnboarding = useMemo(() => {
    if (!user) return true;
    return !!user.onboarding_completed_at || !!localStorage.getItem(ONBOARDING_LOCAL_KEY + user.id);
  }, [user]);

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: !!user,
    isOfficeAdmin: checkOfficeAdmin(user),
    hasCompletedOnboarding,
    isLoading,
    login,
    logout,
    refreshUser,
    completeOnboarding,
  }), [user, token, isLoading, hasCompletedOnboarding, refreshUser, completeOnboarding]);

  if (isLoading) {
    return <Spinner fullscreen text="Validando acesso..." />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
