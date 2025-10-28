// src/pages/admin/AdminDashboard.jsx

import React, { useState, useEffect } from 'react'; // Importa hooks
import { Link } from 'react-router-dom';
// Importa ícones e componentes
import { UsersIcon, BuildingIcon } from '../../components/common/Icons.jsx';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx'; // Para loading
// Importa serviços API e constantes
import * as userService from '../../services/userService.js';
import * as oscService from '../../services/oscService.js';
import { ROLES } from '../../utils/constants.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
// Importa estilos
import styles from './AdminDashboard.module.css';

/**
 * Página Dashboard do Admin (Conectada à API).
 */
export default function AdminDashboard() {
  // Estado para estatísticas
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOSCs: 0,
    totalContadores: 0,
  });
  // Estados de controlo
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const addNotification = useNotification();

  // Efeito para buscar os dados da API na montagem
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Busca todos os utilizadores e todas as OSCs em paralelo
        const [usersResponse, oscsResponse] = await Promise.all([
          userService.getAllUsers(),
          oscService.getAllOSCs(),
        ]);

        const users = usersResponse.data || [];
        const oscs = oscsResponse.data || [];

        // Calcula as estatísticas
        const contadorCount = users.filter(u => u.role === ROLES.CONTADOR).length;
        
        setStats({
          totalUsers: users.length,
          totalOSCs: oscs.length,
          totalContadores: contadorCount,
        });

      } catch (err) {
        console.error("Erro ao buscar estatísticas do admin:", err);
        setError("Não foi possível carregar as estatísticas.");
        addNotification("Erro ao carregar estatísticas.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [addNotification]); // addNotification é estável

  // Renderização
  return (
    <div className={styles.pageContainer}>
      <h2 className={styles.title}>
        Dashboard do Administrador
      </h2>

      {isLoading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <Spinner text="Carregando estatísticas..." />
        </div>
      ) : error ? (
         <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
            {error}
          </div>
      ) : (
        <>
          {/* Grid de Estatísticas (agora usa o estado 'stats') */}
          <div className={styles.statsGrid}>
            {/* Card Total de Usuários */}
            <Link to="/admin/usuarios" className={styles.statCard}>
              <div className={`${styles.statIconContainer} ${styles.iconBlue}`}>
                <UsersIcon className={styles.statIcon} />
              </div>
              <div>
                <p className={styles.statLabel}>Total de Usuários</p>
                <p className={styles.statValue}>{stats.totalUsers}</p>
              </div>
            </Link>

            {/* Card Total de OSCs */}
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
<div className={styles.statCard} style={{cursor: 'default', transform: 'none'}}>
  <div className={`${styles.statIconContainer} ${styles.iconYellow}`}>
    <UsersIcon className={styles.statIcon} />
  </div>
  <div>
    <p className={styles.statLabel}>Contadores Ativos</p> {/* <-- CORRIGIDO */}
    <p className={styles.statValue}>{stats.totalContadores}</p>
  </div>
</div>
          </div>

          {/* Ações Rápidas (sem alterações) */}
          <div className={styles.actionsCard}>
            <h3 className={styles.actionsTitle}>
              Ações Rápidas
            </h3>
            <div className={styles.actionsContainer}>
              <Button as={Link} to="/admin/usuarios" variant="primary" className={styles.actionButton}>
                <UsersIcon />
                Gerenciar Usuários
              </Button>
              <Button as={Link} to="/admin/oscs" variant="success" className={styles.actionButton}>
                <BuildingIcon />
                Gerenciar OSCs
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}