// src/pages/Login.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { mockUsers } from '../utils/mockData.js';
import Button from '../components/common/Button.jsx'; // USA O NOVO BOTÃO
import styles from './Login.module.css';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();

  const handleMockLogin = (mockUser) => {
    login(mockUser);
  };

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className={styles.loginCard}>
      <h1 className={styles.title}>
        Portal Contábil OSCs
      </h1>
      <p className={styles.subtitle}>
        Selecione um perfil para simular o login.
      </p>

      <div className={styles.buttonContainer}>
        {/* Usamos a prop 'variant' e 'className="w-full"' */}
        <Button
          onClick={() => handleMockLogin(mockUsers.osc)}
          variant="success" // Usa a variante (azul por defeito)
          className="w-full bg-green-500 hover:bg-green-600 border-green-500 hover:border-green-600" // Ainda precisa do override para verde
          // TODO: Adicionar variante 'success' (verde) ao Button.module.css
        >
          Entrar como OSC
        </Button>
        <Button
          onClick={() => handleMockLogin(mockUsers.contador)}
          variant="primary" // Usa a variante azul
          className="w-full" // Garante largura total (pode mover para CSS Module)
        >
          Entrar como Contador
        </Button>
        <Button
          onClick={() => handleMockLogin(mockUsers.adm)}
          variant="dark" // Usa a variante cinza
          className="w-full bg-gray-700 hover:bg-gray-800 border-gray-700 hover:border-gray-800 text-white" // Ainda precisa do override para cinza escuro + texto branco
          // TODO: Adicionar variante 'dark' (cinza) ao Button.module.css
        >
          Entrar como Administrador
        </Button>
      </div>

      <p className={styles.disclaimer}>
        Este é um protótipo. A tela de login real terá campos de utilizador e
        senha.
      </p>
    </div>
  );
}