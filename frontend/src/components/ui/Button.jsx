import React from 'react';
import styles from './Button.module.css';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  block = false, 
  loading = false, 
  icon,
  className = '',
  disabled,
  ...props 
}) {
  const variantClass = styles[variant] || styles.primary;
  const sizeClass = styles[`size-${size}`] || styles['size-md'];
  const blockClass = block ? styles.block : '';
  const loadingClass = loading ? styles.loading : '';
  const disabledState = disabled || loading;

  return (
    <button 
      className={`${styles.button} ${variantClass} ${sizeClass} ${blockClass} ${loadingClass} ${className}`}
      disabled={disabledState}
      {...props}
    >
      {loading ? (
        <span className={styles.spinner}></span>
      ) : (
        <>
          {icon && <span className={styles.icon}>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}
