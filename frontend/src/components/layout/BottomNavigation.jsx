import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FiHome, FiFileText, FiDollarSign, FiUser, FiGrid } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth.jsx';
import styles from './BottomNavigation.module.css';

export default function BottomNavigation() {
  const { user } = useAuth();
  const location = useLocation();
  const role = user?.role?.toUpperCase().trim();

  // Se não estiver logado, não renderiza a Bottom Navigation
  if (!user) return null;

  // Definição dos itens de menu com base na role
  const getNavItems = () => {
    switch (role) {
      case 'ADMIN':
        return [
          { path: '/admin/dashboard', icon: <FiHome />, label: 'Início' },
          { path: '/admin/oscs', icon: <FiGrid />, label: 'OSCs' },
          { path: '/admin/financeiro', icon: <FiDollarSign />, label: 'Finanças' },
          { path: '/admin/profile', icon: <FiUser />, label: 'Perfil' },
        ];
      case 'CONTADOR':
        return [
          { path: '/contador/dashboard', icon: <FiHome />, label: 'Início' },
          { path: '/contador/oscs', icon: <FiGrid />, label: 'OSCs' },
          { path: '/contador/documentos', icon: <FiFileText />, label: 'Docs' },
          { path: '/contador/perfil', icon: <FiUser />, label: 'Perfil' },
        ];
      case 'FINANCEIRO':
        return [
          { path: '/financeiro/dashboard', icon: <FiHome />, label: 'Início' },
          { path: '/financeiro/gestao', icon: <FiDollarSign />, label: 'Gestão' },
          { path: '/financeiro/historico', icon: <FiFileText />, label: 'Histórico' },
        ];
      case 'OSC':
      default:
        return [
          { path: '/osc/inicio', icon: <FiHome />, label: 'Início' },
          { path: '/osc/documentos', icon: <FiFileText />, label: 'Docs' },
          { path: '/osc/financeiro', icon: <FiDollarSign />, label: 'Gestão' },
          { path: '/osc/perfil', icon: <FiUser />, label: 'Mais' },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className={`${styles.bottomNav} hide-on-desktop`}>
      <ul className={styles.navList}>
        {navItems.map((item, index) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <li key={index} className={styles.navItem}>
              <NavLink 
                to={item.path} 
                className={`${styles.navLink} ${isActive ? styles.active : ''}`}
              >
                <div className={styles.iconWrapper}>
                  {item.icon}
                </div>
                <span className={styles.navLabel}>{item.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
