// src/components/layout/GuestLayout.js

import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * Layout para páginas "convidadas" (não autenticadas), como a tela de Login.
 *
 * Este componente simplesmente fornece um contêiner que centraliza
 * seu conteúdo vertical e horizontalmente em um fundo padrão.
 *
 * O React Router renderizará o componente da rota atual (ex: <LoginPage />)
 * onde o <Outlet /> está posicionado.
 */
export default function GuestLayout() {
  return (
    <div className="min-h-screen bg-gray-200 flex flex-col justify-center items-center p-4">
      {/* O <Outlet /> renderizará a página de Login (ou outra página guest) aqui */}
      <Outlet />
    </div>
  );
}

/**
 * --- Como Usar (Exemplo no futuro AppRoutes.js) ---
 *
 * import { Route } from 'react-router-dom';
 * import GuestLayout from './components/layout/GuestLayout';
 * import LoginPage from './pages/Login';
 *
 * // ...
 *
 * // Rota de Login (Pública)
 * <Route element={<GuestLayout />}>
 * <Route path="/login" element={<LoginPage />} />
 * {/* <Route path="/esqueceu-senha" element={<ForgotPasswordPage />} /> */}
 </Route>