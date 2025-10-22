// src/pages/contador/components/ContadorHeader.jsx

import React from 'react';
// Importa o "molde" genérico de Header
import Header from '../../../components/layout/Header.jsx';
// Importa ícones
import { MenuIcon, BellIcon } from '../../../components/common/Icons.jsx';
// Importa o hook de autenticação para dados do utilizador
import { useAuth } from '../../../hooks/useAuth.jsx';

/**
 * Componente Header específico para o painel do Contador.
 * Inclui o botão de menu (toggle sidebar), notificações e nome do utilizador.
 *
 * Props:
 * - onToggleSidebar (function): Função para abrir/fechar a sidebar.
 */
export default function ContadorHeader({ onToggleSidebar }) {
  const { user } = useAuth(); // Pega dados do utilizador logado

  // (Lógica futura para buscar notificações e mostrar contagem)
  const notificationCount = 0; // Placeholder

  // Define o conteúdo da esquerda (Botão de Menu)
  const leftContent = (
    <button
      onClick={onToggleSidebar}
      className="text-gray-600 hover:text-gray-800 focus:outline-none p-2 rounded-md hover:bg-gray-100"
      aria-label="Abrir/Fechar menu lateral"
    >
      <MenuIcon className="h-6 w-6" />
    </button>
  );

  // Define o conteúdo da direita (Notificações, Utilizador)
  const rightContent = (
    <>
      {/* Botão de Notificações (funcionalidade futura) */}
      <button
        // onClick={() => setIsNotificationModalOpen(true)} // (Habilitar quando o modal existir)
        className="relative text-gray-600 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100"
        title="Ver Notificações"
      >
        <BellIcon className="h-6 w-6" />
        {/* Badge de Notificações */}
        {notificationCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {notificationCount}
          </span>
        )}
      </button>

      {/* Nome do Utilizador (escondido em telas pequenas) */}
      <span className="text-gray-600 hidden sm:block">
        Bem-vindo(a), {user?.name || 'Utilizador'}
      </span>
    </>
  );

  // Renderiza o "molde" Header
  return <Header leftContent={leftContent} rightContent={rightContent} />;
}