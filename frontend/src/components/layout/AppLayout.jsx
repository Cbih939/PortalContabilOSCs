// src/components/layout/AppLayout.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * O layout principal para seções autenticadas da aplicação.
 * Cria a estrutura de "Sidebar + Área de Conteúdo (Header + Página)".
 */
export default function AppLayout({ sidebarComponent, headerComponent }) {
  return (
    // Container Flex principal que ocupa toda a altura da tela
    <div className="flex h-screen bg-gray-100">
      
      {/* Renderiza a Sidebar (se fornecida) */}
      {sidebarComponent}

      {/* Área de Conteúdo Principal */}
      {/* 'flex-1' faz ocupar o espaço restante */}
      {/* 'flex flex-col' para empilhar Header e Conteúdo */}
      {/* 'overflow-y-auto' permite scroll vertical apenas nesta área */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Renderiza o Header (obrigatório) */}
        {/* 'flex-shrink-0' impede que o Header encolha */}
        <div className="flex-shrink-0">{headerComponent}</div>

        {/* Conteúdo da Página Atual */}
        {/* 'flex-1' faz esta div crescer para preencher o espaço */}
        <div className="flex-1">
          {/* O React Router renderiza a página atual aqui */}
          <Outlet />
        </div>

      </main>
    </div>
  );
}