// src/routes/AppRoutes.jsx

import React, { useState } from 'react'; // Import useState
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Hooks e Constantes
import { useAuth } from '../hooks/useAuth.jsx';
import { ROLES } from '../utils/constants.js';

// Layouts
import GuestLayout from '../components/layout/GuestLayout.jsx';
import AppLayout from '../components/layout/AppLayout.jsx';

// Componente "Guarda"
import ProtectedRoute from './ProtectedRoute.jsx';

// Páginas Públicas (Guest)
import LoginPage from '../pages/Login.jsx';
import NotFoundPage from '../pages/NotFound.jsx';

// Páginas e Componentes do Admin (Reais)
import AdminDashboard from '../pages/admin/AdminDashboard.jsx';
import ManageUsers from '../pages/admin/ManageUsers.jsx';
import ManageOSCs from '../pages/admin/ManageOSCs.jsx';
import AdminSidebar from '../pages/admin/components/AdminSidebar.jsx'; // Import Real
import AdminHeader from '../pages/admin/components/AdminHeader.jsx';   // Import Real
// --- PLACEHOLDERS DO ADMIN REMOVIDOS ---

// Páginas e Componentes do Contador (Reais)
import ContadorDashboard from '../pages/contador/ContadorDashboard.jsx';
import OSCsPage from '../pages/contador/OSCs.jsx';
import DocumentsPage from '../pages/contador/Documents.jsx';
import NoticesPage from '../pages/contador/Notices.jsx';
import ContadorMessagesPage from '../pages/contador/Messages.jsx';
import ContadorProfilePage from '../pages/contador/Profile.jsx';
import ContadorSidebar from '../pages/contador/components/ContadorSidebar.jsx';
import ContadorHeader from '../pages/contador/components/ContadorHeader.jsx';

// Páginas e Componentes da OSC (Reais)
import OSCDashboard from '../pages/osc/OSCDashboard.jsx';
import OSCDocumentsPage from '../pages/osc/Documents.jsx';
import OSCMessagesPage from '../pages/osc/Messages.jsx';
import OSCProfilePage from '../pages/osc/Profile.jsx';
import OSCHeader from '../pages/osc/components/OSCHeader.jsx';
import OSCNavigationTabs from '../pages/osc/components/OSCNavigationTabs.jsx';

/**
 * Componente "Redirecionador" (sem alterações)
 */
function RootRedirect() {
  // ... (código do RootRedirect) ...
  console.log('RootRedirect a renderizar');
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    console.log('RootRedirect: Não autenticado, a redirecionar para /login');
    return <Navigate to="/login" replace />;
  }

  console.log('RootRedirect: Autenticado, a redirecionar para dashboard do perfil:', user?.role);
  switch (user?.role) {
    case ROLES.ADMIN:
      return <Navigate to="/admin/dashboard" replace />;
    case ROLES.CONTADOR:
      return <Navigate to="/contador/dashboard" replace />;
    case ROLES.OSC:
      return <Navigate to="/osc/inicio" replace />;
    default:
      console.warn('RootRedirect: Perfil inválido ou não encontrado, a redirecionar para /login');
      return <Navigate to="/login" replace />;
  }
}

/**
 * Componente Wrapper para o Layout do Contador (sem alterações)
 */
function ContadorLayoutWrapper() {
  // ... (código do ContadorLayoutWrapper) ...
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <AppLayout
      sidebarComponent={<ContadorSidebar isOpen={isSidebarOpen} />}
      headerComponent={<ContadorHeader onToggleSidebar={toggleSidebar} />}
    />
  );
}

/**
 * Componente Wrapper para o Layout do Admin (NOVO)
 */
function AdminLayoutWrapper() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <AppLayout
      sidebarComponent={<AdminSidebar isOpen={isSidebarOpen} />} // Usa componente Admin real
      headerComponent={<AdminHeader onToggleSidebar={toggleSidebar} />} // Usa componente Admin real
    />
  );
}


/**
 * Define todas as rotas da aplicação.
 */
export default function AppRoutes() {
  console.log('AppRoutes a renderizar');
  return (
    <BrowserRouter>
      <Routes>
        {/* --- Rota Raiz --- */}
        <Route path="/" element={<RootRedirect />} />

        {/* --- Rotas Públicas (Guest) --- */}
        <Route element={<GuestLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* --- Rotas Protegidas --- */}

        {/* 1. Rotas do ADMIN (Estrutura Corrigida com Wrapper) */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
          {/* Usa o Wrapper do Admin */}
          <Route element={<AdminLayoutWrapper />}>
              {/* Rotas filhas do Admin */}
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/usuarios" element={<ManageUsers />} />
              <Route path="/admin/oscs" element={<ManageOSCs />} />
          </Route>
        </Route>

        {/* 2. Rotas do CONTADOR (Estrutura com Wrapper - sem alterações) */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.CONTADOR]} />}>
          <Route element={<ContadorLayoutWrapper />}>
              <Route path="/contador" element={<Navigate to="/contador/dashboard" replace />} />
              <Route path="/contador/dashboard" element={<ContadorDashboard />} />
              <Route path="/contador/oscs" element={<OSCsPage />} />
              <Route path="/contador/documentos" element={<DocumentsPage />} />
              <Route path="/contador/avisos" element={<NoticesPage />} />
              <Route path="/contador/mensagens" element={<ContadorMessagesPage />} />
              <Route path="/contador/perfil" element={<ContadorProfilePage />} />
          </Route>
        </Route>

        {/* 3. Rotas da OSC */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.OSC]} />}>
          <Route
            element={
              <AppLayout
                headerComponent={<OSCHeader />}
                navigationComponent={<OSCNavigationTabs />}
              />
            }
          >
            <Route path="/osc" element={<Navigate to="/osc/inicio" replace />} />
            <Route path="/osc/inicio" element={<OSCDashboard />} />
            <Route path="/osc/documentos" element={<OSCDocumentsPage />} />
            <Route path="/osc/mensagens" element={<OSCMessagesPage />} />
            <Route path="/osc/perfil" element={<OSCProfilePage />} />
          </Route>
        </Route>

        {/* --- Página 404 (Not Found) --- */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}