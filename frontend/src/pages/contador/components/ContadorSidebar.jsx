import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth.jsx';
import {
  BuildingIcon,
  FolderIcon,
  MessageIcon,
  MegaphoneIcon,
  ChartIcon // Certifique-se que este ícone existe, ou remova se der erro
} from '../../../components/common/Icons.jsx';
import styles from './ContadorSidebar.module.css'; // O arquivo CSS deve estar na mesma pasta

export default function ContadorSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Definição dos links do menu
  const navItems = [
    { to: "/contador", label: "Visão Geral", icon: ChartIcon, end: true },
    { to: "/contador/oscs", label: "Minhas OSCs", icon: BuildingIcon },
    { to: "/contador/documentos", label: "Documentos", icon: FolderIcon },
    { to: "/contador/mensagens", label: "Mensagens", icon: MessageIcon },
    { to: "/contador/avisos", label: "Avisos", icon: MegaphoneIcon },
  ];

  return (
    <aside className={styles.sidebarContainer}>
      
      {/* 1. Logo Centralizado */}
      <div className={styles.logoContainer}>
        <img 
          src="/logo_portal.png" 
          alt="Portal Contábil" 
          className={styles.logo} 
        />
      </div>

      {/* 2. Navegação */}
      <nav className={styles.navContainer}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => 
              `${styles.navLink} ${isActive ? styles.activeLink : ''}`
            }
          >
            {/* Renderiza o ícone se existir, senão ignora */}
            {item.icon && <item.icon className={styles.icon} />}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* 3. Botão de Sair */}
      <div className={styles.footerContainer}>
        <button onClick={handleLogout} className={styles.logoutButton}>
          <span style={{ fontSize: '1.25rem', marginRight: '0.75rem' }}>←</span>
          Sair da Conta
        </button>
      </div>
    </aside>
  );
}