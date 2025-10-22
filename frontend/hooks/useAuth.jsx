// src/hooks/useAuth.js

import { useContext } from 'react';
// Importa o *contexto* (o objeto 'caixa') do arquivo de contexto
import { AuthContext } from '../contexts/AuthContext';

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
    // Este erro garante que o hook só será usado por componentes
    // que estão "dentro" do <AuthProvider>
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
};

/**
 * --- Como Usar ---
 *
 * import { useAuth } from '../../hooks/useAuth';
 *
 * function MyComponent() {
 * // Agora o import é do 'hooks', não mais do 'contexts'
 * const { user, logout } = useAuth();
 *
 * // ...
 * }
 */