import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useApi from '../hooks/useApi.jsx';
import * as authService from '../services/authService.js';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import styles from './Login.module.css';

export default function RedefinirSenhaPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  const { request: resetPassword, isLoading } = useApi(authService.resetPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { password, confirmPassword } = e.target.elements;

    if (password.value !== confirmPassword.value) {
      return setError("As senhas não coincidem.");
    }

    try {
      await resetPassword(token, password.value);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError("Token expirado ou inválido. Solicite uma nova recuperação.");
    }
  };

  return (
    <div className={styles.loginCard}>
      <h3 className={styles.title}>Nova Senha</h3>
      {success ? (
        <p style={{ color: 'green', textAlign: 'center' }}>Senha alterada com sucesso! Redirecionando...</p>
      ) : (
        <form onSubmit={handleSubmit} className={styles.buttonContainer}>
          <Input id="password" name="password" type="password" placeholder="Nova Senha" required />
          <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Confirme a Nova Senha" required />
          
          {error && <p className={styles.errorMessage}>{error}</p>}

          <Button type="submit" disabled={isLoading} style={{ width: '100%' }}>
            {isLoading ? 'A processar...' : 'Redefinir Senha'}
          </Button>
        </form>
      )}
    </div>
  );
}