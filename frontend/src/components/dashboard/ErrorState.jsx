import React from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import styles from './dashboard.module.css';

export default function ErrorState({ message = 'Não foi possível carregar os dados.', onRetry }) {
  return (
    <div className={styles.errorBox} role="alert">
      <FiAlertTriangle aria-hidden="true" />
      <div>
        <strong>Algo deu errado</strong>
        <p>{message}</p>
      </div>
      {onRetry && (
        <button type="button" className={styles.secondaryBtn} onClick={onRetry}>
          <FiRefreshCw aria-hidden="true" /> Tentar novamente
        </button>
      )}
    </div>
  );
}
