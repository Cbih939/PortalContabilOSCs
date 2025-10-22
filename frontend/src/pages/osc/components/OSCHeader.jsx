// src/pages/osc/components/OSCHeader.jsx

import React from 'react';
// Importa o "molde" genérico de Header
import Header from '../../../components/layout/Header.jsx';
// Importa ícones e botão
import { AlertTriangleIcon } from '../../../components/common/Icons.jsx';
import Button from '../../../components/common/Button.jsx';
// Importa o hook de autenticação para logout e dados do utilizador
import { useAuth } from '../../../hooks/useAuth.jsx';
// (No futuro, pode precisar do useNotification aqui também)

/**
 * Componente Header específico para o painel da OSC.
 * Inclui o título, botão de alertas e botão de logout.
 */
export default function OSCHeader() {
  // Pega o utilizador logado e a função de logout do contexto
  const { user, logout } = useAuth();

  // (Lógica futura para buscar alertas e mostrar contagem)
  const unreadAlertsCount = 0; // Placeholder

  // Handler para o clique no botão de logout
  const handleLogout = () => {
    logout(); // Chama a função do AuthContext
    // O ProtectedRoute/RootRedirect tratará de redirecionar para /login
  };

  // Define o conteúdo da esquerda do Header (Título)
  const leftContent = (
    <h1 className="text-2xl font-bold text-gray-800">Portal da OSC</h1>
  );

  // Define o conteúdo da direita do Header (Alertas, Utilizador, Logout)
  const rightContent = (
    <>
      {/* Botão de Alertas (funcionalidade futura) */}
      <button
        // onClick={() => setIsAlertModalOpen(true)} // (Habilitar quando o modal existir)
        className="relative text-gray-600 hover:text-yellow-600"
        title="Ver Avisos"
      >
        <AlertTriangleIcon className="h-6 w-6" />
        {/* Badge de Alertas Não Lidos */}
        {unreadAlertsCount > 0 && (
          <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadAlertsCount}
          </span>
        )}
      </button>

      {/* Nome do Utilizador (escondido em telas pequenas) */}
      <span className="text-gray-600 hidden sm:block">
        Bem-vindo(a), {user?.name || 'Utilizador'}
      </span>

      {/* Botão de Logout */}
      <Button variant="danger" size="sm" onClick={handleLogout}>
        Sair
      </Button>
    </>
  );

  // Renderiza o "molde" Header com o conteúdo definido
  return <Header leftContent={leftContent} rightContent={rightContent} />;
}