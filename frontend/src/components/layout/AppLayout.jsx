import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import styles from './AppLayout.module.css';
import Footer from './Footer.jsx';
import BottomNavigation from './BottomNavigation.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';

export default function AppLayout({
  sidebarComponent,
  headerComponent,
  navigationComponent,
}) {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Fecha sidebar por padrão em telas pequenas apenas por segurança,
  // mas o CSS agora controla a exibição da sidebar vs bottom bar.
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    handleResize(); // Executa na montagem
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const messageRoute = user?.role === 'contador' ? '/contador/mensagens' : '/osc/mensagens';

  const headerRightContent = (
    <div className={styles.headerRight}>
      <div className={`${styles.iconButton} hide-on-mobile`}>
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </div>

      <Link to={messageRoute} className={styles.avatarLink} title="Minhas Mensagens">
        <div className={styles.userAvatar}>
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
      </Link>
    </div>
  );

  return (
    <div className={styles.layoutContainer}>
      
      {/* Sidebar - Oculta no mobile, gerenciada por estado no desktop */}
      <div className={`${styles.sidebarWrapper} hide-on-mobile ${!isSidebarOpen ? styles.sidebarHidden : ''} no-print`}>
        {React.isValidElement(sidebarComponent) 
          ? React.cloneElement(sidebarComponent, { 
              isOpen: isSidebarOpen, 
              onClose: () => setIsSidebarOpen(false),
              user: user
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
                user: user
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
            <Footer />
          </div>
        </div>

        {/* Navigation exclusiva para Mobile */}
        <BottomNavigation />
      </main>
    </div>
  );
}