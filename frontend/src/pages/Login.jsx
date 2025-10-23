// src/pages/Login.jsx

import React, { useState } from 'react'; // Importa useState
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import useApi from '../hooks/useApi.jsx'; // Hook para API
import * as authService from '../services/authService.js'; // Serviço de API
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';   // Componente Input
import Spinner from '../components/common/Spinner.jsx'; // Para loading
import styles from './Login.module.css';

/**
 * Página de Login Real com formulário e chamada de API.
 */
export default function LoginPage() {
  const { login, isAuthenticated } = useAuth(); // Função login do Contexto
  const [formError, setFormError] = useState(null); // Estado para erros específicos do form

  // Conecta o hook useApi à função de login do serviço
  // Renomeia 'request' para 'performLogin' para clareza
  const { request: performLogin, isLoading, error: apiError } = useApi(authService.login);

  // Handler para submissão do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null); // Limpa erros anteriores
    const { email, password } = e.target.elements;

    try {
      // Chama a função 'request' do useApi (performLogin)
      const loginResponse = await performLogin(email.value, password.value);

      // Sucesso! A API retornou { user, token }
      // Chama a função 'login' do AuthContext com a resposta
      login(loginResponse);
      // O AppRoutes/RootRedirect tratará do redirecionamento

    } catch (err) {
      // O hook useApi já mostrou a notificação de erro genérica (ex: 401 Credenciais Inválidas)
      // Podemos adicionar uma mensagem específica no formulário se quisermos
      setFormError("Email ou senha incorretos. Tente novamente.");
      console.error("Falha no login (visto pela LoginPage):", err);
    }
  };

  // Redireciona se já estiver autenticado
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className={styles.loginCard}>
      <h1 className={styles.title}>
        Portal Contábil OSCs
      </h1>
      <p className={styles.subtitle}>
        Aceda à sua conta
      </p>

      {/* Formulário de Login Real */}
      <form onSubmit={handleSubmit} className={styles.buttonContainer}> {/* Reutiliza classe para espaçamento */}
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Seu email"
          required
          // Mostra erro da API se for relacionado a este campo
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

        {/* Mostra erro geral do formulário */}
        {formError && <p className={styles.errorMessage}>{formError}</p>}
        {/* Adicione a classe errorMessage ao Login.module.css se ainda não existir:
           .errorMessage { color: #dc2626; font-size: 0.875rem; margin-top: -0.5rem; margin-bottom: 0.5rem; } */}

        <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
          {isLoading ? <Spinner size="sm" className="mr-2" /> : null} {/* mr-2 pode precisar CSS */}
          {isLoading ? 'A entrar...' : 'Entrar'}
        </Button>
      </form>

      {/* Remover Botões Mock (Opcional: Mantenha para testes rápidos) */}
      {/* <div className="space-y-4 mt-8 border-t pt-4"> ... botões mock ... </div> */}

      {/* <p className={styles.disclaimer}> ... </p> */}
    </div>
  );
}