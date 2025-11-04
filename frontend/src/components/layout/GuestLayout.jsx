// src/components/layout/GuestLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import styles from './GuestLayout.module.css';
import Footer from './Footer.jsx'; // <-- 1. IMPORTAR

export default function GuestLayout() {
  return (
    <div className={styles.layout}>

      {/* 2. Adiciona o Wrapper para o conteúdo (card de login) */}
      <div className={styles.contentWrapper}>
        <Outlet />
      </div>

      {/* 3. Adiciona o Footer (fora do wrapper) */}
      <Footer />
    </div>
  );
}