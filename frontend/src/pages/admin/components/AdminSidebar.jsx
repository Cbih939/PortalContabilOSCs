import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../hooks/useAuth.jsx'; // Ajuste o caminho conforme sua estrutura
import styles from './AdminSidebar.module.css';

// --- Ícones SVG ---
const DashboardIcon = () => (
  <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
);
const UsersIcon = () => (
  <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
);
const BuildingIcon = () => (
  <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
);
const MegaphoneIcon = () => (
  <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
);
// Novo Ícone de Biblioteca/Arquivos
const LibraryIcon = () => (
  <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
);
const LogoutIcon = () => (
  <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
);

export default function AdminSidebar({ isOpen }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { path: '/admin/usuarios', label: 'Gerenciar Usuários', icon: UsersIcon },
    { path: '/admin/oscs', label: 'Gerenciar OSCs', icon: BuildingIcon },
    { path: '/admin/biblioteca', label: 'Biblioteca e Modelos', icon: LibraryIcon }, // NOVO
    { path: '/admin/avisos', label: 'Canal de Avisos', icon: MegaphoneIcon },
  ];

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      <div className={styles.logoContainer}>
        <h2 className={styles.logoText}>Painel Admin</h2>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <item.icon />
            <span className={styles.label}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        <button onClick={handleLogout} className={styles.logoutButton}>
          <LogoutIcon />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}