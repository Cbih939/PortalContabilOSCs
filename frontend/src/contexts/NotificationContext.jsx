// src/contexts/NotificationContext.jsx

import React, { createContext, useContext, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { CheckIcon, AlertTriangleIcon, XIcon } from '../components/common/Icons';
import styles from './NotificationContext.module.css';

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
  // Se não houver notificações, não renderiza o portal
  if (notifications.length === 0) return null;

  return ReactDOM.createPortal(
    <div className={styles.portalContainer}>
      {notifications.map((n) => {
        // Define as classes corretas baseado no tipo
        const cardClass = styles[n.type] || styles.info;
        
        return (
          <div key={n.id} className={`${styles.notificationCard} ${cardClass}`} role="alert">
            <div className={styles.content}>
              {/* Renderiza o ícone correto baseado no tipo */}
              {n.type === 'success' && <CheckIcon className={`${styles.icon} ${styles.iconSuccess}`} />}
              {n.type === 'error' && <AlertTriangleIcon className={`${styles.icon} ${styles.iconError}`} />}
              {n.type === 'info' && <AlertTriangleIcon className={`${styles.icon} ${styles.iconInfo}`} />}
              
              <p className={styles.message}>{n.message}</p>
            </div>
            <button
              onClick={() => removeNotification(n.id)}
              className={styles.closeButton}
              aria-label="Fechar"
            >
              <XIcon className={styles.icon} />
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
    throw new Error('useNotification deve ser usado dentro de um NotificationProvider');
  }
  return context;
};