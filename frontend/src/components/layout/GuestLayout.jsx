// src/components/layout/GuestLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import styles from './GuestLayout.module.css'; // Importa o CSS Module

export default function GuestLayout() {
  return (
    // Aplica a classe CSS para centralização e fundo
    <div className={styles.layout}>
      {/* O Outlet renderizará LoginPage aqui, já centralizado */}
      <Outlet />
    </div>
  );
}