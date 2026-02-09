import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth.jsx';
import styles from './OSCSidebar.module.css';

// Ícones
const DashboardIcon = () => <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const DocsIcon = () => <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const BookIcon = () => <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const ChatIcon = () => <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>;
const FinanceIcon = () => <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ProfileIcon = () => <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const LogoutIcon = () => <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const CloseIcon = () => <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

export default function OSCSidebar({ isOpen, onClose }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // Verificação rigorosa do débito (convertendo para número para evitar erro de string)
  const isDebt = Number(user?.is_in_debt) === 1;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isOpen) return null;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <img src="/logo_portal.png" alt="Portal" className={styles.sidebarLogo} />
      </div>

      <nav className={styles.nav}>
        {/* LINKS BLOQUEADOS: Só aparecem se NÃO estiver em débito */}
        {!isDebt && (
          <>
            <NavLink to="/osc/inicio" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
              <DashboardIcon /> <span className={styles.label}>Painel Principal</span>
            </NavLink>
            <NavLink to="/osc/documentos" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
              <DocsIcon /> <span className={styles.label}>Meus Documentos</span>
            </NavLink>
            <NavLink to="/osc/modelos" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
              <DocsIcon /> <span className={styles.label}>Modelos</span>
            </NavLink>
            <NavLink to="/osc/biblioteca" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
              <BookIcon /> <span className={styles.label}>Biblioteca | E-book</span>
            </NavLink>
            <NavLink to="/osc/perfil" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
              <ProfileIcon /> <span className={styles.label}>Editar Perfil</span>
            </NavLink>
          </>
        )}

        {/* LINKS LIBERADOS: Sempre aparecem para regularização */}
        <NavLink to="/osc/mensagens" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <ChatIcon /> <span className={styles.label}>Mensagens</span>
        </NavLink>

        <NavLink to="/osc/financeiro" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <FinanceIcon /> <span className={styles.label}>Financeiro</span>
        </NavLink>
      </nav>

      <div className={styles.footer}>
        <button onClick={handleLogout} className={styles.logoutButton}>
          <LogoutIcon /> <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}