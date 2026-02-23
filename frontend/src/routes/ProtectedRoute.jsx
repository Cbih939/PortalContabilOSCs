// src/routes/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = user?.role?.toUpperCase().trim();
  const formattedAllowedRoles = allowedRoles.map(role => role.toUpperCase().trim());

  if (!formattedAllowedRoles.includes(userRole)) {
    // Se logado mas sem permissão, manda para o RootRedirect decidir
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;