import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import styles from './AppLayout.module.css';
import Footer from './Footer.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';

export default function AppLayout({
  sidebarComponent,
  headerComponent,
  navigationComponent,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useAuth();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Define a rota de mensagens baseada no tipo de usuário logado
  const messageRoute = user?.role === 'contador' ? '/contador/mensagens' : '/osc/mensagens';

  // Conteúdo fixo do lado direito do Header (Sino + Avatar com Link)
  const headerRightContent = (
    <div className={styles.headerRight}>
      {/* Ícone de Notificação (Sino) */}
      <div className={styles.iconButton}>
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </div>

      {/* Avatar Laranja - Clicável para Mensagens */}
      <Link to={messageRoute} className={styles.avatarLink} title="Ver minhas mensagens">
        <div className={styles.userAvatar}>
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
      </Link>
    </div>
  );

  return (
    <div className={styles.layoutContainer}>
      
      {/* Sidebar Wrapper - Oculto na impressão via CSS */}
      <div 
        className={`${styles.sidebarWrapper} ${!isSidebarOpen ? styles.sidebarHidden : ''} no-print`}
      >
        {sidebarComponent}
      </div>

      {/* Main Area */}
      <main className={styles.mainContent}>

        {/* Header Container */}
        <div className={`${styles.headerContainer} no-print`}>
          {React.isValidElement(headerComponent) 
            ? React.cloneElement(headerComponent, { 
                onToggleSidebar: toggleSidebar,
                rightContent: headerRightContent // Injeta o avatar clicável
              })
            : headerComponent
          }
        </div>

        {/* Navigation Tabs */}
        {navigationComponent && (
          <div className={`${styles.navigationContainer} no-print`}>
            {navigationComponent}
          </div>
        )}

        {/* Scrollable Page Content */}
        {/* A classe pageScrollArea é a que costuma bugar o PDF. 
            O CSS que te passei anteriormente vai "destravar" esta div na impressão */}
        <div className={styles.pageScrollArea}>
          
          <div className={styles.contentWrapper}>
             <Outlet />
          </div>

          <div className={`${styles.footerWrapper} no-print`}>
            <Footer />
          </div>

        </div>

      </main>
    </div>
  );
}