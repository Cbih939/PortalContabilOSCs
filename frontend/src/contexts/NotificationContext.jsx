// src/contexts/NotificationContext.jsx

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from 'react';
import ReactDOM from 'react-dom';
import { clsx } from 'clsx';
// Assumindo que Icons.jsx e Button.jsx existirão em ../components/common/
import {
  CheckIcon,
  AlertTriangleIcon,
  XIcon,
} from '../components/common/Icons';
import Button from '../components/common/Button'; // Importado apenas para o exemplo de uso

// Mapeamento de estilos
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
    icon: <AlertTriangleIcon className="w-5 h-5 text-blue-500" />,
  },
};

// 1. Criar o Contexto
const NotificationContext = createContext(null);

/**
 * Provedor de Notificações
 */
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback(
    (message, type = 'info', duration = 5000) => {
      const id = Date.now();
      setNotifications((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    },
    [removeNotification]
  );

  return (
    <NotificationContext.Provider value={addNotification}>
      {children}
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
  // Adiciona animação Tailwind (requer configuração no tailwind.config.js se quiser)
  const animationClass = 'animate-fade-in-right'; // Exemplo

  return ReactDOM.createPortal(
    <div className="fixed top-4 right-4 z-[9999] w-full max-w-sm space-y-3">
      {notifications.map((n) => {
        const styles = notificationTypes[n.type] || notificationTypes.info;
        return (
          <div
            key={n.id}
            className={clsx(
              'flex items-start justify-between p-4 rounded-lg shadow-xl border',
              animationClass, // Adiciona animação
              styles.container
            )}
            role="alert"
          >
            <div className="flex items-center">
              <span className="flex-shrink-0">{styles.icon}</span>
              <p className="ml-3 font-medium">{n.message}</p>
            </div>
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
    document.body
  );
}

/**
 * Hook customizado: useNotification
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