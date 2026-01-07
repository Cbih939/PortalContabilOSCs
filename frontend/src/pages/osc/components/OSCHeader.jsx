import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth.jsx';
import { useNotification } from '../../../contexts/NotificationContext.jsx';
import * as alertService from '../../../services/alertService.js';
import styles from './OSCHeader.module.css';

// Ícones SVG embutidos para garantir consistência
const MenuIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const BellIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

export default function OSCHeader({ onToggleSidebar }) {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const unreadCount = alerts.filter(a => !a.read).length;

  // Busca alertas (Simples)
  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const res = await alertService.getAlerts();
        setAlerts(res.data || []);
      } catch (e) {
        console.error("Erro ao carregar alertas", e);
      }
    };
    if (user) loadAlerts();
  }, [user]);

  return (
    <header className={styles.headerContainer}>
      
      {/* Botão Menu (Mobile) */}
      <button 
        type="button" 
        className={styles.menuButton} 
        onClick={onToggleSidebar}
        aria-label="Abrir menu"
      >
        <MenuIcon className={styles.icon} />
      </button>

      {/* Espaço flexível */}
      <div style={{ flex: 1 }}></div>

      {/* Área Direita */}
      <div className={styles.actionsContainer}>
        
        {/* Notificações */}
        <button className={styles.iconButton} aria-label="Notificações">
          <BellIcon className={styles.icon} />
          {unreadCount > 0 && (
            <span className={styles.badge}>{unreadCount}</span>
          )}
        </button>

        {/* Perfil Simplificado */}
        <div className={styles.profileContainer}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.name || 'Minha OSC'}</span>
            <span className={styles.userRole}>Cliente</span>
          </div>
          <div className={styles.avatarCircle}>
             {user?.name ? user.name.charAt(0).toUpperCase() : 'O'}
          </div>
        </div>

      </div>
    </header>
  );
}