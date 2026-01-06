import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BuildingIcon, FolderIcon, MessageIcon, MegaphoneIcon, FileIcon
} from '../../components/common/Icons.jsx';
import * as contadorService from '../../services/contadorService.js';
import { formatDateTime } from '../../utils/formatDate.js';
import styles from './ContadorDashboard.module.css';
import Spinner from '../../components/common/Spinner.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';

/**
 * Página Dashboard do Contador (Conectada à API).
 */
export default function ContadorDashboard() {
  const [stats, setStats] = useState({ activeOSCs: 0, pendingDocs: 0, unreadMessages: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const addNotification = useNotification();

  // --- Efeito para Buscar Dados da API ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [statsResponse, activityResponse] = await Promise.all([
          contadorService.getDashboardStats(),
          contadorService.getRecentActivity(),
        ]);
        
        setStats(statsResponse.data);
        setRecentActivity(activityResponse.data);

      } catch (err) {
        console.error("Erro ao buscar dados do dashboard:", err);
        setError("Não foi possível carregar os dados do dashboard.");
        addNotification("Erro ao carregar dados do dashboard.", "error"); 
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [addNotification]);

  // --- Renderização ---

  if (error) {
    return <div className={styles.pageContainer} style={{ textAlign: 'center', color: '#dc2626', marginTop: '2rem' }}>{error}</div>;
  }

  if (isLoading) {
     return (
       <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <Spinner text="A carregar dashboard..." color="#EC6D12" />
       </div>
     );
  }

  return (
    <div className={styles.pageContainer}>

      {/* Logo Centralizada no topo do Dashboard */}
      <img
        src="/logo_portal.png"
        alt="Logo Portal Contábil"
        className={styles.dashboardLogo}
      />
      
      <h2 className={styles.title}>
        Painel de Controle
      </h2>

      {/* Grid de Estatísticas */}
      <div className={styles.statsGrid}>
        
        {/* Card OSCs Ativas */}
        <div className={styles.statCard}>
          <div className={`${styles.statIconContainer} ${styles.iconBlue}`}>
            <BuildingIcon className={styles.statIcon} />
          </div>
          <div>
            <p className={styles.statLabel}>OSCs Ativas</p>
            <p className={styles.statValue}>{stats.activeOSCs}</p>
          </div>
        </div>

        {/* Card Documentos Pendentes */}
        <div className={styles.statCard}>
          <div className={`${styles.statIconContainer} ${styles.iconYellow}`}>
            <FolderIcon className={styles.statIcon} />
          </div>
          <div>
            <p className={styles.statLabel}>Docs. Pendentes</p>
            <p className={styles.statValue}>{stats.pendingDocs}</p>
          </div>
        </div>

        {/* Card Mensagens Não Lidas */}
        <div className={styles.statCard}>
          <div className={`${styles.statIconContainer} ${styles.iconGreen}`}>
            <MessageIcon className={styles.statIcon} />
          </div>
          <div>
            <p className={styles.statLabel}>Mensagens Novas</p>
            <p className={styles.statValue}>{stats.unreadMessages}</p>
          </div>
        </div>
      </div>

      {/* Grid Principal (Ações + Atividades) */}
      <div className={styles.mainGrid}>
        
        {/* Coluna de Ações Rápidas */}
        <div className={styles.actionsColumn}>
          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitle}>Acesso Rápido</h3>
            <div className={styles.quickLinksContainer}>
              <Link to="/contador/oscs" className={styles.quickLink}>
                <BuildingIcon className={styles.quickLinkIcon} />
                Gerenciar OSCs
              </Link>
              <Link to="/contador/documentos" className={styles.quickLink}>
                <FolderIcon className={styles.quickLinkIcon} />
                Ver Documentos
              </Link>
              <Link to="/contador/mensagens" className={styles.quickLink}>
                <MessageIcon className={styles.quickLinkIcon} />
                Mensagens
              </Link>
              <Link to="/contador/avisos" className={styles.quickLink}>
                <MegaphoneIcon className={styles.quickLinkIcon} />
                Enviar Avisos
              </Link>
            </div>
          </div>
        </div>

        {/* Coluna de Atividades Recentes */}
        <div className={styles.activityColumn}>
          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitle}>Atividades Recentes</h3>
            <div className={styles.activityFeedContainer}>
              {recentActivity.length > 0 ? (
                recentActivity.map((item) => (
                  <div key={item.id} className={styles.activityItem}>
                    <div className={styles.activityIconContainer}>
                      {item.type === 'file' ? (
                        <FileIcon className={styles.activityIcon} />
                      ) : (
                        <MessageIcon className={styles.activityIcon} />
                      )}
                    </div>
                    <div className={styles.activityText}>
                      <p>
                        <strong>{item.oscName}</strong>
                        {item.type === 'file' ? ' enviou um arquivo ' : ' enviou uma mensagem '}
                        <br />
                        <span style={{ color: '#6b7280', fontStyle: 'italic' }}>"{item.content}"</span>
                      </p>
                      <span className={styles.activityTimestamp}>
                        {formatDateTime(item.timestamp)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className={styles.emptyText}>Nenhuma atividade recente encontrada.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}