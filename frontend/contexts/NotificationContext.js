// src/contexts/NotificationContext.js

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from 'react';
import ReactDOM from 'react-dom';
import { clsx } from 'clsx';
import {
  CheckIcon,
  AlertTriangleIcon,
  XIcon,
} from '../common/Icons';

// Mapeamento de estilos e ícones por tipo de notificação
const notificationTypes = {
  success: {
    container: 'bg-green-100 border-green-500 text-green-700',
    icon: <CheckIcon className="w-5 h-5 text-green-500" />,
  },
  error: {
    container: 'bg-red-100 border-red-500 text-red-700',
    icon: <AlertTriangleIcon className="w-5 h-5 text-red-500" />,
  },
  info: {
    container: 'bg-blue-100 border-blue-500 text-blue-700',
    // Reutilizando o ícone de alerta para 'info'
    icon: <AlertTriangleIcon className="w-5 h-5 text-blue-500" />,
  },
};

// 1. Criar o Contexto
// Ele só precisa expor a função de 'adicionar'.
const NotificationContext = createContext(null);

/**
 * Provedor de Notificações
 *
 * Este componente envolve a aplicação e fornece uma função `addNotification`
 * para disparar toasts. Ele também renderiza o contêiner
 * onde os toasts aparecerão.
 */
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  // Função para remover uma notificação (usada internamente)
  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Função para adicionar uma nova notificação (exposta ao app)
  const addNotification = useCallback(
    (message, type = 'info', duration = 5000) => {
      const id = Date.now();
      
      // Adiciona a nova notificação à lista
      setNotifications((prev) => [...prev, { id, message, type }]);

      // Define um timer para remover a notificação automaticamente
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    },
    [removeNotification] // Depende do 'removeNotification'
  );

  return (
    <NotificationContext.Provider value={addNotification}>
      {children}

      {/* Renderiza o Contêiner de Notificações em um portal.
        Isso garante que ele apareça no topo de tudo (z-index),
        mesmo que esteja dentro de componentes com 'overflow: hidden'.
      */}
      <NotificationDisplay
        notifications={notifications}
        removeNotification={removeNotification}
      />
    </NotificationContext.Provider>
  );
}

/**
 * Componente (privado) que renderiza os toasts na tela.
 */
function NotificationDisplay({ notifications, removeNotification }) {
  return ReactDOM.createPortal(
    // Contêiner fixo no canto superior direito
    <div className="fixed top-4 right-4 z-[9999] w-full max-w-sm space-y-3">
      {notifications.map((n) => {
        const styles = notificationTypes[n.type] || notificationTypes.info;

        return (
          <div
            key={n.id}
            className={clsx(
              'flex items-start justify-between p-4 rounded-lg shadow-xl border animate-fade-in-right', // 'animate-fade-in-right' é uma animação que você pode adicionar no tailwind.config.js
              styles.container
            )}
            role="alert"
          >
            {/* --- Ícone e Mensagem --- */}
            <div className="flex items-center">
              <span className="flex-shrink-0">{styles.icon}</span>
              <p className="ml-3 font-medium">{n.message}</p>
            </div>

            {/* --- Botão de Fechar --- */}
            <button
              onClick={() => removeNotification(n.id)}
              className={clsx(
                'ml-4 -mr-1 -mt-1 p-1 rounded-md transition-colors',
                'hover:bg-black hover:bg-opacity-10'
              )}
              aria-label="Fechar"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        );
      })}
    </div>,
    document.body // Anexa o portal diretamente ao <body>
  );
}

/**
 * Hook customizado: useNotification
 *
 * Facilita o acesso à função `addNotification` em qualquer
 * componente.
 *
 * @returns {function(message, type, duration)} A função addNotification.
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotification deve ser usado dentro de um NotificationProvider'
    );
  }
  return context;
};

/**
 * --- Como Usar (em qualquer componente) ---
 *
 * import { useNotification } from '../../contexts/NotificationContext';
 * import Button from '../../components/common/Button';
 *
 * function MyComponent() {
 * const addNotification = useNotification();
 *
 * const handleSave = () => {
 * // ... (lógica para salvar na API)
 *
 * // Dispara a notificação de sucesso!
 * addNotification('Perfil salvo com sucesso!', 'success');
 * };
 *
 * const handleError = () => {
 * // ... (lógica de erro)
 *
 * // Dispara a notificação de erro!
 * addNotification('Falha ao salvar. Tente novamente.', 'error');
 * };
 *
 * return <Button onClick={handleSave}>Salvar</Button>
 * }
 */