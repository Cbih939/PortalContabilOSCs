import React, { useState, useEffect } from 'react';
import styles from './FinanceiroDashboard.module.css';
// import api from '../../services/api'; // Descomente quando a API estiver pronta

export default function FinanceiroDashboard() {
  const [stats, setStats] = useState({ totalOSCs: 0, inadimplentes: 0, emDia: 0 });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Painel de Controle Financeiro</h1>
        <p className={styles.subtitle}>Gerencie os pagamentos e suspensões das OSCs</p>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total de OSCs</span>
          <span className={styles.statValue}>150</span>
        </div>
        <div className={`${styles.statCard} ${styles.danger}`}>
          <span className={styles.statLabel}>Inadimplentes</span>
          <span className={styles.statValue}>12</span>
        </div>
        <div className={`${styles.statCard} ${styles.success}`}>
          <span className={styles.statLabel}>Em Dia</span>
          <span className={styles.statValue}>138</span>
        </div>
      </div>

      <div className={styles.recentActivity}>
        <h3>Últimas Atualizações de Status</h3>
        {/* Aqui entraria uma tabela ou lista de logs financeiros */}
        <p>Aguardando dados da API...</p>
      </div>
    </div>
  );
}