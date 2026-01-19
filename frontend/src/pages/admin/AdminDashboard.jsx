import React from 'react';
import { Link } from 'react-router-dom';
import styles from './AdminDashboard.module.css';

// --- Ícones SVG ---
const UsersIcon = () => (
  <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
);
const BuildingIcon = () => (
  <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
);
const FolderIcon = () => (
  <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H5z" /></svg>
);
const MegaphoneIcon = () => (
    <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
);

export default function AdminDashboard() {
  // Estatísticas simuladas (futuramente podem vir da API)
  const stats = [
    { title: 'Total de Usuários', value: '7', icon: UsersIcon, theme: styles.blueTheme },
    { title: 'OSCs Cadastradas', value: '5', icon: BuildingIcon, theme: styles.greenTheme },
    { title: 'Arquivos Publicados', value: '12', icon: FolderIcon, theme: styles.orangeTheme },
    // Adicionei um card extra para balancear o grid se quiser
    // { title: 'Avisos Ativos', value: '3', icon: MegaphoneIcon, theme: styles.purpleTheme },
  ];

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Painel do Administrador</h1>

      {/* Grid de Estatísticas */}
      <div className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <div key={index} className={styles.statCard}>
            <div className={`${styles.iconWrapper} ${stat.theme}`}>
              <stat.icon />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>{stat.title}</span>
              <span className={styles.statValue}>{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Seção de Ações Rápidas */}
      <div className={styles.actionsSection}>
        <h3 className={styles.sectionTitle}>Ações Rápidas</h3>
        
        <div className={styles.actionsGrid}>
          
          <Link to="/admin/usuarios" className={`${styles.actionButton} ${styles.btnOrange}`}>
            <UsersIcon />
            Gerenciar Usuários
          </Link>

          <Link to="/admin/oscs" className={`${styles.actionButton} ${styles.btnGreen}`}>
            <BuildingIcon />
            Gerenciar OSCs
          </Link>
          
          <Link to="/admin/biblioteca" className={`${styles.actionButton} ${styles.btnIndigo}`}>
            <FolderIcon />
            Biblioteca e Modelos
          </Link>

          <Link to="/admin/avisos" className={`${styles.actionButton} ${styles.btnGray}`}>
             <MegaphoneIcon />
             Criar Aviso
          </Link>

        </div>
      </div>
    </div>
  );
}