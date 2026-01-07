// src/routes/AppRoutes.jsx

import React, { useState } from 'react';
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
import PrivacyPolicyPage from '../pages/legal/PrivacyPolicyPage.jsx'; 
import TermsOfUsePage from '../pages/legal/TermsOfUsePage.jsx';

// Páginas e Componentes do Admin (Reais)
import AdminDashboard from '../pages/admin/AdminDashboard.jsx';
import ManageUsers from '../pages/admin/ManageUsers.jsx';
import ManageOSCs from '../pages/admin/ManageOSCs.jsx';
import AdminSidebar from '../pages/admin/components/AdminSidebar.jsx';
import AdminHeader from '../pages/admin/components/AdminHeader.jsx';
import AdminNoticesPage from '../pages/admin/AdminNoticesPage.jsx';

// Páginas e Componentes do Contador (Reais)
import ContadorDashboard from '../pages/contador/ContadorDashboard.jsx';
import OSCsPage from '../pages/contador/OSCs.jsx';
import CreateOSCPage from '../pages/contador/CreateOSCPage.jsx';
import DocumentsPage from '../pages/contador/Documents.jsx';
import NoticesPage from '../pages/contador/Notices.jsx';
import ContadorMessagesPage from '../pages/contador/Messages.jsx';
import ContadorProfilePage from '../pages/contador/Profile.jsx';
import TemplatesPage from '../pages/contador/TemplatesPage.jsx';
import ContadorSidebar from '../pages/contador/components/ContadorSidebar.jsx';
import ContadorHeader from '../pages/contador/components/ContadorHeader.jsx';

// Páginas e Componentes da OSC (Reais)
import OSCDashboard from '../pages/osc/OSCDashboard.jsx';
import OSCDocumentsPage from '../pages/osc/Documents.jsx';
import OSCMessagesPage from '../pages/osc/Messages.jsx';
import OSCProfilePage from '../pages/osc/Profile.jsx';
import OSCSidebar from '../pages/osc/components/OSCSidebar.jsx'; // <--- IMPORTADO
import OSCHeader from '../pages/osc/components/OSCHeader.jsx';
// OSCNavigationTabs foi removido pois agora usamos Sidebar

/**
 * Componente "Redirecionador"
 */
function RootRedirect() {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  switch (user?.role) {
    case ROLES.ADMIN:
      return <Navigate to="/admin/dashboard" replace />;
    case ROLES.CONTADOR:
      return <Navigate to="/contador/dashboard" replace />;
    case ROLES.OSC:
      return <Navigate to="/osc/inicio" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

// Wrapper para Contador (Sidebar + Header)
function ContadorLayoutWrapper() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <AppLayout
      sidebarComponent={<ContadorSidebar isOpen={isSidebarOpen} />}
      headerComponent={<ContadorHeader onToggleSidebar={toggleSidebar} />}
    />
  );
}

// Wrapper para Admin (Sidebar + Header)
function AdminLayoutWrapper() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <AppLayout
      sidebarComponent={<AdminSidebar isOpen={isSidebarOpen} />}
      headerComponent={<AdminHeader onToggleSidebar={toggleSidebar} />}
    />
  );
}

// Wrapper para OSC (Sidebar + Header) -- NOVO!
function OSCLayoutWrapper() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <AppLayout
      // Aqui passamos a OSCSidebar nova que criamos
      sidebarComponent={<OSCSidebar isOpen={isSidebarOpen} />}
      headerComponent={<OSCHeader onToggleSidebar={toggleSidebar} />}
    />
  );
}

/**
 * Define todas as rotas da aplicação.
 */
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- Rota Raiz --- */}
        <Route path="/" element={<RootRedirect />} />

        {/* --- Rotas Públicas (Guest) --- */}
        <Route element={<GuestLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/politica-de-privacidade" element={<PrivacyPolicyPage />} />
          <Route path="/termos-de-uso" element={<TermsOfUsePage />} />
        </Route>

        {/* --- Rotas Protegidas --- */}

        {/* 1. Rotas do ADMIN */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
          <Route element={<AdminLayoutWrapper />}>
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/avisos" element={<AdminNoticesPage />} />
              <Route path="/admin/usuarios" element={<ManageUsers />} />
              <Route path="/admin/oscs" element={<ManageOSCs />} />
          </Route>
        </Route>

        {/* 2. Rotas do CONTADOR */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.CONTADOR]} />}>
          <Route element={<ContadorLayoutWrapper />}>
              <Route path="/contador" element={<Navigate to="/contador/dashboard" replace />} />
              <Route path="/contador/dashboard" element={<ContadorDashboard />} />
              <Route path="/contador/oscs" element={<OSCsPage />} />
              <Route path="/contador/oscs/novo" element={<CreateOSCPage />} />
              <Route path="/contador/documentos" element={<DocumentsPage />} />
              <Route path="/contador/avisos" element={<NoticesPage />} />
              <Route path="/contador/perfil" element={<ContadorProfilePage />} />
              <Route path="/contador/modelos" element={<TemplatesPage />} />
              <Route path="/contador/mensagens" element={<ContadorMessagesPage />} />
          </Route>
        </Route>

        {/* 3. Rotas da OSC - ATUALIZADO PARA USAR SIDEBAR */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.OSC]} />}>
          <Route element={<OSCLayoutWrapper />}> 
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