// src/components/layout/GuestLayout.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * Layout para páginas "convidadas" (não autenticadas), como a tela de Login.
 * Centraliza o conteúdo vertical e horizontalmente num fundo cinza.
 */
export default function GuestLayout() {
  return (
    // Usa 'min-h-screen' para garantir altura total,
    // 'flex' e 'items/justify-center' para centralizar,
    // 'bg-gray-100' (ou 200) para o fundo.
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      {/* O <Outlet /> renderizará a página de Login (ou outra) aqui */}
      <Outlet />
    </div>
  );
}