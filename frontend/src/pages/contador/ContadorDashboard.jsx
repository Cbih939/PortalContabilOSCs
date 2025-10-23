// src/pages/contador/ContadorDashboard.jsx

import React, { useState, useEffect } from 'react'; // Importa hooks
import { Link } from 'react-router-dom';
import {
  BuildingIcon, FolderIcon, MessageIcon, MegaphoneIcon, ChartIcon, FileIcon
} from '../../components/common/Icons.jsx';
// REMOVE import { mockNotifications } from '../../utils/mockData.js';
import { formatDateTime } from '../../utils/formatDate.js';
import styles from './ContadorDashboard.module.css';
import Spinner from '../../components/common/Spinner.jsx'; // Importa Spinner
import * as contadorService from '../../services/contadorService.js'; // Importa o novo serviço

/**
 * Página Dashboard do Contador (Conectada à API).
 */
export default function ContadorDashboard() {
  // --- Estados ---
  const [stats, setStats] = useState({ activeOSCs: 0, pendingDocs: 0, unreadMessages: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Controla o carregamento inicial
  const [error, setError] = useState(null); // Para erros de API

  // --- Efeito para Buscar Dados da API ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Faz as chamadas de API em paralelo
        const [statsResponse, activityResponse] = await Promise.all([
          contadorService.getDashboardStats(),
          contadorService.getRecentActivity(),
        ]);
        
        // Atualiza os estados com os dados recebidos
        setStats(statsResponse.data);
        setRecentActivity(activityResponse.data);

      } catch (err) {
        console.error("Erro ao buscar dados do dashboard:", err);
        setError("Não foi possível carregar os dados do dashboard. Tente novamente mais tarde.");
        // (Poderia usar useNotification aqui também)
      } finally {
        setIsLoading(false); // Finaliza o carregamento (sucesso ou erro)
      }
    };

    fetchData();
  }, []); // Array vazio [] = Executa apenas uma vez na montagem

  // --- Renderização ---

  // Estado de Erro
  if (error) {
    return <div className={styles.pageContainer} style={{ textAlign: 'center', color: 'red' }}>{error}</div>;
  }

  // Estado de Carregamento (Spinner ocupa a área da página)
  if (isLoading) {
     return (
       <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 100px)' }}>
          <Spinner text="Carregando dashboard..." />
       </div>
     );
  }

  // Estado Normal (Dados Carregados)
  return (
    <div className={styles.pageContainer}>
      <h2 className={styles.title}>
        Dashboard do Contador
      </h2>

      {/* Grid de Estatísticas (Usa dados do estado 'stats') */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIconContainer} ${styles.iconBlue}`}>
            <BuildingIcon className={styles.statIcon} />
          </div>
          <div>
            <p className={styles.statLabel}>OSCs Ativas</p>
            <p className={styles.statValue}>{stats.activeOSCs}</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIconContainer} ${styles.iconYellow}`}>
            <FolderIcon className={styles.statIcon} />
          </div>
          <div>
            <p className={styles.statLabel}>Docs. Pendentes</p>
            <p className={styles.statValue}>{stats.pendingDocs}</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIconContainer} ${styles.iconGreen}`}>
            <MessageIcon className={styles.statIcon} />
          </div>
          <div>
            <p className={styles.statLabel}>Mensagens Não Lidas</p>
            <p className={styles.statValue}>{stats.unreadMessages}</p>
          </div>
        </div>
      </div>

      {/* Grid Principal (Ações + Atividades) */}
      <div className={styles.mainGrid}>
        {/* Coluna de Ações Rápidas (sem alterações) */}
        <div className={styles.actionsColumn}>
          {/* ... (código dos links rápidos) ... */}
           <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitle}>Ações Rápidas</h3>
            <div className={styles.quickLinksContainer}>
              <Link to="/contador/oscs" className={styles.quickLink}>
                <BuildingIcon className={`${styles.quickLinkIcon} ${styles.iconLinkBlue}`} />
                Gerenciar OSCs
              </Link>
              <Link to="/contador/documentos" className={styles.quickLink}>
                <FolderIcon className={`${styles.quickLinkIcon} ${styles.iconLinkYellow}`} />
                Ver Documentos
              </Link>
              <Link to="/contador/mensagens" className={styles.quickLink}>
                <MessageIcon className={`${styles.quickLinkIcon} ${styles.iconLinkGreen}`} />
                Abrir Mensagens
              </Link>
              <Link to="/contador/avisos" className={styles.quickLink}>
                <MegaphoneIcon className={`${styles.quickLinkIcon} ${styles.iconLinkRed}`} />
                Enviar Avisos
              </Link>
            </div>
          </div>
        </div>

        {/* Coluna de Atividades Recentes (Usa dados do estado 'recentActivity') */}
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
                        {item.type === 'file' ? ' enviou o arquivo ' : ' enviou a mensagem '}
                        <i>"{item.content}"</i>
                      </p>
                      <p className={styles.activityTimestamp}>
                        {formatDateTime(item.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className={styles.emptyText}>Nenhuma atividade recente.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}