// src/pages/admin/AdminDashboard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
// Importa ícones e Button
import { UsersIcon, BuildingIcon } from '../../components/common/Icons.jsx';
import Button from '../../components/common/Button.jsx';
// Importa CSS Module
import styles from './AdminDashboard.module.css';

/**
 * Página Dashboard do Admin (CSS Modules).
 */
export default function AdminDashboard() {
  // Dados mock (substituir por API)
  const stats = {
    totalUsers: 50,
    totalOSCs: 3,
    totalContadores: 5,
  };

  return (
    <div className={styles.pageContainer}>
      <h2 className={styles.title}>
        Dashboard do Administrador
      </h2>

      {/* Grid de Estatísticas */}
      <div className={styles.statsGrid}>

        {/* Card Total de Usuários (agora é Link) */}
        <Link to="/admin/usuarios" className={styles.statCard}>
          <div className={`${styles.statIconContainer} ${styles.iconBlue}`}>
            <UsersIcon className={styles.statIcon} />
          </div>
          <div>
            <p className={styles.statLabel}>Total de Usuários</p>
            <p className={styles.statValue}>{stats.totalUsers}</p>
          </div>
        </Link>

        {/* Card Total de OSCs (agora é Link) */}
        <Link to="/admin/oscs" className={styles.statCard}>
          <div className={`${styles.statIconContainer} ${styles.iconGreen}`}>
            <BuildingIcon className={styles.statIcon} />
          </div>
          <div>
            <p className={styles.statLabel}>OSCs Cadastradas</p>
            <p className={styles.statValue}>{stats.totalOSCs}</p>
          </div>
        </Link>

        {/* Card Total de Contadores (não é link) */}
        <div className={styles.statCard}>
          <div className={`${styles.statIconContainer} ${styles.iconYellow}`}>
            <UsersIcon className={styles.statIcon} /> {/* Reutiliza ícone */}
          </div>
          <div>
            <p className={styles.statLabel}>Contadores Ativos</p>
            <p className={styles.statValue}>{stats.totalContadores}</p>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className={styles.actionsCard}>
        <h3 className={styles.actionsTitle}>
          Ações Rápidas
        </h3>
        <div className={styles.actionsContainer}>
          {/* Usa o componente Button com a prop 'as={Link}' */}
          <Button
            as={Link}
            to="/admin/usuarios"
            variant="primary" // Botão azul
            className={styles.actionButton}
          >
            <UsersIcon /> {/* CSS Module pode estilizar o SVG */}
            Gerenciar Usuários
          </Button>
          <Button
            as={Link}
            to="/admin/oscs"
            variant="success" // Usa a variante verde que criámos
            className={styles.actionButton}
          >
            <BuildingIcon /> {/* CSS Module pode estilizar o SVG */}
            Gerenciar OSCs
          </Button>
        </div>
      </div>
    </div>
  );
}