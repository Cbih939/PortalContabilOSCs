// src/hooks/useApi.js

import { useState, useCallback } from 'react';
import { useNotification } from '../contexts/NotificationContext';

/**
 * Hook customizado para gerenciar chamadas de API (ações como POST, PUT, DELETE).
 *
 * Ele gerencia o estado de 'loading', 'error' e 'data',
 * e exibe notificações de erro automaticamente.
 *
 * @param {function} apiFunc A função do serviço de API a ser executada (ex: authService.login).
 * @returns {object} { data, setData, error, isLoading, request }
 * - data: Os dados retornados pela API após o sucesso.
 * - setData: Permite setar os dados manualmente (ex: limpar ou atualização otimista).
 * - error: O objeto de erro, se a chamada falhar.
 * - isLoading: Booleano indicando se a chamada está em progresso.
 * - request: A função para disparar a chamada à API.
 */
export default function useApi(apiFunc) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Pega a função de adicionar notificação do nosso contexto
  const addNotification = useNotification();

  /**
   * Função 'request' para executar a chamada à API.
   *
   * Ela é "memoizada" com 'useCallback' para performance.
   * Aceita qualquer número de argumentos (ex: email, senha)
   * e os repassa para a 'apiFunc' original.
   */
  const request = useCallback(
    async (...args) => {
      // 1. Inicia o processo de carregamento
      setIsLoading(true);
      setError(null);
      setData(null);

      try {
        // 2. Executa a função da API (ex: authService.login(email, pass))
        const response = await apiFunc(...args);

        // A maioria das APIs (como as com Axios) retorna os dados em 'response.data'
        const responseData = response?.data || response;

        // 3. Sucesso!
        setData(responseData);
        setIsLoading(false);
        return responseData; // Retorna os dados para quem chamou (ex: o componente)
      } catch (err) {
        // 4. Falha
        setIsLoading(false);
        setError(err);

        // --- Notificação Automática de Erro ---
        // Tenta encontrar uma mensagem de erro vinda do backend (comum com Axios)
        const errorMessage =
          err.response?.data?.message || // Erro padrão de API (ex: "Email já existe")
          err.message || // Erro de rede ou JavaScript
          'Ocorreu um erro desconhecido.'; // Fallback

        // Dispara a notificação de erro global!
        addNotification(errorMessage, 'error');

        // Re-lança o erro para que o componente que chamou
        // possa fazer um .catch() se precisar de lógica adicional
        throw err;
      }
    },
    [apiFunc, addNotification] // Dependências do useCallback
  );

  return {
    data,
    setData,
    error,
    isLoading,
    request,
  };
}

/**
 * --- Como Usar (em um componente de Login) ---
 *
 * import { useApi } from '../../hooks/useApi';
 * import { useAuth } from '../../contexts/AuthContext';
 * import * as authService from '../../services/authService'; // Importa o serviço
 * import Button from '../../components/common/Button';
 * import Spinner from '../../components/common/Spinner';
 * import Input from '../../components/common/Input';
 *
 * function LoginForm() {
 * const { login } = useAuth(); // Função do AuthContext
 *
 * // 1. Conecta o hook 'useApi' com a função 'authService.login'
 * //    Renomeamos 'request' para 'performLogin' para clareza
 * const { request: performLogin, isLoading } = useApi(authService.login);
 *
 * const handleSubmit = async (e) => {
 * e.preventDefault();
 * const { email, password } = e.target.elements;
 *
 * try {
 * // 2. Chama a função 'request' (agora 'performLogin')
 * //    Passa os argumentos que o 'authService.login' espera
 * const loginResponse = await performLogin(email.value, password.value);
 *
 * // 3. Se a API teve sucesso, chama o 'login' do AuthContext
 * //    (o loginResponse contém { user, token })
 * login(loginResponse);
 *
 * } catch (err) {
 * // O hook 'useApi' já exibiu a notificação de erro.
 * // Não precisamos fazer mais nada aqui.
 * console.error("Login falhou (visto pelo componente):", err);
 * }
 * };
 *
 * return (
 * <form onSubmit={handleSubmit} className="space-y-4">
 * <Input id="email" name="email" type="email" placeholder="Email" required />
 * <Input id="password" name="password" type="password" placeholder="Senha" required />
 *
 * <Button type="submit" className="w-full" disabled={isLoading}>
 * {isLoading ? <Spinner size="sm" /> : 'Entrar'}
 * </Button>
 * </form>
 * );
 * }
 */