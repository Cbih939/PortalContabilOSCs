import React from 'react';
import { Link } from 'react-router-dom';
import styles from './dashboard.module.css';

/**
 * Cartão de indicador.
 * @param {'default'|'hero'|'warning'|'success'} tone  'hero' = destaque laranja do indicador principal
 */
export default function StatCard({ label, value, hint, icon: Icon, tone = 'default', to, loading = false, tourId, className = '' }) {
  const body = (
    <>
      <div className={styles.statTop}>
        <span className={styles.statLabel}>{label}</span>
        {Icon && <span className={styles.statIcon}><Icon aria-hidden="true" /></span>}
      </div>
      {loading ? (
        <span className={styles.skeletonValue} aria-label="Carregando" />
      ) : (
        <span className={styles.statValue}>{value}</span>
      )}
      {hint && <span className={styles.statHint}>{hint}</span>}
    </>
  );

  const classes = `${styles.statCard} ${styles[`stat_${tone}`]} ${to ? styles.statLink : ''} ${className}`;
  return to ? (
    <Link to={to} className={classes} data-tour={tourId}>{body}</Link>
  ) : (
    <div className={classes} data-tour={tourId}>{body}</div>
  );
}
