import React from 'react';
import { FiCheckCircle, FiClock } from 'react-icons/fi';
import styles from './dashboard.module.css';

/** Status sempre com ícone + texto (não depende só de cor). */
const STATUS_META = {
  CONCLUIDO: { label: 'Concluído', Icon: FiCheckCircle, tone: 'success' },
  PENDENTE: { label: 'Em análise', Icon: FiClock, tone: 'warning' },
};

export default function StatusBadge({ status }) {
  const meta = STATUS_META[String(status || 'PENDENTE').toUpperCase()] || STATUS_META.PENDENTE;
  return (
    <span className={`${styles.badge} ${styles[`badge_${meta.tone}`]}`}>
      <meta.Icon aria-hidden="true" />
      {meta.label}
    </span>
  );
}
