// src/routes/AppRoutes.js

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Hooks e Constantes
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/constants';

// Layouts
import GuestLayout from '../components/layout/GuestLayout';
import AppLayout from '../components/layout/AppLayout';

// Componente "Guarda"
import ProtectedRoute from './ProtectedRoute';

// Páginas Públicas (Guest)
import LoginPage from '../pages/Login';
import NotFoundPage from '../pages/NotFound';

// Páginas do Admin
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageUsers from '../pages/admin/ManageUsers';
import ManageOSCs from '../pages/admin/ManageOSCs';
// (Importe aqui os Headers/Sidebars do Admin quando os criar)
// import AdminSidebar from '../pages/admin/components/AdminSidebar';
// import AdminHeader from '../pages/admin/components/AdminHeader';

// Páginas do Contador
import ContadorDashboard from '../pages/contador/ContadorDashboard';
import OSCsPage from '../pages/contador/OSCs';
import DocumentsPage from '../pages/contador/Documents';
import NoticesPage from '../pages/contador/Notices';
import ContadorMessagesPage from '../pages/contador/Messages';
import ContadorProfilePage from '../pages/contador/Profile';
// (Importe aqui os Headers/Sidebars do Contador quando os criar)
// import ContadorSidebar from '../pages/contador/components/ContadorSidebar';
// import ContadorHeader from '../pages/contador/components/ContadorHeader';

// Páginas da OSC
import OSCDashboard from '../pages/osc/OSCDashboard';
import OSCDocumentsPage from '../pages/osc/Documents';
import OSCMessagesPage from '../pages/osc/Messages';
import OSCProfilePage from '../pages/osc/Profile';
// (Importe aqui o Header da OSC quando o criar)
// import OSCHeader from '../pages/osc/components/OSCHeader';

// --- PLACEHOLDERS (Provisório) ---
// (Substitua estes pelos imports reais acima quando criar os ficheiros)
const AdminSidebar = () => <div className="w-64 bg-gray-900 text-white p-5">Admin Sidebar</div>;
const AdminHeader = () => <div className="bg-white p-4 shadow">Admin Header</div>;
const ContadorSidebar = () => <div className="w-64 bg-gray-800 text-white p-5">Contador Sidebar</div>;
const ContadorHeader = () => <div className="bg-white p-4 shadow">Contador Header</div>;
const OSCHeader = () => <div className="bg-white p-4 shadow">OSC Header</div>;
// --- FIM DOS PLACEHOLDERS ---


/**
 * Componente "Redirecionador"
 * Trata o acesso à rota raiz "/".
 */
function RootRedirect() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redireciona o utilizador logado para o seu dashboard correto
  switch (user.role) {
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
        {/* Utilizam o GuestLayout */}
        <Route element={<GuestLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* --- Rotas Protegidas --- */}
        
        {/* 1. Rotas do ADMIN */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
          <Route
            element={
              <AppLayout
                sidebarComponent={<AdminSidebar />}
                headerComponent={<AdminHeader />}
              />
            }
          >
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/usuarios" element={<ManageUsers />} />
            <Route path="/admin/oscs" element={<ManageOSCs />} />
          </Route>
        </Route>

        {/* 2. Rotas do CONTADOR */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.CONTADOR]} />}>
          <Route
            element={
              <AppLayout
                sidebarComponent={<ContadorSidebar />}
                headerComponent={<ContadorHeader />}
              />
            }
          >
            {/* Redireciona a rota "base" do contador para o dashboard */}
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
                // A OSC não tem sidebar, passamos 'null' ou 'undefined'
                headerComponent={<OSCHeader />}
              />
            }
          >
            {/* Redireciona a rota "base" da OSC para o início */}
            <Route path="/osc" element={<Navigate to="/osc/inicio" replace />} />
            <Route path="/osc/inicio" element={<OSCDashboard />} />
            <Route path="/osc/documentos" element={<OSCDocumentsPage />} />
            <Route path="/osc/mensagens" element={<OSCMessagesPage />} />
            <Route path="/osc/perfil" element={<OSCProfilePage />} />
          </Route>
        </Route>

        {/* --- Página 404 (Not Found) --- */}
        {/* Esta rota captura qualquer URL que não
            correspondeu a nenhuma das rotas acima. */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}