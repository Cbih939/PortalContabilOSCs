// src/pages/Login.js

import React from 'react';
import { Navigate } from 'react-router-dom';
// Importa o hook de autenticação
import { useAuth } from '../hooks/useAuth';
// Importa os dados mockados para o login simulado
import { mockUsers } from '../utils/mockData';
// Importa o nosso componente de Botão
import Button from '../components/common/Button';

// (Imports para um formulário real no futuro)
// import { useApi } from '../hooks/useApi';
// import * as authService from '../services/authService';
// import Input from '../components/common/Input';
// import Spinner from '../components/common/Spinner';

/**
 * Página de Login.
 *
 * Utiliza o AuthContext para realizar o login e
 * redireciona o utilizador se ele já estiver autenticado.
 */
export default function LoginPage() {
  // 1. Obtém o estado de autenticação e a função de login
  const { login, isAuthenticated } = useAuth();

  // (Hooks para um formulário de login real)
  // const { request: performLogin, isLoading } = useApi(authService.login);

  // 2. Handler para o login simulado (do protótipo)
  const handleMockLogin = (mockUser) => {
    // Chama a função 'login' do AuthContext
    login(mockUser);
    // O AuthContext tratará de salvar no localStorage
    // e o AppRoutes tratará do redirecionamento.
  };

  /**
   * (Handler para um formulário de login real)
   * const handleSubmit = async (e) => {
   * e.preventDefault();
   * const { email, password } = e.target.elements;
   *
   * try {
   * // 1. Chama a API
   * const { user, token } = await performLogin(email.value, password.value);
   * // 2. Chama o 'login' do AuthContext com os dados da API
   * login({ ...user, token });
   * } catch (err) {
   * // O hook 'useApi' já mostrou a notificação de erro.
   * console.error('Falha no login:', err);
   * }
   * };
   */

  // 3. Redirecionamento
  // Se o utilizador já estiver autenticado, não mostre a página de login.
  // Envie-o para a "home" (que o AppRoutes definirá).
  if (isAuthenticated) {
    // 'replace' impede que o utilizador volte para o login
    // ao clicar no botão "Voltar" do navegador.
    return <Navigate to="/" replace />;
  }

  // 4. Renderização (baseada no 'GuestLayout')
  return (
    <div className="bg-white shadow-xl rounded-2xl p-10 max-w-md w-full text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Portal Contábil OSCs
      </h1>
      <p className="text-gray-500 mb-8">
        Selecione um perfil para simular o login.
      </p>

      {/* --- Login Simulado (do protótipo) --- */}
      <div className="space-y-4">
        {/* Substituímos <button> pelo nosso componente <Button> */}
        <Button
          onClick={() => handleMockLogin(mockUsers.osc)}
          className="w-full"
          variant="primary" // (Você pode customizar as cores no Button.js ou tailwind.config)
          style={{ backgroundColor: '#22c55e', borderColor: '#22c55e' }} // Override para o verde
        >
          Entrar como OSC
        </Button>
        <Button
          onClick={() => handleMockLogin(mockUsers.contador)}
          className="w-full"
          variant="primary" // Azul (padrão)
        >
          Entrar como Contador
        </Button>
        <Button
          onClick={() => handleMockLogin(mockUsers.adm)}
          className="w-full"
          variant="secondary" // Cinza
          style={{
            backgroundColor: '#374151',
            borderColor: '#374151',
            color: 'white',
          }} // Override para o cinza escuro
        >
          Entrar como Administrador
        </Button>
      </div>

      {/* --- Formulário de Login Real (Exemplo futuro) --- */}
      {/*
      <form onSubmit={handleSubmit} className="space-y-4 mt-8">
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Email"
          required
        />
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Senha"
          required
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Spinner size="sm" /> : 'Entrar'}
        </Button>
      </form>
      */}

      <p className="text-xs text-gray-400 mt-10">
        Este é um protótipo. A tela de login real terá campos de utilizador e
        senha.
      </p>
    </div>
  );
}