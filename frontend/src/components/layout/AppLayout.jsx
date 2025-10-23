// src/components/layout/AppLayout.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import styles from './AppLayout.module.css'; // <-- Importa o CSS Module

export default function AppLayout({
  sidebarComponent,
  headerComponent,
  navigationComponent,
}) {
  return (
    // Aplica a classe flex container principal
    <div className={styles.layoutContainer}>
      {sidebarComponent} {/* A Sidebar já tem seus próprios estilos */}

      {/* Aplica a classe flex-1 e flex-col à <main> */}
      <main className={styles.mainContent}>

        {/* Container para o Header */}
        <div className={styles.headerContainer}>
          {headerComponent}
        </div>

        {/* Container para Navegação (se existir) */}
        {navigationComponent && (
          <div className={styles.navigationContainer}>
            {navigationComponent}
          </div>
        )}

        {/* Container para o conteúdo da página */}
        <div className={styles.pageContent}>
          <Outlet />
        </div>

      </main>
    </div>
  );
}