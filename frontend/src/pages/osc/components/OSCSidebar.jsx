import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth.jsx';
import styles from './OSCSidebar.module.css'; // Importa o CSS Laranja

// Ícones
const DashboardIcon = () => <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const DocsIcon = () => <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const BookIcon = () => <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const ChatIcon = () => <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>;
const ProfileIcon = () => <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const LogoutIcon = () => <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const CloseIcon = () => <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

export default function OSCSidebar({ isOpen, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Se isOpen for false, não renderiza nada (Sidebar fechada)
  if (!isOpen) return null;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <h2 className={styles.logoText}>Contábil OSC</h2>
        
        {/* Botão X para fechar no Mobile */}
        {onClose && (
          <button onClick={onClose} className={styles.closeButton}>
            <CloseIcon />
          </button>
        )}
      </div>

      <nav className={styles.nav}>
        <NavLink to="/osc/inicio" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <DashboardIcon /> <span className={styles.label}>Dashboard</span>
        </NavLink>
        
        <NavLink to="/osc/documentos" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <DocsIcon /> <span className={styles.label}>Meus Documentos</span>
        </NavLink>
        
        <NavLink to="/osc/modelos" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <DocsIcon /> <span className={styles.label}>Docs | Modelos</span>
        </NavLink>
        
        <NavLink to="/osc/biblioteca" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <BookIcon /> <span className={styles.label}>Biblioteca | E-book</span>
        </NavLink>
        
        <NavLink to="/osc/mensagens" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <ChatIcon /> <span className={styles.label}>Mensagens</span>
        </NavLink>
        
        <NavLink to="/osc/perfil" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <ProfileIcon /> <span className={styles.label}>Editar Perfil</span>
        </NavLink>
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