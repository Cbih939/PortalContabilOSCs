import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth.jsx';
import styles from './OSCSidebar.module.css';

// --- Ícones ---
const DashboardIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const OrgIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1v1H9V7zm5 0h1v1h-1V7zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1z" /></svg>;
const FinanceIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const AccountabilityIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const GovernanceIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const ChatIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>;
const HelpIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const LogoutIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const ChevronDownIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>;

export default function OSCSidebar({ isOpen }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [expandedMenu, setExpandedMenu] = useState('org'); // Controla qual submenu está aberto

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSubmenu = (menu) => {
    setExpandedMenu(expandedMenu === menu ? null : menu);
  };

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`} style={{ overflowY: 'auto' }}>
      <div className={styles.logoContainer}>
        <div className={styles.logoWrapper}>
          <img src="/logo_portal.png" alt="Conta Comigo" className={styles.sidebarLogo} />
        </div>
      </div>

      <nav className={styles.nav} style={{ paddingBottom: '80px' }}>
        <NavLink to="/osc/inicio" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <DashboardIcon className={styles.icon} />
          <span className={styles.label}>Painel Principal</span>
        </NavLink>

        {/* 1. MINHA ORGANIZAÇÃO */}
        <div className={styles.menuGroup}>
          <button onClick={() => toggleSubmenu('org')} className={styles.navItem} style={{ width: '100%', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <OrgIcon className={styles.icon} />
              <span className={styles.label}>Minha Organização</span>
            </div>
            <ChevronDownIcon style={{ transform: expandedMenu === 'org' ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
          </button>
          
          {expandedMenu === 'org' && (
            <div className={styles.submenu} style={{ paddingLeft: '32px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              <NavLink to="/osc/perfil" className={({ isActive }) => `${styles.subNavItem} ${isActive ? styles.subActive : ''}`} style={{ fontSize: '0.85rem', color: '#cbd5e1', textDecoration: 'none' }}>Abertura e Regularização</NavLink>
              <NavLink to="/osc/documentos" className={({ isActive }) => `${styles.subNavItem} ${isActive ? styles.subActive : ''}`} style={{ fontSize: '0.85rem', color: '#cbd5e1', textDecoration: 'none' }}>Meus Documentos</NavLink>
              <NavLink to="/osc/modelos" className={({ isActive }) => `${styles.subNavItem} ${isActive ? styles.subActive : ''}`} style={{ fontSize: '0.85rem', color: '#cbd5e1', textDecoration: 'none' }}>Modelos de Documentos</NavLink>
            </div>
          )}
        </div>

        {/* 2. FINANCEIRO */}
        <div className={styles.menuGroup} style={{ marginTop: '8px' }}>
          <button onClick={() => toggleSubmenu('fin')} className={styles.navItem} style={{ width: '100%', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FinanceIcon className={styles.icon} />
              <span className={styles.label}>Financeiro</span>
            </div>
            <ChevronDownIcon style={{ transform: expandedMenu === 'fin' ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
          </button>
          
          {expandedMenu === 'fin' && (
            <div className={styles.submenu} style={{ paddingLeft: '32px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              <NavLink to="/osc/financeiro" className={({ isActive }) => `${styles.subNavItem} ${isActive ? styles.subActive : ''}`} style={{ fontSize: '0.85rem', color: '#cbd5e1', textDecoration: 'none' }}>Faturas e Assinatura</NavLink>
              <span style={{ fontSize: '0.85rem', color: '#64748b', cursor: 'not-allowed' }}>Notas Fiscais (Em Breve)</span>
              <span style={{ fontSize: '0.85rem', color: '#64748b', cursor: 'not-allowed' }}>Projetos e C. de Custo (Em Breve)</span>
            </div>
          )}
        </div>

        {/* 3. PRESTAÇÃO DE CONTAS */}
        <NavLink to="/osc/prestacao-contas" style={{ marginTop: '8px', opacity: 0.5, pointerEvents: 'none' }} className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <AccountabilityIcon className={styles.icon} />
          <span className={styles.label}>Prest. de Contas (Em Breve)</span>
        </NavLink>

        {/* 4. GOVERNANÇA */}
        <NavLink to="/osc/governanca" style={{ marginTop: '8px', opacity: 0.5, pointerEvents: 'none' }} className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <GovernanceIcon className={styles.icon} />
          <span className={styles.label}>Governança (Em Breve)</span>
        </NavLink>

        {/* MENSAGENS E AJUDA */}
        <div style={{ borderTop: '1px solid #334155', margin: '16px 0' }}></div>

        <NavLink to="/osc/mensagens" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <ChatIcon className={styles.icon} />
          <span className={styles.label}>Mensagens</span>
        </NavLink>

        <NavLink to="/osc/ajuda" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <HelpIcon className={styles.icon} />
          <span className={styles.label}>Ajuda Institucional</span>
        </NavLink>

      </nav>

      <div className={styles.footer} style={{ position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#0f172a' }}>
        <div className={styles.userInfo}>
           <span className={styles.userName}>{user?.name || 'Organização'}</span>
        </div>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          <LogoutIcon className={styles.icon} />
          <span className={styles.label}>Sair do Sistema</span>
        </button>
      </div>
    </aside>
  );
}