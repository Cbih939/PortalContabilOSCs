import React from 'react';
import { Link } from 'react-router-dom';
import styles from './dashboard.module.css';

/** Nunca deixar uma tela vazia: explica o que aconteceu e oferece o próximo passo. */
export default function EmptyState({ icon: Icon, title, text, action, compact = false }) {
  return (
    <div className={`${styles.empty} ${compact ? styles.emptyCompact : ''}`}>
      {Icon && <span className={styles.emptyIcon}><Icon aria-hidden="true" /></span>}
      <h3 className={styles.emptyTitle}>{title}</h3>
      {text && <p className={styles.emptyText}>{text}</p>}
      {action && (action.to ? (
        <Link to={action.to} className={styles.primaryBtn}>{action.label}</Link>
      ) : (
        <button type="button" className={styles.primaryBtn} onClick={action.onClick}>{action.label}</button>
      ))}
    </div>
  );
}
