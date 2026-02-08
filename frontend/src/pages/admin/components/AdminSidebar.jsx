import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth.jsx';
import styles from './AdminSidebar.module.css';

// RESTAURANDO SUA BIBLIOTECA ORIGINAL DE ÍCONES
import { 
  DashboardIcon, 
  UserIcon, 
  FolderIcon, 
  LogoutIcon 
} from '../../common/Icons.jsx'; 

export default function AdminSidebar({ isOpen, onClose }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { path: '/admin/usuarios', label: 'Usuários', icon: UserIcon },
    { path: '/admin/oscs', label: 'OSCs', icon: FolderIcon },
    { path: '/admin/financeiro', label: 'Financeiro', icon: () => <span className={styles.icon}>💰</span> },
  ];

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      <div className={styles.logoContainer}>
        <img src="/logo_portal.png" alt="Portal Contábil" className={styles.sidebarLogo} />
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <item.icon className={styles.icon} />
            <span className={styles.label}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        <div className={styles.userInfo}>
           <span className={styles.userName}>{user?.name}</span>
        </div>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          <LogoutIcon className={styles.icon} />
          <span className={styles.label}>Sair</span>
        </button>
      </div>
    </aside>
  );
}