import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import styles from './AppLayout.module.css';
import Footer from './Footer.jsx';

export default function AppLayout({
  sidebarComponent,
  headerComponent,
  navigationComponent,
}) {
  // Estado para controlar a visibilidade da Sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Função que será chamada pelo botão do Header
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={styles.layoutContainer}>
      
      {/* Wrapper da Sidebar com controle de visibilidade */}
      <div 
        className={`${styles.sidebarWrapper} ${!isSidebarOpen ? styles.sidebarHidden : ''}`}
      >
        {sidebarComponent}
      </div>

      {/* Conteúdo Principal */}
      <main className={styles.mainContent}>

        {/* Header (Injetamos a função toggleSidebar aqui) */}
        <div className={styles.headerContainer}>
          {React.isValidElement(headerComponent) 
            ? React.cloneElement(headerComponent, { onToggleSidebar: toggleSidebar })
            : headerComponent
          }
        </div>

        {/* Navegação Secundária (Abas) */}
        {navigationComponent && (
          <div className={styles.navigationContainer}>
            {navigationComponent}
          </div>
        )}

        {/* Conteúdo da Página */}
        <div className={styles.pageContent}>
          <Outlet />
          
          <div className={styles.footerWrapper}>
            <Footer />
          </div>
        </div>

      </main>
    </div>
  );
}