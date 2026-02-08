import React from 'react';
import { useAuth } from '../../../hooks/useAuth.jsx';
import styles from './AdminHeader.module.css';

export default function AdminHeader({ onToggleSidebar, rightContent }) {
  const { user } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <button onClick={onToggleSidebar} className={styles.menuButton}>
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h2 className={styles.pageTitle}>Painel Administrativo</h2>
      </div>

      <div className={styles.rightSection}>
        {/* Renderiza o Sino e Avatar passados pelo AppLayout */}
        {rightContent}
        
        {/* Fallback caso o rightContent não venha (segurança) */}
        {!rightContent && (
          <div className={styles.userProfile}>
            <div className={styles.notificationIcon}>
               <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div className={styles.avatar}>
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}