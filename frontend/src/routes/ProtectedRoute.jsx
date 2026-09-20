// src/routes/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { normalizeRole } from '../utils/constants.js';

/**
 * @param {string[]} allowedRoles       perfis autorizados (ADMIN | CONTADOR | OSC)
 * @param {boolean}  requireOfficeAdmin exige ADM Contador (contador dono do escritório)
 *
 * A checagem aqui é só de experiência; a autorização real é feita no backend.
 */
const ProtectedRoute = ({ allowedRoles, requireOfficeAdmin = false }) => {
  const { user, isAuthenticated, isOfficeAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = normalizeRole(user?.role);
  const formattedAllowedRoles = allowedRoles.map(normalizeRole);

  if (!formattedAllowedRoles.includes(userRole)) {
    // Se logado mas sem permissão, manda para o RootRedirect decidir
    return <Navigate to="/" replace />;
  }

  if (requireOfficeAdmin && !(userRole === 'ADMIN' || isOfficeAdmin)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
