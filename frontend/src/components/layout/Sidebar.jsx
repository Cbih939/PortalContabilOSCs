// src/components/layout/Sidebar.jsx
import React from 'react';
// import { clsx } from 'clsx'; // Não mais necessário
import styles from './Sidebar.module.css'; // Importa CSS Module

export default function Sidebar({
  isOpen,
  logo,
  children,
  footer,
  className = '', // Para bg-color (ex: bg-gray-800)
}) {
  const sidebarClasses = `
    ${styles.sidebar}
    ${isOpen ? styles.sidebarOpen : styles.sidebarClosed}
    ${className}
  `.trim();

  return (
    <aside className={sidebarClasses}>
      <div className={styles.innerContainer}>
        <div className={styles.logoContainer}>{logo}</div>
        <nav className={styles.navContainer}>{children}</nav>
        <div className={styles.footerContainer}>{footer}</div>
      </div>
    </aside>
  );
}