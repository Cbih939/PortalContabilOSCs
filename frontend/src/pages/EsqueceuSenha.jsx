import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../hooks/useApi.jsx';
import * as authService from '../services/authService.js';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import Spinner from '../components/common/Spinner.jsx';
import styles from './Login.module.css';

export default function EsqueceuSenhaPage() {
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState(null);
  const { request: sendResetEmail, isLoading } = useApi(authService.requestPasswordReset);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const { email } = e.target.elements;

    try {
      await sendResetEmail(email.value);
      setEmailSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Ocorreu um erro. Verifique o e-mail digitado.");
    }
  };

  if (emailSent) {
    return (
      <div className={styles.loginCard}>
        <h3 className={styles.title}>Verifique seu E-mail</h3>
        <p style={{ textAlign: 'center', color: '#4b5563', marginBottom: '1.5rem' }}>
          Enviamos as instruções de recuperação para o seu endereço de e-mail cadastrado.
        </p>
        <Link to="/login" className={styles.forgotPassword} style={{ textAlign: 'center', display: 'block' }}>
          Voltar para o Login
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.loginCard}>
      <img src="/logo_portal.png" alt="Logo" className={styles.logo} />
      <h3 className={styles.title}>Recuperar Senha</h3>
      <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#6b7280', marginBottom: '1.5rem' }}>
        Insira seu e-mail e enviaremos um link para você criar uma nova senha.
      </p>

      <form onSubmit={handleSubmit} className={styles.buttonContainer}>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Seu e-mail cadastrado"
          required
        />
        
        {error && <p className={styles.errorMessage}>{error}</p>}

        <Button type="submit" className={styles.loginButton} disabled={isLoading} style={{ width: '100%' }}>
          {isLoading ? <Spinner size="sm" /> : 'Enviar Link de Recuperação'}
        </Button>

        <Link to="/login" className={styles.forgotPassword} style={{ textAlign: 'center', display: 'block', marginTop: '1rem' }}>
          Voltar para o Login
        </Link>
      </form>
    </div>
  );
}