// src/components/common/Spinner.jsx

import React from 'react';
// import { clsx } from 'clsx'; // Não mais necessário
import styles from './Spinner.module.css'; // Importa o CSS Module

/**
 * Componente de Spinner (usando CSS Modules).
 */
export default function Spinner({
  size = 'md', // sm, md, lg
  className = '', // Classe extra para o container
  text,
  fullscreen = false,
}) {

  const spinnerClasses = `
    ${styles.spinner}
    ${styles[size]}
  `.trim();

  const spinnerComponent = (
    // Aplica classe do container e a classe extra
    <div className={`${styles.spinnerContainer} ${className}`}>
      {/* O spinner animado */}
      <div className={spinnerClasses} role="status" aria-label="Carregando"></div>
      {/* Texto opcional */}
      {text && (
        <span className={styles.spinnerText}>{text}</span>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className={styles.fullscreenOverlay}>
        {spinnerComponent}
      </div>
    );
  }

  return spinnerComponent;
}