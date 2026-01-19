import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth.jsx'; 
import styles from './ContadorSidebar.module.css';

// Ícones (Mantidos conforme seu original)
// ...

export default function ContadorSidebar({ isOpen }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/contador/dashboard', label: 'Painel', icon: DashboardIcon },
    { path: '/contador/oscs', label: 'Minhas OSCs', icon: OSCIcon },
    { path: '/contador/documentos', label: 'Meus Documentos', icon: DocsIcon },
    { path: '/contador/modelos', label: 'Documentos e Modelos', icon: LibraryIcon },
    { path: '/contador/avisos', label: 'Avisos', icon: MegaphoneIcon },
    { path: '/contador/mensagens', label: 'Mensagens', icon: ChatIcon },
    { path: '/contador/perfil', label: 'Meu Perfil', icon: ProfileIcon },
  ];

  if (!isOpen) return null;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <img src="/logo_portal.png" alt="Portal Contábil" className={styles.sidebarLogo} />
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