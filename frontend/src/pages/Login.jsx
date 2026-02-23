import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Mudamos Navigate para useNavigate
import { useAuth } from '../../hooks/useAuth.jsx';
import useApi from '../../hooks/useApi.jsx';
import * as authService from '../../services/authService.js';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import styles from './Login.module.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formError, setFormError] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { request: performLogin, isLoading, error: apiError } = useApi(authService.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    const { email, password } = e.target.elements;

    try {
      const loginResponse = await performLogin(email.value, password.value);
      
      if (rememberMe) {
        localStorage.setItem('remembered_email', email.value);
      } else {
        localStorage.removeItem('remembered_email');
      }

      // 1. O login no contexto agora retorna para onde o user deve ir
      const destination = login(loginResponse);
      
      // 2. Navega para o destino correto (impede o loop no /)
      if (destination) {
        navigate(destination);
      }
    } catch (err) {
      setFormError("Email ou senha incorretos. Tente novamente.");
      console.error("Falha no login:", err);
    }
  };

  return (
    <div className={styles.loginCard}>
      <img src="/logo_portal.png" alt="Logo" className={styles.logo} />

      <h3 className={styles.title}>Entre na sua conta</h3>
      
      <form onSubmit={handleSubmit} className={styles.buttonContainer}>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Seu email"
          defaultValue={localStorage.getItem('remembered_email') || ''}
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

        <div className={styles.formOptions}>
          <label className={styles.rememberMe}>
            <input 
              type="checkbox" 
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span>Lembrar-me</span>
          </label>
          <Link to="/esqueceu-senha" className={styles.forgotPassword}>
            Esqueceu a senha?
          </Link>
        </div>

        {formError && <p className={styles.errorMessage}>{formError}</p>}

        <Button type="submit" className={styles.loginButton} disabled={isLoading} style={{ width: '100%' }}>
          {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
          {isLoading ? 'A entrar...' : 'Entrar'}
        </Button>

        <div className={styles.registerContainer}>
          <p className={styles.registerText}>É uma Organização e ainda não tem conta?</p>
          <Link to="/register-osc" className={styles.registerLinkHighlight}>
            Cadastre sua OSC e ative seu plano aqui
          </Link>
        </div>
      </form>
    </div>
  );
}