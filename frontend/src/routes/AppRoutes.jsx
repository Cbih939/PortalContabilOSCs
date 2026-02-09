import React, { useState, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

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

// --- FINANCEIRO ---
import FinanceiroDashboard from '../pages/financeiro/FinanceiroDashboard.jsx';
import FinanceiroSidebar from '../pages/financeiro/components/FinanceiroSidebar.jsx';
import FinanceiroHeader from '../pages/financeiro/components/FinanceiroHeader.jsx';
import StripeConfig from '../pages/financeiro/StripeConfig.jsx';
import HistoricoFinanceiro from '../pages/financeiro/HistoricoFinanceiro.jsx';

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
import OSCFinanceiro from '../pages/osc/OSCFinanceiro.jsx';

/**
 * Componente "Redirecionador"
 */
function RootRedirect() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = user?.role?.toLowerCase().trim();

  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'contador') return <Navigate to="/contador/dashboard" replace />;
  if (role === 'financeiro') return <Navigate to="/financeiro/dashboard" replace />;
  if (role === 'osc') return <Navigate to="/osc/inicio" replace />;

  return <Navigate to="/login" replace />;
}

// --- WRAPPERS DE LAYOUT ---

function AdminLayoutWrapper() {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <AppLayout
      user={user}
      sidebarComponent={<AdminSidebar isOpen={isSidebarOpen} user={user} />}
      headerComponent={<AdminHeader onToggleSidebar={toggleSidebar} user={user} />}
    />
  );
}

function FinanceiroLayoutWrapper() {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <AppLayout
      user={user}
      sidebarComponent={<FinanceiroSidebar isOpen={isSidebarOpen} user={user} />}
      headerComponent={<FinanceiroHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} user={user} />}
    />
  );
}

function ContadorLayoutWrapper() {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  
  return (
    <AppLayout
      user={user} 
      sidebarComponent={<ContadorSidebar isOpen={isSidebarOpen} user={user} />}
      headerComponent={<ContadorHeader onToggleSidebar={toggleSidebar} user={user} />}
    />
  );
}

function OSCLayoutWrapper() {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <AppLayout
      user={user}
      sidebarComponent={<OSCSidebar isOpen={isSidebarOpen} onClose={toggleSidebar} user={user} />}
      headerComponent={<OSCHeader onToggleSidebar={toggleSidebar} user={user} />}
    />
  );
}

// --- DEFINIÇÃO DAS ROTAS ---

export default function AppRoutes() {
  const { user } = useAuth(); // CORREÇÃO: User agora definido no escopo das rotas

  return (
    <BrowserRouter>
      <Suspense fallback={<div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>Carregando...</div>}>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/manutencao" element={<ManutencaoPage />} />

          {/* Rotas Públicas */}
          <Route element={<GuestLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/politica-de-privacidade" element={<PrivacyPolicyPage />} />
            <Route path="/termos-de-uso" element={<TermsOfUsePage />} />
            <Route path="/esqueceu-senha" element={<EsqueceuSenhaPage />} />
            <Route path="/redefinir-senha/:token" element={<RedefinirSenhaPage />} />
          </Route>

          {/* Rotas do ADMIN */}
          <Route element={<ProtectedRoute allowedRoles={['admin', ROLES.ADMIN]} />}>
            <Route element={<AdminLayoutWrapper />}>
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/avisos" element={<AdminNoticesPage />} />
                <Route path="/admin/usuarios" element={<ManageUsers />} />
                <Route path="/admin/oscs" element={<ManageOSCs />} />
                <Route path="/admin/biblioteca" element={<ManageLibrary />} />
                <Route path="/admin/financeiro" element={<FinanceiroPage />} />
            </Route>
          </Route>

          {/* Rotas do FINANCEIRO */}
          <Route element={<ProtectedRoute allowedRoles={['financeiro', 'admin']} />}>
            <Route element={<FinanceiroLayoutWrapper />}>
              <Route path="/financeiro/dashboard" element={<FinanceiroDashboard />} />
              <Route path="/financeiro/gestao" element={<FinanceiroPage />} />
              <Route path="/financeiro/historico" element={<HistoricoFinanceiro />} />
              <Route path="/financeiro/configuracao" element={<StripeConfig />} />
            </Route>
          </Route>

          {/* Rotas do CONTADOR */}
          <Route element={<ProtectedRoute allowedRoles={['contador', ROLES.CONTADOR]} />}>
            <Route element={<ContadorLayoutWrapper />}>
                <Route path="/contador" element={<Navigate to="/contador/dashboard" replace />} />
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

          {/* Rotas da OSC com Bloqueio de Inadimplência */}
          <Route element={<ProtectedRoute allowedRoles={['osc', ROLES.OSC]} />}>
            <Route element={<OSCLayoutWrapper />}>
              <Route 
                path="/osc/inicio" 
                element={Number(user?.is_in_debt) === 1 ? <Navigate to="/osc/financeiro" replace /> : <OSCDashboard />} 
              />
              <Route 
                path="/osc/documentos" 
                element={Number(user?.is_in_debt) === 1 ? <Navigate to="/osc/financeiro" replace /> : <OSCDocumentsPage />} 
              />
              <Route 
                path="/osc/modelos" 
                element={Number(user?.is_in_debt) === 1 ? <Navigate to="/osc/financeiro" replace /> : <OSCTemplatesPage />} 
              />
              <Route 
                path="/osc/biblioteca" 
                element={Number(user?.is_in_debt) === 1 ? <Navigate to="/osc/financeiro" replace /> : <OSCLibraryPage />} 
              />
              <Route path="/osc/mensagens" element={<OSCMessagesPage />} />
              <Route path="/osc/perfil" element={<OSCProfilePage />} />
              <Route path="/osc/financeiro" element={<OSCFinanceiro />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}