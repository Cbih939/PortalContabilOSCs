import React from 'react';
import styles from './Card.module.css';

export default function Card({ children, className = '', padding = 'md', onClick }) {
  const paddingClass = styles[`padding-${padding}`] || styles['padding-md'];
  
  return (
    <div 
      className={`${styles.card} ${paddingClass} ${onClick ? styles.clickable : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`${styles.cardHeader} ${className}`}>
      <div>
        {title && <h3 className={styles.cardTitle}>{title}</h3>}
        {subtitle && <p className={styles.cardSubtitle}>{subtitle}</p>}
      </div>
      {action && <div className={styles.cardAction}>{action}</div>}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return (
    <div className={`${styles.cardBody} ${className}`}>
      {children}
    </div>
  );
}
