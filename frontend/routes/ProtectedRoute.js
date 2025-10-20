// src/routes/ProtectedRoute.js

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Um componente "guarda" para rotas protegidas.
 *
 * Props:
 * - allowedRoles (array): (Opcional) Array de 'roles' que podem aceder
 * a esta rota (ex: [ROLES.ADMIN, ROLES.CONTADOR]).
 */
export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation(); // Guarda a localização atual

  // 1. O utilizador está autenticado?
  if (!isAuthenticated) {
    // Não está. Redireciona para /login, guardando a página
    // que ele tentava aceder ('state={{ from: location }}')
    // para que possamos redirecioná-lo de volta após o login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. O utilizador está autenticado, mas a rota exige um perfil específico?
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Sim, mas o utilizador não tem permissão.
    // Redireciona-o para a página inicial (que o
    // AppRoutes.js redirecionará para o dashboard *dele*).
    return <Navigate to="/" replace />;
  }

  // 3. O utilizador está autenticado e autorizado.
  // Renderiza o conteúdo da rota (seja o <AppLayout> ou a página).
  return <Outlet />;
}