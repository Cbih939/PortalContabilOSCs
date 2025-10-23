// src/components/common/Input.jsx

import React from 'react';
// import { clsx } from 'clsx'; // Não mais necessário
import styles from './Input.module.css'; // Importa o CSS Module

/**
 * Componente de Input reutilizável (usando CSS Modules).
 */
export default function Input({
  label,
  id,
  name,
  icon: IconComponent,
  error,
  className = '', // Para o container principal (div externa)
  inputClassName = '', // Para classes extras no próprio <input>
  ...props
}) {

  // Determina as classes CSS para o elemento <input>
  const inputClasses = `
    ${styles.inputBase}
    ${error ? styles.inputError : styles.inputDefault}
    ${IconComponent ? styles.inputWithIcon : ''}
    ${inputClassName}
  `.trim();

  return (
    // Aplica a classe do container e a classe extra opcional
    <div className={`${styles.container} ${className}`}>
      {label && (
        <label htmlFor={id || name} className={styles.label}>
          {label}
        </label>
      )}

      {/* Wrapper para input e ícone */}
      <div className={styles.inputWrapper}>
        {IconComponent && (
          <div className={styles.iconContainer}>
            {/* Aplica a classe de estilo ao ícone */}
            <IconComponent className={styles.icon} />
          </div>
        )}

        {/* O Input */}
        <input
          id={id}
          name={name}
          className={inputClasses} // Aplica as classes combinadas
          {...props}
        />
      </div>

      {error && (
        <p className={styles.errorMessage} id={`${id || name}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}