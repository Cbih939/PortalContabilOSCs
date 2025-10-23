// src/pages/contador/components/ContadorHeader.jsx
import React from 'react';
import Header from '../../../components/layout/Header.jsx';
import { MenuIcon, BellIcon } from '../../../components/common/Icons.jsx';
import { useAuth } from '../../../hooks/useAuth.jsx';
import styles from './ContadorHeader.module.css'; // Importa CSS Module

export default function ContadorHeader({ onToggleSidebar }) {
  const { user } = useAuth();
  const notificationCount = 3; // Placeholder para teste

  const leftContent = (
    <button
      onClick={onToggleSidebar}
      className={styles.menuButton}
      aria-label="Abrir/Fechar menu lateral"
    >
      <MenuIcon /> {/* CSS Module estiliza SVG */}
    </button>
  );

  const rightContent = (
    // Usa o container .rightContainer do Header.module.css para espaçamento
    <>
      <button
        className={styles.notificationButton}
        title="Ver Notificações"
      >
        <BellIcon /> {/* CSS Module estiliza SVG */}
        {notificationCount > 0 && (
          <span className={styles.notificationBadge}>
            {notificationCount}
          </span>
        )}
      </button>
      <span className={styles.welcomeText}>
        Bem-vindo(a), {user?.name || 'Utilizador'}
      </span>
    </>
  );

  return <Header leftContent={leftContent} rightContent={rightContent} />;
}