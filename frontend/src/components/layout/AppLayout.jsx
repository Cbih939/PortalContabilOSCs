import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import styles from './AppLayout.module.css';
import Footer from './Footer.jsx';
import { useAuth } from '../../hooks/useAuth.jsx'; // Garante o import do hook

export default function AppLayout({
  sidebarComponent,
  headerComponent,
  navigationComponent,
}) {
  // Extraímos o user aqui para evitar o erro "user is not defined"
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const messageRoute = user?.role === 'contador' ? '/contador/mensagens' : '/osc/mensagens';

  // Conteúdo do Header (Avatar com letra do nome)
  const headerRightContent = (
    <div className={styles.headerRight}>
      <div className={styles.iconButton}>
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </div>

      <Link to={messageRoute} className={styles.avatarLink} title="Minhas Mensagens">
        <div className={styles.userAvatar}>
          {/* Proteção para o caso do nome ser nulo */}
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
      </Link>
    </div>
  );

  return (
    <div className={`${styles.layoutContainer} ${isSidebarOpen ? styles.sidebarActive : ''}`}>
      
      <div 
        className={`${styles.mobileOverlay} ${isSidebarOpen ? styles.overlayVisible : ''}`} 
        onClick={() => setIsSidebarOpen(false)} 
      />

      <div className={`${styles.sidebarWrapper} ${!isSidebarOpen ? styles.sidebarHidden : ''} no-print`}>
        {React.isValidElement(sidebarComponent) 
          ? React.cloneElement(sidebarComponent, { 
              isOpen: isSidebarOpen, 
              onClose: () => setIsSidebarOpen(false),
              user: user // Passamos o user para a Sidebar
            })
          : sidebarComponent
        }
      </div>

      <main className={styles.mainContent}>
        <div className={`${styles.headerContainer} no-print`}>
          {React.isValidElement(headerComponent) 
            ? React.cloneElement(headerComponent, { 
                onToggleSidebar: toggleSidebar,
                rightContent: headerRightContent,
                user: user // Passamos o user para o Header
              })
            : headerComponent
          }
        </div>

        {navigationComponent && (
          <div className={`${styles.navigationContainer} no-print`}>
            {navigationComponent}
          </div>
        )}

        <div className={styles.pageScrollArea}>
          <div className={styles.contentWrapper}>
             <Outlet />
          </div>

          <div className={`${styles.footerWrapper} no-print`}>
            {/* Se o Footer usar "user", ele também precisa receber aqui ou via hook interno */}
            <Footer />
          </div>
        </div>
      </main>
    </div>
  );
}