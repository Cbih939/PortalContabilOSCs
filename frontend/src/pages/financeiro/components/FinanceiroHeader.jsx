import React from 'react';
import { useAuth } from '../../../hooks/useAuth.jsx';
import styles from './FinanceiroHeader.module.css';

export default function FinanceiroHeader({ onToggleSidebar, rightContent }) {
  const { user } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <button onClick={onToggleSidebar} className={styles.menuButton}>
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h2 className={styles.pageTitle}>Controle Financeiro</h2>
      </div>

      <div className={styles.rightSection}>
        {rightContent}
        {!rightContent && (
          <div className={styles.userProfile}>
            <div className={styles.avatar}>
              {user?.name?.charAt(0).toUpperCase() || 'F'}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}