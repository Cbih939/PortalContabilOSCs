// src/pages/Login.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { mockUsers } from '../utils/mockData.js'; // Importa os utilizadores mock
import Button from '../components/common/Button.jsx'; // Importa o nosso componente Button

/**
 * Página de Login (versão atualizada com botões mock estilizados).
 */
export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();

  // Handler para o login simulado
  const handleMockLogin = (mockUser) => {
    login(mockUser);
    // O AppRoutes tratará do redirecionamento
  };

  // Redireciona se já estiver autenticado
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Renderiza a UI (similar ao protótipo)
  return (
    // Container do GuestLayout (centraliza)
    // Card branco (do protótipo)
    <div className="bg-white shadow-xl rounded-2xl p-10 max-w-md w-full text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Portal Contábil OSCs
      </h1>
      <p className="text-gray-500 mb-8">
        Selecione um perfil para simular o login.
      </p>

      {/* Botões de Login Simulado */}
      <div className="space-y-4">
        <Button
          onClick={() => handleMockLogin(mockUsers.osc)}
          className="w-full bg-green-500 hover:bg-green-600 border-green-500 hover:border-green-600" // Classes Tailwind para verde
          variant="primary" // Usa a base do primário, mas sobrepõe a cor
        >
          Entrar como OSC
        </Button>
        <Button
          onClick={() => handleMockLogin(mockUsers.contador)}
          className="w-full" // Azul padrão
          variant="primary"
        >
          Entrar como Contador
        </Button>
        <Button
          onClick={() => handleMockLogin(mockUsers.adm)}
          className="w-full bg-gray-700 hover:bg-gray-800 border-gray-700 hover:border-gray-800" // Classes Tailwind para cinza escuro
          variant="primary" // Usa a base do primário, mas sobrepõe a cor
        >
          Entrar como Administrador
        </Button>
      </div>

      <p className="text-xs text-gray-400 mt-10">
        Este é um protótipo. A tela de login real terá campos de utilizador e
        senha.
      </p>
    </div>
  );
}