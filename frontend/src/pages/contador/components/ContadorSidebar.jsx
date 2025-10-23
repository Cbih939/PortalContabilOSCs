// src/pages/contador/components/ContadorSidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
// import { clsx } from 'clsx'; // Não mais necessário para NavLink
import Sidebar from '../../../components/layout/Sidebar.jsx';
import { /* ... Ícones ... */ LogoutIcon, ChartIcon, BuildingIcon, FolderIcon, MegaphoneIcon, MessageIcon, ProfileIcon } from '../../../components/common/Icons.jsx';
import { useAuth } from '../../../hooks/useAuth.jsx';
import styles from './ContadorSidebar.module.css'; // Importa CSS Module específico

// Componente SidebarLink modificado para usar CSS Modules
const SidebarLink = ({ to, icon: Icon, children }) => {
  return (
    <NavLink
      to={to}
      // Usa a função para aplicar classe ativa
      className={({ isActive }) =>
        `${styles.sidebarLink} ${isActive ? styles.sidebarLinkActive : ''}`
      }
    >
      <Icon className={styles.linkIcon} />
      <span>{children}</span>
    </NavLink>
  );
};

export default function ContadorSidebar({ isOpen }) {
  const { logout } = useAuth();
  const handleLogout = () => logout();
  const logo = <h2 className={styles.logoTitle}>Contábil OSC</h2>;

  const footer = (
    <button onClick={handleLogout} className={styles.logoutButton}>
      <LogoutIcon className={styles.logoutIcon} />
      <span>Sair</span>
    </button>
  );

  return (
    // Passa a classe de cor específica para o molde Sidebar
    <Sidebar isOpen={isOpen} logo={logo} footer={footer} className={styles.sidebar}>
      {/* Links de Navegação */}
      <SidebarLink to="/contador/dashboard" icon={ChartIcon}>Dashboard</SidebarLink>
      <SidebarLink to="/contador/oscs" icon={BuildingIcon}>Lista de OSCs</SidebarLink>
      <SidebarLink to="/contador/documentos" icon={FolderIcon}>Documentos</SidebarLink>
      <SidebarLink to="/contador/avisos" icon={MegaphoneIcon}>Canal de Avisos</SidebarLink>
      <SidebarLink to="/contador/mensagens" icon={MessageIcon}>Mensagens</SidebarLink>
      <SidebarLink to="/contador/perfil" icon={ProfileIcon}>Editar Perfil</SidebarLink>
    </Sidebar>
  );
}