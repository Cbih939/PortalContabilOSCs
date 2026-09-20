import React from 'react';
import styles from './dashboard.module.css';

/**
 * Progresso em relação à REFERÊNCIA mensal (≈ 20 lançamentos). Não é um limite:
 * meses com 24 ou 26 envios são normais e aparecem como "acima da referência".
 */
export default function MonthlyReference({ sent = 0, reference = 20, loading = false }) {
  const pct = reference > 0 ? Math.round((sent / reference) * 100) : 0;
  const width = Math.min(pct, 100);
  const above = sent > reference;

  return (
    <section className={styles.card} aria-labelledby="ref-title">
      <div className={styles.cardHead}>
        <h2 id="ref-title" className={styles.cardTitle}>Envio mensal</h2>
        <span className={styles.pill}>Referência mensal</span>
      </div>

      {loading ? (
        <span className={styles.skeletonBar} aria-label="Carregando" />
      ) : (
        <>
          <div className={styles.refRow}>
            <strong className={styles.refNumbers}>{sent} <span>/ {reference}</span></strong>
            <strong className={styles.refPct}>{pct}%</strong>
          </div>
          <div className={styles.progress} role="progressbar" aria-valuemin={0} aria-valuemax={reference} aria-valuenow={sent} aria-label={`${sent} de ${reference} documentos`}>
            <span style={{ width: `${width}%` }} />
          </div>
          <p className={styles.mutedText}>
            {sent === 0
              ? 'Nenhum documento enviado neste mês ainda.'
              : above
                ? `${sent - reference} acima da referência de ${reference} — tudo bem, o volume varia de mês a mês.`
                : `Faltam ${reference - sent} para alcançar a referência de ${reference} documentos.`}
          </p>
        </>
      )}
    </section>
  );
}
