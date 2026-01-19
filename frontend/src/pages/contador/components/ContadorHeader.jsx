import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth.jsx';
import { useNotification } from '../../../contexts/NotificationContext.jsx';
import styles from './ContadorHeader.module.css';

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

export default function ContadorHeader({ onToggleSidebar }) {
  const { user } = useAuth();
  const { unreadCount } = useNotification();

  return (
    <header className={styles.headerContainer}>
      <button type="button" className={styles.menuButton} onClick={onToggleSidebar} aria-label="Abrir menu">
        <MenuIcon className={styles.icon} />
      </button>

      <div style={{ flex: 1 }}></div>

      <div className={styles.actionsContainer}>
        <button type="button" className={styles.iconButton} aria-label="Notificações">
          <BellIcon className={styles.icon} />
          {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
        </button>

        <div className={styles.profileContainer}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.name || 'Contador'}</span>
            <span className={styles.userRole}>Painel</span>
          </div>
          
          {/* ATUALIZAÇÃO: Link adicionado ao avatar */}
          <Link to="/contador/mensagens" className={styles.avatarLink}>
            <div className={styles.avatarCircle}>
               <span className={styles.avatarInitial}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
               </span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}