import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Páginas Compartilhadas
import FinanceiroPage from '../pages/shared/Financeiro.jsx';
import ManutencaoPage from '../pages/Manutencao.jsx';

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
import RedefinirSenhaPage from '../pages/RedefinirSenha.jsx'; 
import EsqueceuSenhaPage from '../pages/EsqueceuSenha.jsx';

// --- ADMIN ---
import AdminDashboard from '../pages/admin/AdminDashboard.jsx';
import ManageUsers from '../pages/admin/ManageUsers.jsx';
import ManageOSCs from '../pages/admin/ManageOSCs.jsx';
import ManageLibrary from '../pages/admin/ManageLibrary.jsx';
import AdminSidebar from '../pages/admin/components/AdminSidebar.jsx';
import AdminHeader from '../pages/admin/components/AdminHeader.jsx';
import AdminNoticesPage from '../pages/admin/AdminNoticesPage.jsx';

// --- CONTADOR ---
import ContadorDashboard from '../pages/contador/ContadorDashboard.jsx';
import OSCsPage from '../pages/contador/OSCs.jsx';
import CreateOSCPage from '../pages/contador/CreateOSCPage.jsx';
import DocumentsPage from '../pages/contador/Documents.jsx';
import NoticesPage from '../pages/contador/Notices.jsx';
import ContadorMessagesPage from '../pages/contador/Messages.jsx';
import ContadorProfilePage from '../pages/contador/Profile.jsx';
import ContadorTemplatesPage from '../pages/contador/TemplatesPage.jsx';
import ContadorSidebar from '../pages/contador/components/ContadorSidebar.jsx';
import ContadorHeader from '../pages/contador/components/ContadorHeader.jsx';

// --- OSC ---
import OSCDashboard from '../pages/osc/OSCDashboard.jsx';
import OSCDocumentsPage from '../pages/osc/Documents.jsx';
import OSCMessagesPage from '../pages/osc/Messages.jsx';
import OSCProfilePage from '../pages/osc/Profile.jsx';
import OSCTemplatesPage from '../pages/osc/TemplatesPage.jsx';
import OSCLibraryPage from '../pages/osc/LibraryPage.jsx';
import OSCSidebar from '../pages/osc/components/OSCSidebar.jsx';
import OSCHeader from '../pages/osc/components/OSCHeader.jsx';


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
    case 'financeiro':
      return <Navigate to="/financeiro" replace />;
    case ROLES.OSC:
      return <Navigate to="/osc/inicio" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

// Wrapper para Contador
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

// Wrapper para Admin
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

// Wrapper para OSC
function OSCLayoutWrapper() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  return (
    <AppLayout
      sidebarComponent={<OSCSidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />}
      headerComponent={<OSCHeader onToggleSidebar={toggleSidebar} />}
    />
  );
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/manutencao" element={<ManutencaoPage />} />

        {/* --- Rotas Públicas (Guest) --- */}
        <Route element={<GuestLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/politica-de-privacidade" element={<PrivacyPolicyPage />} />
          <Route path="/termos-de-uso" element={<TermsOfUsePage />} />
          <Route path="/esqueceu-senha" element={<EsqueceuSenhaPage />} />
          <Route path="/redefinir-senha/:token" element={<RedefinirSenhaPage />} />
        </Route>

        {/* --- Rotas do ADMIN --- */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
          <Route element={<AdminLayoutWrapper />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/avisos" element={<AdminNoticesPage />} />
            <Route path="/admin/usuarios" element={<ManageUsers />} />
            <Route path="/admin/oscs" element={<ManageOSCs />} />
            <Route path="/admin/biblioteca" element={<ManageLibrary />} />
            <Route path="/admin/financeiro" element={<FinanceiroPage />} />
          </Route>
        </Route>

        {/* --- Rotas do CONTADOR --- */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.CONTADOR]} />}>
          <Route element={<ContadorLayoutWrapper />}>
            <Route path="/contador/dashboard" element={<ContadorDashboard />} />
            <Route path="/contador/oscs" element={<OSCsPage />} />
            <Route path="/contador/oscs/novo" element={<CreateOSCPage />} />
            <Route path="/contador/documentos" element={<DocumentsPage />} />
            <Route path="/contador/avisos" element={<NoticesPage />} />
            <Route path="/contador/perfil" element={<ContadorProfilePage />} />
            <Route path="/contador/modelos" element={<ContadorTemplatesPage />} />
            <Route path="/contador/mensagens" element={<ContadorMessagesPage />} />
          </Route>
        </Route>

        {/* --- Rotas da OSC e FINANCEIRO --- */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.OSC, 'financeiro']} />}>
          <Route element={<OSCLayoutWrapper />}> 
            <Route path="/osc/inicio" element={<OSCDashboard />} />
            <Route path="/osc/documentos" element={<OSCDocumentsPage />} />
            <Route path="/osc/mensagens" element={<OSCMessagesPage />} />
            <Route path="/osc/perfil" element={<OSCProfilePage />} />
            <Route path="/osc/modelos" element={<OSCTemplatesPage />} />
            <Route path="/osc/biblioteca" element={<OSCLibraryPage />} />
            <Route path="/financeiro" element={<FinanceiroPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}