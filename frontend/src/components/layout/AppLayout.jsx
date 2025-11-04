// src/components/layout/AppLayout.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import styles from './AppLayout.module.css';
import Footer from './Footer.jsx'; // Garanta que o Footer está importado

export default function AppLayout({
  sidebarComponent,
  headerComponent,
  navigationComponent,
}) {
  return (
    <div className={styles.layoutContainer}>
      
      {sidebarComponent} {/* A Sidebar (ex: ContadorSidebar) */}

      {/* O container principal (Header + Conteúdo + Footer) */}
      <main className={styles.mainContent}>

        {/* 1. Header */}
        <div className={styles.headerContainer}>
          {headerComponent}
        </div>

        {/* 2. Navegação (ex: Abas da OSC) */}
        {navigationComponent && (
          <div className={styles.navigationContainer}>
            {navigationComponent}
          </div>
        )}

        {/* 3. Conteúdo da Página (Onde o Chat vive) */}
        <div className={styles.pageContent}>
          <Outlet /> {/* Aqui é onde a ContadorMessagesPage entra */}
        </div>

        {/* 4. Footer (Irmão do .pageContent) */}
        <div className={styles.footerContainer}>
          <Footer />
        </div>

      </main>
    </div>
  );
}