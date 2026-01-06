import React from 'react';
import { Outlet } from 'react-router-dom';
import styles from './AppLayout.module.css';
import Footer from './Footer.jsx';

export default function AppLayout({
  sidebarComponent,
  headerComponent,
  navigationComponent,
}) {
  return (
    <div className={styles.layoutContainer}>
      
      {/* Sidebar Fixa à Esquerda */}
      {sidebarComponent}

      {/* Área Principal de Conteúdo */}
      <main className={styles.mainContent}>

        {/* 1. Header Fixo no Topo */}
        <div className={styles.headerContainer}>
          {headerComponent}
        </div>

        {/* 2. Navegação secundária (opcional) */}
        {navigationComponent && (
          <div className={styles.navigationContainer}>
            {navigationComponent}
          </div>
        )}

        {/* 3. Conteúdo da Página (Scrollável) */}
        <div className={styles.pageContent}>
          <Outlet />
          
          {/* Footer no final do conteúdo */}
          <div className={styles.footerWrapper}>
            <Footer />
          </div>
        </div>

      </main>
    </div>
  );
}