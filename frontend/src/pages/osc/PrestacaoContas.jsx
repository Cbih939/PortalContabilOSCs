import React from 'react';
import styles from './OSCDashboard.module.css'; // Podemos reusar os estilos base do Dashboard

export default function PrestacaoContas() {
  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Prestação de Contas</h1>
        <p className={styles.subtitle}>Gerencie os relatórios e prestação de contas da sua organização.</p>
      </header>

      <div className={styles.cardContainer}>
        <div className="card-clean" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <svg width="64" height="64" fill="none" stroke="var(--primary-color)" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-dark)', marginBottom: '1rem' }}>Módulo em Desenvolvimento</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto', lineHeight: '1.6' }}>
            Estamos a preparar uma área completa para submissão de despesas, emissão de balancetes e envio automático de prestação de contas para os órgãos públicos e parceiros financiadores.
          </p>
          <div style={{ marginTop: '2rem' }}>
            <span style={{ display: 'inline-block', padding: '0.5rem 1rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary-hover)', borderRadius: 'var(--radius-pill)', fontSize: '0.9rem', fontWeight: '600' }}>
              Disponível Brevemente
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
