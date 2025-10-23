// src/pages/contador/ContadorDashboard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
// Importa ícones
import {
  BuildingIcon,
  FolderIcon,
  MessageIcon,
  MegaphoneIcon,
  ChartIcon, // Adicionado para Dashboard link
  FileIcon,
} from '../../components/common/Icons.jsx';
// Importa mocks (substituir por API no futuro)
import { mockNotifications } from '../../utils/mockData.js';
// Importa helper de data
import { formatDateTime } from '../../utils/formatDate.js';
// Importa CSS Module
import styles from './ContadorDashboard.module.css';

/**
 * Página Dashboard do Contador (CSS Modules).
 */
export default function ContadorDashboard() {
  // Dados mock (substituir por API)
  const stats = {
    activeOSCs: 3,
    pendingDocs: 2,
    unreadMessages: 1,
  };
  const recentActivity = [...mockNotifications]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  return (
    <div className={styles.pageContainer}>
      <h2 className={styles.title}>
        Dashboard do Contador
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
            <p className={styles.statLabel}>Mensagens Não Lidas</p>
            <p className={styles.statValue}>{stats.unreadMessages}</p>
          </div>
        </div>
      </div>

      {/* Grid Principal (Ações + Atividades) */}
      <div className={styles.mainGrid}>
        {/* Coluna de Ações Rápidas */}
        <div className={styles.actionsColumn}>
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
                        {item.type === 'file' ? ' enviou o arquivo ' : ' enviou a mensagem '}
                        <i>"{item.content}"</i>
                      </p>
                      <p className={styles.activityTimestamp}>
                        {formatDateTime(item.timestamp)} {/* Usa helper formatDateTime */}
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