// src/pages/admin/components/AdminHeader.jsx
import React from 'react';
import Header from '../../../components/layout/Header.jsx'; // Molde
import { MenuIcon } from '../../../components/common/Icons.jsx';
import { useAuth } from '../../../hooks/useAuth.jsx';
import styles from './AdminHeader.module.css'; // CSS Específico

export default function AdminHeader({ onToggleSidebar }) {
  const { user } = useAuth();

  const leftContent = (
    <button
      onClick={onToggleSidebar}
      className={styles.menuButton}
      aria-label="Abrir/Fechar menu lateral"
    >
      <MenuIcon />
    </button>
  );

  const rightContent = (
    // O container .rightContainer do Header.jsx cuida do gap
    <>
      {/* Admin não tem sino de notificação neste exemplo */}
      <span className={styles.welcomeText}>
        Bem-vindo(a), {user?.name || 'Admin'}
      </span>
      {/* Botão Sair fica na Sidebar */}
    </>
  );

  return <Header leftContent={leftContent} rightContent={rightContent} />;
}