import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';

// Importe seus ícones conforme o seu projeto já utiliza
import { 
  DashboardIcon, 
  FolderIcon, 
  FileTextIcon, 
  BookIcon, 
  MessageIcon, 
  UserIcon, 
  LogoutIcon 
} from '../common/Icons.jsx'; 

export default function Sidebar({ menuItems, onLogout }) {
  const location = useLocation();

  return (
    <aside className={styles.sidebar}>
      {/* HEADER DA SIDEBAR: Agora com a LOGO em vez de texto */}
      <div className={styles.logoContainer}>
        <Link to="/">
          <img 
            src="/logo_portal.png" 
            alt="Logo Conta Comigo" 
            className={styles.logoImage} 
          />
        </Link>
      </div>

      <nav className={styles.nav}>
        {menuItems?.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`${styles.navLink} ${
              location.pathname === item.path ? styles.active : ''
            }`}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Botão Sair no rodapé da sidebar */}
      <div className={styles.footer}>
        <button onClick={onLogout} className={styles.logoutButton}>
          <LogoutIcon className={styles.icon} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}