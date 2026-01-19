import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../../components/layout/Header.jsx'; 
import { MenuIcon } from '../../../components/common/Icons.jsx';
import { useAuth } from '../../../hooks/useAuth.jsx';
import styles from './AdminHeader.module.css';

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
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <span className={styles.welcomeText}>
        Bem-vindo(a), {user?.name || 'Admin'}
      </span>
      {/* Link no Avatar do Admin */}
      <Link to="#" style={{ textDecoration: 'none' }}>
        <div className={styles.avatarCircle} style={{ 
          width: '35px', height: '35px', backgroundColor: '#EC6D12', 
          borderRadius: '50%', display: 'flex', alignItems: 'center', 
          justifyContent: 'center', color: 'white', fontWeight: 'bold' 
        }}>
          {user?.name?.charAt(0).toUpperCase() || 'A'}
        </div>
      </Link>
    </div>
  );

  return <Header leftContent={leftContent} rightContent={rightContent} />;
}