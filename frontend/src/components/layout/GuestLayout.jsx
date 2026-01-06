import React from 'react';
import { Outlet } from 'react-router-dom';
import styles from './GuestLayout.module.css';
import Footer from './Footer.jsx';

export default function GuestLayout() {
  return (
    <div className={styles.layout}>
      {/* Wrapper para centralizar o conteúdo (Login Card) */}
      <div className={styles.contentWrapper}>
        <Outlet />
      </div>
      {/* Footer fixo na base */}
      <Footer />
    </div>
  );
}