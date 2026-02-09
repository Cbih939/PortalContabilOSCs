import React, { useState, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Páginas Compartilhadas e Hooks
import { useAuth } from '../hooks/useAuth.jsx';
import { ROLES } from '../utils/constants.js';
import FinanceiroPage from '../pages/shared/Financeiro.jsx';
import ManutencaoPage from '../pages/Manutencao.jsx';

// Layouts e Guarda
import GuestLayout from '../components/layout/GuestLayout.jsx';
import AppLayout from '../components/layout/AppLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

// Páginas Públicas
import LoginPage from '../pages/Login.jsx';
import NotFoundPage from '../pages/NotFound.jsx';
import RedefinirSenhaPage from '../pages/RedefinirSenha.jsx'; 
import EsqueceuSenhaPage from '../pages/EsqueceuSenha.jsx';
import PrivacyPolicyPage from '../pages/legal/PrivacyPolicyPage.jsx'; 
import TermsOfUsePage from '../pages/legal/TermsOfUsePage.jsx';

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
import HistoricoFinanceiro from '../pages/financeiro/HistoricoFinanceiro.jsx';
import StripeConfig from '../pages/financeiro/StripeConfig.jsx';

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
 * Componente Redirecionador Inicial
 */
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

// --- WRAPPERS DE LAYOUT ---

function AdminLayoutWrapper() {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  return (
    <AppLayout
      user={user}
      sidebarComponent={<AdminSidebar isOpen={isSidebarOpen} user={user} />}
      headerComponent={<AdminHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} user={user} />}
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
  return (
    <AppLayout
      user={user} 
      sidebarComponent={<ContadorSidebar isOpen={isSidebarOpen} user={user} />}
      headerComponent={<ContadorHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} user={user} />}
    />
  );
}

function OSCLayoutWrapper() {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  return (
    <AppLayout
      user={user}
      sidebarComponent={<OSCSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(!isSidebarOpen)} user={user} />}
      headerComponent={<OSCHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} user={user} />}
    />
  );
}

// --- COMPONENTE PRINCIPAL ---

export default function AppRoutes() {
  const { user, isAuthenticated } = useAuth();

  // LOG PARA IDENTIFICAR O ERRO DE STATUS NO CONSOLE (F12)
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log(">>>> DEBUG STATUS FINANCEIRO <<<<");
      console.log("Usuário:", user.name);
      console.log("is_in_debt (banco):", user.is_in_debt);
      console.log("Bloqueio Ativo?", Number(user.is_in_debt) === 1 ? "SIM" : "NÃO");
    }
  }, [user, isAuthenticated]);

  const isDebt = Number(user?.is_in_debt) === 1;

  return (
    <BrowserRouter>
      <Suspense fallback={<div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>Carregando...</div>}>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/manutencao" element={<ManutencaoPage />} />

          {/* Rotas Públicas */}
          <Route element={<GuestLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/esqueceu-senha" element={<EsqueceuSenhaPage />} />
            <Route path="/redefinir-senha/:token" element={<RedefinirSenhaPage />} />
            <Route path="/politica-de-privacidade" element={<PrivacyPolicyPage />} />
            <Route path="/termos-de-uso" element={<TermsOfUsePage />} />
          </Route>

          {/* ADMIN */}
          <Route element={<ProtectedRoute allowedRoles={['admin', ROLES.ADMIN]} />}>
            <Route element={<AdminLayoutWrapper />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/usuarios" element={<ManageUsers />} />
                <Route path="/admin/oscs" element={<ManageOSCs />} />
                <Route path="/admin/biblioteca" element={<ManageLibrary />} />
                <Route path="/admin/financeiro" element={<FinanceiroPage />} />
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

          {/* Rotas do CONTADOR */}
<Route element={<ProtectedRoute allowedRoles={['contador', ROLES.CONTADOR]} />}>
  <Route element={<ContadorLayoutWrapper />}>
      <Route path="/contador/dashboard" element={<ContadorDashboard />} />
      <Route path="/contador/oscs" element={<OSCsPage />} />
      <Route path="/contador/documentos" element={<DocumentsPage />} />
      <Route path="/contador/avisos" element={<NoticesPage />} />
      
      {/* CORREÇÃO AQUI: Verifique se estes nomes de componentes estão importados no topo do arquivo */}
      <Route path="/contador/modelos" element={<ContadorTemplatesPage />} />
      <Route path="/contador/perfil" element={<ContadorProfilePage />} />
      <Route path="/contador/mensagens" element={<ContadorMessagesPage />} />

      {/* Rota padrão para caso ele acesse apenas /contador */}
      <Route path="/contador" element={<Navigate to="/contador/dashboard" replace />} />
  </Route>
</Route>

          {/* OSC - BLOQUEIO DINÂMICO AQUI */}
          <Route element={<ProtectedRoute allowedRoles={['osc', ROLES.OSC]} />}>
            <Route element={<OSCLayoutWrapper />}>
              <Route 
                path="/osc/inicio" 
                element={isDebt ? <Navigate to="/osc/financeiro" replace /> : <OSCDashboard />} 
              />
              <Route 
                path="/osc/documentos" 
                element={isDebt ? <Navigate to="/osc/financeiro" replace /> : <OSCDocumentsPage />} 
              />
              <Route 
                path="/osc/modelos" 
                element={isDebt ? <Navigate to="/osc/financeiro" replace /> : <OSCTemplatesPage />} 
              />
              <Route 
                path="/osc/biblioteca" 
                element={isDebt ? <Navigate to="/osc/financeiro" replace /> : <OSCLibraryPage />} 
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