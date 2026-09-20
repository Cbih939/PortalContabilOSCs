import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// --- INFRAESTRUTURA ---
import { useAuth } from '../hooks/useAuth.jsx';
import { homePathFor, normalizeRole, ROLES } from '../utils/constants.js';
import ProtectedRoute from './ProtectedRoute.jsx';
import AppShell from '../components/shell/AppShell.jsx';
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
import LandingPage from '../pages/LandingPage.jsx';
import PrivacyPolicyPage from '../pages/legal/PrivacyPolicyPage.jsx';
import TermsOfUsePage from '../pages/legal/TermsOfUsePage.jsx';

// --- ADMIN ---
import AdminDashboard from '../pages/admin/AdminDashboard.jsx';
import ManageUsers from '../pages/admin/ManageUsers.jsx';
import ManageOSCs from '../pages/admin/ManageOSCs.jsx';
import ManageLibrary from '../pages/admin/ManageLibrary.jsx';
import ManageOffices from '../pages/admin/ManageOffices.jsx';
import AdminNoticesPage from '../pages/admin/AdminNoticesPage.jsx';
import AdminProfile from '../pages/admin/AdminProfile.jsx';
import ManagePlans from '../pages/admin/ManagePlans.jsx';

// --- FINANCEIRO (Admin + ADM Contador) ---
import FinanceiroHub from '../pages/financeiro/FinanceiroHub.jsx';

// --- CONTADOR ---
import ContadorDashboard from '../pages/contador/ContadorDashboard.jsx';
import OSCsPage from '../pages/contador/OSCs.jsx';
import DocumentsPage from '../pages/contador/Documents.jsx';
import NoticesPage from '../pages/contador/Notices.jsx';
import ContadorMessagesPage from '../pages/contador/Messages.jsx';
import ContadorProfilePage from '../pages/contador/Profile.jsx';
import ContadorTemplatesPage from '../pages/contador/TemplatesPage.jsx';
import ManageCertificates from '../pages/contador/ManageCertificates.jsx';
import SystemReports from '../pages/contador/SystemReports.jsx';
import TeamPage from '../pages/contador/TeamPage.jsx';

// --- OSC ---
import OSCDashboard from '../pages/osc/OSCDashboard.jsx';
import OSCDocumentsPage from '../pages/osc/Documents.jsx';
import OSCMessagesPage from '../pages/osc/Messages.jsx';
import OSCProfilePage from '../pages/osc/Profile.jsx';
import OSCTemplatesPage from '../pages/osc/TemplatesPage.jsx';
import OSCLibraryPage from '../pages/osc/LibraryPage.jsx';
import OSCFinanceiro from '../pages/osc/OSCFinanceiro.jsx';
import ProjectsPage from '../pages/osc/Projects.jsx';
import GovernancePage from '../pages/osc/Governance.jsx';
import HelpPage from '../pages/osc/Help.jsx';
import PrestacaoContasPage from '../pages/osc/PrestacaoContas.jsx';

/** Sessão com perfil desconhecido/descontinuado (ex.: antigo FINANCEIRO): encerra e volta ao login. */
function ForceLogout() {
  const { logout } = useAuth();
  useEffect(() => { logout(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return <Spinner fullscreen text="Encerrando sessão..." />;
}

/**
 * Redirecionador Inteligente: leva cada perfil à sua tela inicial.
 */
function RootRedirect() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const role = normalizeRole(user?.role);
  if (![ROLES.ADMIN, ROLES.CONTADOR, ROLES.OSC].includes(role)) return <ForceLogout />;

  return <Navigate to={homePathFor(user)} replace />;
}

/** Mantém a query string ao redirecionar (ex.: ?success=true do Stripe). */
function RedirectKeepSearch({ to }) {
  const { search } = useLocation();
  return <Navigate to={`${to}${search}`} replace />;
}

export default function AppRoutes() {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const isDebt = role === ROLES.OSC && Number(user?.is_in_debt) === 1;

  // Telas da OSC bloqueadas enquanto houver débito (o servidor também bloqueia)
  const gate = (element) => (isDebt ? <Navigate to="/osc/financeiro" replace /> : element);

  return (
    <BrowserRouter>
      <MaintenanceWatcher />

      <Suspense fallback={<Spinner text="Carregando..." />}>
        <Routes>
          <Route path="/" element={<RootRedirect />} />

          {/* Páginas abertas a todos */}
          <Route path="/manual" element={<ManualPage />} />
          <Route path="/manutencao" element={<MaintenancePage />} />
          <Route path="/landpage" element={<LandingPage />} />
          <Route path="/politica-de-privacidade" element={<PrivacyPolicyPage />} />
          <Route path="/termos-de-uso" element={<TermsOfUsePage />} />

          {/* Rotas antigas */}
          <Route path="/financeiro/*" element={<Navigate to="/" replace />} />
          <Route path="/dashboard/financeiro" element={<RedirectKeepSearch to="/osc/financeiro" />} />

          {/* Visitantes */}
          <Route element={<GuestLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register-osc" element={<RegisterOSC />} />
            <Route path="/esqueceu-senha" element={<EsqueceuSenhaPage />} />
            <Route path="/redefinir-senha/:token" element={<RedefinirSenhaPage />} />
          </Route>

          {/* ADMINISTRADOR */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route element={<AppShell />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/usuarios" element={<ManageUsers />} />
              <Route path="/admin/oscs" element={<ManageOSCs />} />
              <Route path="/admin/biblioteca" element={<ManageLibrary />} />
              <Route path="/admin/financeiro" element={<FinanceiroHub />} />
              <Route path="/admin/avisos" element={<AdminNoticesPage />} />
              <Route path="/admin/profile" element={<AdminProfile />} />
              <Route path="/admin/offices" element={<ManageOffices />} />
              <Route path="/admin/relatorios" element={<SystemReports />} />
              <Route path="/admin/planos" element={<ManagePlans />} />
            </Route>
          </Route>

          {/* CONTADOR (inclui ADM Contador) */}
          <Route element={<ProtectedRoute allowedRoles={['CONTADOR']} />}>
            <Route element={<AppShell />}>
              <Route path="/contador/dashboard" element={<ContadorDashboard />} />
              <Route path="/contador/oscs" element={<OSCsPage />} />
              <Route path="/contador/documentos" element={<DocumentsPage />} />
              <Route path="/contador/avisos" element={<NoticesPage />} />
              <Route path="/contador/mensagens" element={<ContadorMessagesPage />} />
              <Route path="/contador/modelos" element={<ContadorTemplatesPage />} />
              <Route path="/contador/perfil" element={<ContadorProfilePage />} />
              <Route path="/contador/certificadoras" element={<ManageCertificates />} />
              <Route path="/contador/relatorios" element={<SystemReports />} />

              {/* Somente ADM Contador (dono do escritório) */}
              <Route element={<ProtectedRoute allowedRoles={['CONTADOR']} requireOfficeAdmin />}>
                <Route path="/contador/equipe" element={<TeamPage />} />
                <Route path="/contador/financeiro" element={<FinanceiroHub />} />
              </Route>
            </Route>
          </Route>

          {/* OSC — bloqueio de funcionalidades em caso de débito */}
          <Route element={<ProtectedRoute allowedRoles={['OSC']} />}>
            <Route element={<AppShell />}>
              <Route path="/osc/inicio" element={gate(<OSCDashboard />)} />
              <Route path="/osc/documentos" element={gate(<OSCDocumentsPage />)} />
              <Route path="/osc/modelos" element={gate(<OSCTemplatesPage />)} />
              <Route path="/osc/biblioteca" element={gate(<OSCLibraryPage />)} />
              <Route path="/osc/projetos" element={<ProjectsPage />} />
              <Route path="/osc/governanca" element={<GovernancePage />} />
              <Route path="/osc/prestacao-contas" element={gate(<PrestacaoContasPage />)} />

              {/* Sempre abertas */}
              <Route path="/osc/mensagens" element={<OSCMessagesPage />} />
              <Route path="/osc/perfil" element={<OSCProfilePage />} />
              <Route path="/osc/financeiro" element={<OSCFinanceiro />} />
              <Route path="/osc/ajuda" element={<HelpPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
