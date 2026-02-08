import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth.jsx'; // ADICIONE ESTE IMPORT
import styles from './AdminSidebar.module.css';

export default function AdminSidebar({ isOpen, onClose }) {
  const { logout, user } = useAuth(); // EXTRAIA O USER AQUI
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/usuarios', label: 'Usuários', icon: '👥' },
    { path: '/admin/oscs', label: 'OSCs', icon: '🏢' },
    { path: '/admin/financeiro', label: 'Financeiro', icon: '💰' },
  ];

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      <div className={styles.logoContainer}>
        <img src="/logo_portal.png" alt="Portal Admin" className={styles.sidebarLogo} />
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        {/* Exibe o nome do admin se necessário para garantir que a variável existe */}
        <div className={styles.adminInfo}>{user?.name}</div> 
        <button onClick={handleLogout} className={styles.logoutBtn}>Sair</button>
      </div>
    </aside>
  );
}