// src/hooks/useApi.jsx

import { useState, useCallback } from 'react';
// Importa o hook de notificação
import { useNotification } from '../contexts/NotificationContext.jsx';

/**
 * Hook customizado para gerenciar chamadas de API (ações como POST, PUT, DELETE).
 */
export default function useApi(apiFunc) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const addNotification = useNotification(); // Pega a função do contexto

  const request = useCallback(
    async (...args) => {
      setIsLoading(true);
      setError(null);
      setData(null);

      try {
        const response = await apiFunc(...args);
        const responseData = response?.data || response;
        setData(responseData);
        setIsLoading(false);
        return responseData;
      } catch (err) {
        setIsLoading(false);
        setError(err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          'Ocorreu um erro desconhecido.';
        addNotification(errorMessage, 'error');
        throw err;
      }
    },
    [apiFunc, addNotification]
  );

  return {
    data,
    setData,
    error,
    isLoading,
    request,
  };
}