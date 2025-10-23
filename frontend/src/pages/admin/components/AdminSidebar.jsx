// src/pages/admin/components/AdminSidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import Sidebar from '../../../components/layout/Sidebar.jsx'; // Molde
import { UsersIcon, BuildingIcon, LogoutIcon } from '../../../components/common/Icons.jsx';
import { useAuth } from '../../../hooks/useAuth.jsx';
import styles from './AdminSidebar.module.css'; // CSS Específico

// Link Helper (igual ao do Contador)
const SidebarLink = ({ to, icon: Icon, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `${styles.sidebarLink} ${isActive ? styles.sidebarLinkActive : ''}`}
  >
    <Icon className={styles.linkIcon} />
    <span>{children}</span>
  </NavLink>
);

export default function AdminSidebar({ isOpen }) {
  const { logout } = useAuth();
  const logo = <h2 className={styles.logoTitle}>Painel Admin</h2>;
  const footer = (
    <button onClick={logout} className={styles.logoutButton}>
      <LogoutIcon className={styles.logoutIcon} />
      <span>Sair</span>
    </button>
  );

  return (
    <Sidebar isOpen={isOpen} logo={logo} footer={footer} className={styles.sidebar}>
      {/* Links do Admin */}
      <SidebarLink to="/admin/dashboard" icon={UsersIcon}> {/* TODO: Usar ícone de Dashboard */}
        Dashboard
      </SidebarLink>
      <SidebarLink to="/admin/usuarios" icon={UsersIcon}>
        Gerenciar Usuários
      </SidebarLink>
      <SidebarLink to="/admin/oscs" icon={BuildingIcon}>
        Gerenciar OSCs
      </SidebarLink>
    </Sidebar>
  );
}