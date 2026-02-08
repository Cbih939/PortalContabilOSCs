import React from 'react';
import { useAuth } from '../../../hooks/useAuth.jsx'; // ADICIONE ESTE IMPORT
import styles from './AdminHeader.module.css';

export default function AdminHeader({ onToggleSidebar, rightContent }) {
  const { user } = useAuth(); // EXTRAIA O USER AQUI

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button onClick={onToggleSidebar} className={styles.hamburger}>
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className={styles.title}>Painel Administrativo</h1>
      </div>

      <div className={styles.right}>
        {/* Se houver conteúdo injetado (Sino/Avatar), ele entra aqui */}
        {rightContent}
        
        {/* Caso não use o rightContent do AppLayout, exibe direto aqui: */}
        {!rightContent && (
          <div className={styles.adminProfile}>
            <span>{user?.name || 'Administrador'}</span>
          </div>
        )}
      </div>
    </header>
  );
}