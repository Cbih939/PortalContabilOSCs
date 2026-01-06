import React from 'react';
import { useAuth } from '../../../hooks/useAuth.jsx';
import { useNotification } from '../../../contexts/NotificationContext.jsx';
import styles from './ContadorHeader.module.css';

// --- Ícones Embutidos (SVG) para evitar erros de importação ---
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

const UserCircleIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function ContadorHeader({ onToggleSidebar }) {
  const { user } = useAuth();
  const { unreadCount } = useNotification();

  return (
    <header className={styles.headerContainer}>
      
      {/* Botão Menu (Visível apenas no Mobile) */}
      <button 
        type="button" 
        className={styles.menuButton} 
        onClick={onToggleSidebar}
        aria-label="Abrir menu"
      >
        <MenuIcon className={styles.icon} />
      </button>

      {/* Espaçador para empurrar conteúdo para a direita */}
      <div style={{ flex: 1 }}></div>

      {/* Área de Ações do Usuário */}
      <div className={styles.actionsContainer}>
        
        {/* Botão de Notificação */}
        <button type="button" className={styles.iconButton} aria-label="Notificações">
          <BellIcon className={styles.icon} />
          {unreadCount > 0 && (
            <span className={styles.badge}>{unreadCount}</span>
          )}
        </button>

        {/* Perfil do Usuário */}
        <div className={styles.profileContainer}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.name || 'Contador'}</span>
            <span className={styles.userRole}>Painel Contábil</span>
          </div>
          <div className={styles.avatarCircle}>
             <span className={styles.avatarInitial}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
             </span>
          </div>
        </div>
      </div>
    </header>
  );
}