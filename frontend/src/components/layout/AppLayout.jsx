import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import styles from './AppLayout.module.css';
import Footer from './Footer.jsx';

export default function AppLayout({
  sidebarComponent,
  headerComponent,
  navigationComponent,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={styles.layoutContainer}>
      
      {/* Sidebar Wrapper */}
      <div 
        className={`${styles.sidebarWrapper} ${!isSidebarOpen ? styles.sidebarHidden : ''}`}
      >
        {sidebarComponent}
      </div>

      {/* Main Area */}
      <main className={styles.mainContent}>

        {/* Header */}
        <div className={styles.headerContainer}>
          {React.isValidElement(headerComponent) 
            ? React.cloneElement(headerComponent, { onToggleSidebar: toggleSidebar })
            : headerComponent
          }
        </div>

        {/* Navigation Tabs */}
        {navigationComponent && (
          <div className={styles.navigationContainer}>
            {navigationComponent}
          </div>
        )}

        {/* Scrollable Page Content */}
        <div className={styles.pageScrollArea}>
          
          {/* Wrapper que cresce com o conteúdo */}
          <div className={styles.contentWrapper}>
             <Outlet />
          </div>

          {/* Footer sempre no final do fluxo */}
          <div className={styles.footerWrapper}>
            <Footer />
          </div>

        </div>

      </main>
    </div>
  );
}