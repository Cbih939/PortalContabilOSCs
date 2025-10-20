// src/components/layout/AppLayout.js

import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * O layout principal para seções autenticadas da aplicação.
 *
 * Este componente cria a estrutura de "Sidebar + Área de Conteúdo".
 * A "Área de Conteúdo" é dividida em "Header" e "Página Atual".
 *
 * É projetado para ser usado com o React Router (rotas aninhadas).
 * A página atual (ex: Dashboard, Lista de OSCs) será renderizada
 * onde o componente <Outlet /> está posicionado.
 *
 * Props:
 * - sidebarComponent (ReactNode): O componente Sidebar (JSX).
 * (É opcional, pois o painel da OSC não possui sidebar).
 *
 * - headerComponent (ReactNode): O componente Header (JSX).
 * (Obrigatório, pois todos os painéis possuem um cabeçalho).
 */
export default function AppLayout({ sidebarComponent, headerComponent }) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* --- Sidebar --- */}
      {/* Renderiza a Sidebar (ex: ContadorSidebar, AdminSidebar)
          somente se ela for passada via props. */}
      {sidebarComponent}

      {/* --- Área de Conteúdo Principal --- */}
      {/* Ocupa o espaço restante e permite scroll vertical */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* --- Header --- */}
        {/* O 'headerComponent' (ex: ContadorHeader, OSCHeader)
            é renderizado aqui. Ele já vem com seu próprio
            estilo (bg-white, shadow, p-4, etc.) */}
        {headerComponent}

        {/* --- Conteúdo da Página --- */}
        {/* 'flex-1' faz esta div crescer para preencher o espaço restante.
            O React Router renderizará o componente da rota atual (a "página")
            exatamente aqui, dentro do <Outlet />. */}
        <div className="flex-1">
          <Outlet />
        </div>

      </main>
    </div>
  );
}

/**
 * --- Como Usar (Exemplo no futuro AppRoutes.js) ---
 *
 * import { Route } from 'react-router-dom';
 * import AppLayout from './components/layout/AppLayout';
 * import ContadorSidebar from './pages/contador/components/ContadorSidebar';
 * import ContadorHeader from './pages/contador/components/ContadorHeader';
 * import OSCHeader from './pages/osc/components/OSCHeader';
 * import OSCsPage from './pages/contador/OSCs';
 * import OSCDashboard from './pages/osc/OSCDashboard';
 *
 * // ...
 *
 * // Rota do Contador (Com Sidebar)
 * <Route
 * element={
 * <AppLayout
 * sidebarComponent={<ContadorSidebar />}
 * headerComponent={<ContadorHeader />}
 * />
 * }
 * >
 * <Route path="/contador/oscs" element={<OSCsPage />} />
 * <Route path="/contador/documentos" element={<DocumentsPage />} />
 * </Route>
 *
 * // Rota da OSC (Sem Sidebar)
 * <Route
 * element={
 * <AppLayout
 * headerComponent={<OSCHeader />}
 * />
 * }
 * >
 * <Route path="/osc/inicio" element={<OSCDashboard />} />
 * <Route path="/osc/meus-documentos" element={<OSCDocumentsPage />} />
 * </Route>
 *
 */