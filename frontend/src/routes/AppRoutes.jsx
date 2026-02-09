import React, { useState, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// --- INFRAESTRUTURA ---
import { useAuth } from '../hooks/useAuth.jsx';
import { ROLES } from '../utils/constants.js';
import ProtectedRoute from './ProtectedRoute.jsx';
import AppLayout from '../components/layout/AppLayout.jsx';
import GuestLayout from '../components/layout/GuestLayout.jsx';
import Spinner from '../components/common/Spinner.jsx';

// --- PÁGINAS PÚBLICAS ---
import LoginPage from '../pages/Login.jsx';
import NotFoundPage from '../pages/NotFound.jsx';
import EsqueceuSenhaPage from '../pages/EsqueceuSenha.jsx';
import RedefinirSenhaPage from '../pages/RedefinirSenha.jsx';

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

// --- REDIRECIONADOR ---
function RootRedirect() {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const role = user?.role?.toLowerCase().trim();
  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'contador') return <Navigate to="/contador/dashboard" replace />;
  if (role === 'financeiro') return <Navigate to="/financeiro/dashboard" replace />;
  if (role === 'osc') return <Navigate to="/osc/inicio" replace />;
  return <Navigate to="/login" replace />;
}

// --- LAYOUT WRAPPERS ---
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
  const isDebt = user?.role?.toLowerCase() === 'osc' && Number(user?.is_in_debt) === 1;

  return (
    <BrowserRouter>
      <Suspense fallback={<Spinner text="Carregando..." />}>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          
          <Route element={<GuestLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/esqueceu-senha" element={<EsqueceuSenhaPage />} />
            <Route path="/redefinir-senha/:token" element={<RedefinirSenhaPage />} />
          </Route>

          {/* ADMIN */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<AdminLayoutWrapper />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/usuarios" element={<ManageUsers />} />
              <Route path="/admin/oscs" element={<ManageOSCs />} />
              <Route path="/admin/biblioteca" element={<ManageLibrary />} />
              <Route path="/admin/financeiro" element={<FinanceiroPage />} />
              <Route path="/admin/avisos" element={<AdminNoticesPage />} />
            </Route>
          </Route>

          {/* FINANCEIRO */}
          <Route element={<ProtectedRoute allowedRoles={['financeiro', 'admin']} />}>
            <Route element={<FinanceiroLayoutWrapper />}>
              <Route path="/financeiro/dashboard" element={<FinanceiroDashboard />} />
              <Route path="/financeiro/gestao" element={<FinanceiroPage />} />
              <Route path="/financeiro/historico" element={<HistoricoFinanceiro />} />
              <Route path="/financeiro/configuracao" element={<StripeConfig />} />
            </Route>
          </Route>

          {/* CONTADOR */}
          <Route element={<ProtectedRoute allowedRoles={['contador']} />}>
            <Route element={<ContadorLayoutWrapper />}>
              <Route path="/contador/dashboard" element={<ContadorDashboard />} />
              <Route path="/contador/oscs" element={<OSCsPage />} />
              <Route path="/contador/documentos" element={<DocumentsPage />} />
              <Route path="/contador/avisos" element={<NoticesPage />} />
              <Route path="/contador/mensagens" element={<ContadorMessagesPage />} />
              <Route path="/contador/modelos" element={<ContadorTemplatesPage />} />
              <Route path="/contador/perfil" element={<ContadorProfilePage />} />
            </Route>
          </Route>

          {/* OSC */}
          <Route element={<ProtectedRoute allowedRoles={['osc']} />}>
            <Route element={<OSCLayoutWrapper />}>
              <Route path="/osc/inicio" element={isDebt ? <Navigate to="/osc/financeiro" /> : <OSCDashboard />} />
              <Route path="/osc/documentos" element={isDebt ? <Navigate to="/osc/financeiro" /> : <OSCDocumentsPage />} />
              <Route path="/osc/modelos" element={isDebt ? <Navigate to="/osc/financeiro" /> : <OSCTemplatesPage />} />
              <Route path="/osc/biblioteca" element={isDebt ? <Navigate to="/osc/financeiro" /> : <OSCLibraryPage />} />
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