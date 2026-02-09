import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import styles from './FinanceiroDashboard.module.css';
import api from '../../services/api';

export default function FinanceiroDashboard() {
  const [stats, setStats] = useState({
    totalOSCs: 0,
    inadimplentes: 0,
    emDia: 0,
    pagamentosHistorico: []
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await api.get('/admin/financeiro/stats');
        setStats(response.data);
      } catch (err) {
        console.error("Erro ao carregar estatísticas reais");
      }
    };
    loadStats();
  }, []);

  const pieData = [
    { name: 'Recebidos', value: stats.emDia, color: '#10b981' },
    { name: 'Pendentes', value: stats.inadimplentes, color: '#f16e13' },
    { name: 'Cancelados', value: stats.cancelados || 0, color: '#ef4444' }
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Painel de Controle Financeiro</h1>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total de OSCs</span>
          <span className={styles.statValue}>{stats.totalOSCs}</span>
        </div>
        <div className={`${styles.statCard} ${styles.success}`}>
          <span className={styles.statLabel}>Pagamentos em Dia</span>
          <span className={styles.statValue}>{stats.emDia}</span>
        </div>
        <div className={`${styles.statCard} ${styles.danger}`}>
          <span className={styles.statLabel}>Inadimplentes</span>
          <span className={styles.statValue}>{stats.inadimplentes}</span>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartWrapper}>
          <h3>Distribuição de Pagamentos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartWrapper}>
          <h3>Histórico Mensal (R$)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.pagamentosHistorico}>
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="valor" fill="#f16e13" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

