import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import useApi from '../hooks/useApi.jsx';
import * as authService from '../services/authService.js';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import Spinner from '../components/common/Spinner.jsx';
import styles from './Login.module.css';

/**
 * Página de Login Real (COM LOGO).
 */
export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const [formError, setFormError] = useState(null);
  const { request: performLogin, isLoading, error: apiError } = useApi(authService.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    const { email, password } = e.target.elements;

    try {
      const loginResponse = await performLogin(email.value, password.value);
      login(loginResponse);
    } catch (err) {
      setFormError("Email ou senha incorretos. Tente novamente.");
      console.error("Falha no login (visto pela LoginPage):", err);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className={styles.loginCard}>
      
      <img
        src="/logo_portal.png" 
        alt="Logo Conta Comigo App"
        className={styles.logo}
      />

      <h3 className={styles.title}>
        Entre na sua conta
      </h3>
      
      <form onSubmit={handleSubmit} className={styles.buttonContainer}>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Seu email"
          required
          error={apiError?.data?.field === 'email' ? apiError.data.message : null}
        />
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Sua senha"
          required
          error={apiError?.data?.field === 'password' ? apiError.data.message : null}
        />

        {formError && <p className={styles.errorMessage}>{formError}</p>}

        {/* Correção aplicada aqui: styles.loginButton */}
        <Button type="submit" className={styles.loginButton} disabled={isLoading} style={{ width: '100%' }}>
          {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
          {isLoading ? 'A entrar...' : 'Entrar'}
        </Button>
      </form>
    </div>
  );
}