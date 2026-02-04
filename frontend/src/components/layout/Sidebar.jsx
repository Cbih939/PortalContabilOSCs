import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth.jsx';
import styles from './Sidebar.module.css';

import { 
  DashboardIcon, 
  FolderIcon, 
  MessageIcon, 
  UserIcon, 
  LogoutIcon,
  BookIcon,
  FileTextIcon
} from '../../common/Icons.jsx'; 

export default function OSCSidebar({ onLogout, isOpen, onClose }) {
  const { user } = useAuth();
  const location = useLocation();

  // Regra de Bloqueio: OSC em débito só acessa Financeiro e Mensagens
  const isBlocked = user?.role === 'osc' && user?.is_in_debt;

  const menuItems = [
    { path: '/osc/inicio', label: 'Dashboard', icon: <DashboardIcon />, blockOnDebt: true },
    { path: '/osc/documentos', label: 'Documentos', icon: <FolderIcon />, blockOnDebt: true },
    { path: '/financeiro', label: 'Financeiro', icon: <span style={{fontSize: '1.2rem'}}>💰</span>, blockOnDebt: false },
    { path: '/osc/mensagens', label: 'Mensagens', icon: <MessageIcon />, blockOnDebt: false },
    { path: '/osc/modelos', label: 'Modelos', icon: <FileTextIcon />, blockOnDebt: true },
    { path: '/osc/biblioteca', label: 'Biblioteca', icon: <BookIcon />, blockOnDebt: true },
    { path: '/osc/perfil', label: 'Meu Perfil', icon: <UserIcon />, blockOnDebt: false },
  ];

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      <div className={styles.logoContainer}>
        <Link to="/">
          <img src="/logo_portal.png" alt="Logo" className={styles.logoImage} />
        </Link>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => {
          const shouldBlock = isBlocked && item.blockOnDebt;

          return shouldBlock ? (
            <div key={item.path} className={`${styles.navLink} ${styles.disabled}`} title="Bloqueado por pendência financeira">
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.label}>{item.label} 🔒</span>
            </div>
          ) : (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.navLink} ${location.pathname === item.path ? styles.active : ''}`}
              onClick={window.innerWidth < 768 ? onClose : undefined}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.label}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <button onClick={onLogout} className={styles.logoutButton}>
          <LogoutIcon className={styles.icon} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}