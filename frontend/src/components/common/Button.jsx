// src/components/common/Button.jsx

import React from 'react';
// import { clsx } from 'clsx'; // Não mais necessário aqui
import styles from './Button.module.css'; // Importa o CSS Module

/**
 * Componente de botão reutilizável com variantes de estilo (usando CSS Modules).
 */
export default function Button({
  children,
  onClick,
  variant = 'primary', // primary, secondary, danger, ghost
  size = 'md',         // sm, md, lg
  className = '',      // Permite adicionar classes extras (raramente necessário agora)
  as: Component = 'button', // Permite usar como Link (ex: as={Link})
  ...props             // Outras props (type, disabled, etc.)
}) {

  // Combina as classes do CSS Module e a classe extra opcional
  const buttonClassName = `
    ${styles.buttonBase}
    ${styles[variant]}
    ${styles[size]}
    ${className}
  `.trim(); // .trim() remove espaços extras

  return (
    <Component
      onClick={onClick}
      className={buttonClassName}
      {...props}
    >
      {children}
    </Component>
  );
}