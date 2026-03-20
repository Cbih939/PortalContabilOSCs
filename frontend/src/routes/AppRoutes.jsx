import React, { useState, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// --- INFRAESTRUTURA ---
import { useAuth } from '../hooks/useAuth.jsx';
import { ROLES } from '../utils/constants.js';
import ProtectedRoute from './ProtectedRoute.jsx';
import AppLayout from '../components/layout/AppLayout.jsx';
import GuestLayout from '../components/layout/GuestLayout.jsx';
import Spinner from '../components/common/Spinner.jsx';
import MaintenanceWatcher from '../components/common/MaintenanceWatcher.jsx';

// --- PÁGINAS PÚBLICAS ---
import LoginPage from '../pages/Login.jsx';
import RegisterOSC from '../pages/auth/RegisterOSC.jsx'; 
import NotFoundPage from '../pages/NotFound.jsx';
import EsqueceuSenhaPage from '../pages/EsqueceuSenha.jsx';
import RedefinirSenhaPage from '../pages/RedefinirSenha.jsx';
import ManualPage from '../pages/shared/ManualPage.jsx';
import MaintenancePage from '../pages/shared/MaintenancePage.jsx';

// --- ADMIN ---
import AdminDashboard from '../pages/admin/AdminDashboard.jsx';
import ManageUsers from '../pages/admin/ManageUsers.jsx';
import ManageOSCs from '../pages/admin/ManageOSCs.jsx';
import ManageLibrary from '../pages/admin/ManageLibrary.jsx';
import ManageOffices from '../pages/admin/ManageOffices.jsx';
import AdminSidebar from '../pages/admin/components/AdminSidebar.jsx';
import AdminHeader from '../pages/admin/components/AdminHeader.jsx';
import AdminNoticesPage from '../pages/admin/AdminNoticesPage.jsx';
import AdminProfile from '../pages/admin/AdminProfile.jsx';

// --- FINANCEIRO ---
import FinanceiroDashboard from '../pages/financeiro/FinanceiroDashboard.jsx';
import FinanceiroSidebar from '../pages/financeiro/components/FinanceiroSidebar.jsx';
import FinanceiroHeader from '../pages/financeiro/components/FinanceiroHeader.jsx';
import FinanceiroPage from '../pages/shared/Financeiro.jsx';
import HistoricoFinanceiro from '../pages/financeiro/HistoricoFinanceiro.jsx';
import StripeConfig from '../pages/financeiro/StripeConfig.jsx';

// --- CONTADOR ---
import ContadorDashboard from '../pages/contador/ContadorDashboard.jsx';
import OSCsPage from '../pages/contador/OSCs.jsx';
import DocumentsPage from '../pages/contador/Documents.jsx';
import NoticesPage from '../pages/contador/Notices.jsx';
import ContadorMessagesPage from '../pages/contador/Messages.jsx';
import ContadorProfilePage from '../pages/contador/Profile.jsx';
import ContadorTemplatesPage from '../pages/contador/TemplatesPage.jsx';
import ContadorSidebar from '../pages/contador/components/ContadorSidebar.jsx';
import ContadorHeader from '../pages/contador/components/ContadorHeader.jsx';
import ContadorReportsPage from '../pages/contador/Reports.jsx';
import ManageCertificates from '../pages/contador/ManageCertificates.jsx';

// --- OSC ---
import OSCDashboard from '../pages/osc/OSCDashboard.jsx';
import OSCDocumentsPage from '../pages/osc/Documents.jsx';
import OSCMessagesPage from '../pages/osc/Messages.jsx';
import OSCProfilePage from '../pages/osc/Profile.jsx';
import OSCTemplatesPage from '../pages/osc/TemplatesPage.jsx';
import OSCLibraryPage from '../pages/osc/LibraryPage.jsx';
import OSCFinanceiro from '../pages/osc/OSCFinanceiro.jsx';
import OSCSidebar from '../pages/osc/components/OSCSidebar.jsx';
import OSCHeader from '../pages/osc/components/OSCHeader.jsx';
import ProjectsPage from '../pages/osc/Projects.jsx';
import GovernancePage from '../pages/osc/Governance.jsx';
import HelpPage from '../pages/osc/Help.jsx';

/**
 * Redirecionador Inteligente
 * Resolve o destino inicial do utilizador com base na Role e Status Financeiro.
 */
function RootRedirect() {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const role = user?.role?.toUpperCase().trim();
  const isDebt = role === 'OSC' && Number(user?.is_in_debt) === 1;

  if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'CONTADOR') return <Navigate to="/contador/dashboard" replace />;
  if (role === 'FINANCEIRO') return <Navigate to="/financeiro/dashboard" replace />;
  
  if (role === 'OSC') {
    // Se tiver dívida, manda direto para a página financeira para evitar loops
    return isDebt 
      ? <Navigate to="/osc/financeiro" replace /> 
      : <Navigate to="/osc/inicio" replace />;
  }

  return <Navigate to="/login" replace />;
}

// --- LAYOUT WRAPPERS (Consistentes) ---
const AdminLayoutWrapper = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  return (
    <AppLayout
      user={user}
      sidebarComponent={<AdminSidebar isOpen={isSidebarOpen} user={user} />}
      headerComponent={<AdminHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} user={user} />}
    />
  );
};

const FinanceiroLayoutWrapper = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  return (
    <AppLayout
      user={user}
      sidebarComponent={<FinanceiroSidebar isOpen={isSidebarOpen} user={user} />}
      headerComponent={<FinanceiroHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} user={user} />}
    />
  );
};

const ContadorLayoutWrapper = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  return (
    <AppLayout
      user={user}
      sidebarComponent={<ContadorSidebar isOpen={isSidebarOpen} user={user} />}
      headerComponent={<ContadorHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} user={user} />}
    />
  );
};

const OSCLayoutWrapper = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  return (
    <AppLayout
      user={user}
      sidebarComponent={<OSCSidebar isOpen={isSidebarOpen} user={user} />}
      headerComponent={<OSCHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} user={user} />}
    />
  );
};

export default function AppRoutes() {
  const { user } = useAuth();
  
  // Normalização para as rotas internas
  const role = user?.role?.toUpperCase().trim();
  const isDebt = role === 'OSC' && Number(user?.is_in_debt) === 1;

  return (
    <BrowserRouter>
      {/* VIGIA DE MANUTENÇÃO FICA AQUI */}
      <MaintenanceWatcher />
      
      <Suspense fallback={<Spinner text="Carregando..." />}>
        <Routes>
          {/* Rota Raiz */}
          <Route path="/" element={<RootRedirect />} />
          
          {/* ROTA DO MANUAL (Pública para todos - Visitantes ou Logados) */}
          <Route path="/manual" element={<ManualPage />} />
          
          {/* ROTA DE MANUTENÇÃO (Para onde os utilizadores são atirados) */}
          <Route path="/manutencao" element={<MaintenancePage />} />

          {/* Rotas Públicas (Apenas Visitantes sem Login) */}
          <Route element={<GuestLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register-osc" element={<RegisterOSC />} />
            <Route path="/esqueceu-senha" element={<EsqueceuSenhaPage />} />
            <Route path="/redefinir-senha/:token" element={<RedefinirSenhaPage />} />
          </Route>

          {/* ADMIN (Acesso restrito) */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route element={<AdminLayoutWrapper />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/usuarios" element={<ManageUsers />} />
              <Route path="/admin/oscs" element={<ManageOSCs />} />
              <Route path="/admin/biblioteca" element={<ManageLibrary />} />
              <Route path="/admin/financeiro" element={<FinanceiroPage />} />
              <Route path="/admin/avisos" element={<AdminNoticesPage />} />
              <Route path="/admin/profile" element={<AdminProfile />} />
              <Route path="/admin/offices" element={<ManageOffices />} /> 
            </Route>
          </Route>

          {/* FINANCEIRO (Acesso para financeiro e admin) */}
          <Route element={<ProtectedRoute allowedRoles={['FINANCEIRO', 'ADMIN']} />}>
            <Route element={<FinanceiroLayoutWrapper />}>
              <Route path="/financeiro/dashboard" element={<FinanceiroDashboard />} />
              <Route path="/financeiro/gestao" element={<FinanceiroPage />} />
              <Route path="/financeiro/historico" element={<HistoricoFinanceiro />} />
              <Route path="/financeiro/configuracao" element={<StripeConfig />} />
            </Route>
          </Route>

          {/* CONTADOR */}
          <Route element={<ProtectedRoute allowedRoles={['CONTADOR']} />}>
            <Route element={<ContadorLayoutWrapper />}>
              <Route path="/contador/dashboard" element={<ContadorDashboard />} />
              <Route path="/contador/oscs" element={<OSCsPage />} />
              <Route path="/contador/documentos" element={<DocumentsPage />} />
              <Route path="/contador/avisos" element={<NoticesPage />} />
              <Route path="/contador/mensagens" element={<ContadorMessagesPage />} />
              <Route path="/contador/modelos" element={<ContadorTemplatesPage />} />
              <Route path="/contador/perfil" element={<ContadorProfilePage />} />
              <Route path="/contador/relatorios" element={<ContadorReportsPage />} />
              <Route path="/contador/certificadoras" element={<ManageCertificates />} />
            </Route>
          </Route>

          {/* OSC - Bloqueio de funcionalidades em caso de dívida */}
          <Route element={<ProtectedRoute allowedRoles={['OSC']} />}>
            <Route element={<OSCLayoutWrapper />}>
              <Route path="/osc/inicio" element={isDebt ? <Navigate to="/osc/financeiro" replace /> : <OSCDashboard />} />
              <Route path="/osc/documentos" element={isDebt ? <Navigate to="/osc/financeiro" replace /> : <OSCDocumentsPage />} />
              <Route path="/osc/modelos" element={isDebt ? <Navigate to="/osc/financeiro" replace /> : <OSCTemplatesPage />} />
              <Route path="/osc/biblioteca" element={isDebt ? <Navigate to="/osc/financeiro" replace /> : <OSCLibraryPage />} />
              <Route path="/osc/projetos" element={<ProjectsPage />} />
              <Route path="/osc/governanca" element={<GovernancePage />} />
              
              {/* Rotas de utilidade (Sempre abertas) */}
              <Route path="/osc/mensagens" element={<OSCMessagesPage />} />
              <Route path="/osc/perfil" element={<OSCProfilePage />} />
              <Route path="/osc/financeiro" element={<OSCFinanceiro />} />
              <Route path="/osc/ajuda" element={<HelpPage />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}