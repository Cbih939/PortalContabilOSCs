import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  BuildingIcon, FolderIcon, MessageIcon, MegaphoneIcon, FileIcon
} from '../../components/common/Icons.jsx';
import * as contadorService from '../../services/contadorService.js';
import { formatDateTime } from '../../utils/formatDate.js';
import styles from './ContadorDashboard.module.css';
import Spinner from '../../components/common/Spinner.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';

const COLORS = ['#EC6D12', '#1f2937', '#6b7280', '#eab308'];

export default function ContadorDashboard() {
  const [stats, setStats] = useState({ activeOSCs: 0, pendingDocs: 0, unreadMessages: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const addNotification = useNotification();

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

        // Mock de dados para o gráfico baseado no volume de atividades
        // Em produção, isso pode vir de um endpoint específico getChartData()
        setChartData([
          { name: 'Seg', envios: 4 },
          { name: 'Ter', envios: 7 },
          { name: 'Qua', envios: 5 },
          { name: 'Qui', envios: 12 },
          { name: 'Sex', envios: statsResponse.data.pendingDocs },
        ]);

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

  const pieData = [
    { name: 'Documentos', value: stats.pendingDocs },
    { name: 'Mensagens', value: stats.unreadMessages },
    { name: 'OSCs Ativas', value: stats.activeOSCs },
  ];

  if (error) {
    return <div className={styles.errorContainer}>{error}</div>;
  }

  if (isLoading) {
    return (
      <div className={styles.loaderFull}>
        <Spinner text="A carregar dashboard..." color="#EC6D12" />
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <img src="/logo_portal.png" alt="Logo" className={styles.dashboardLogo} />
      
      <h2 className={styles.title}>Painel de Controle Analítico</h2>

      {/* Grid de Estatísticas (KPIs) */}
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
            <p className={styles.statLabel}>Mensagens Novas</p>
            <p className={styles.statValue}>{stats.unreadMessages}</p>
          </div>
        </div>
      </div>

      {/* Área de Gráficos */}
      <div className={styles.chartsGrid}>
        <div className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>Volume de Envios (Semanal)</h3>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip cursor={{fill: '#fff7ed'}} />
                <Bar dataKey="envios" fill="#EC6D12" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>Distribuição de Demandas</h3>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        {/* Coluna de Ações Rápidas */}
        <div className={styles.actionsColumn}>
          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitle}>Acesso Rápido</h3>
            <div className={styles.quickLinksContainer}>
              <Link to="/contador/oscs" className={styles.quickLink}>
                <BuildingIcon className={styles.quickLinkIcon} /> Gerenciar OSCs
              </Link>
              <Link to="/contador/documentos" className={styles.quickLink}>
                <FolderIcon className={styles.quickLinkIcon} /> Ver Documentos
              </Link>
              <Link to="/contador/mensagens" className={styles.quickLink}>
                <MessageIcon className={styles.quickLinkIcon} /> Mensagens
              </Link>
              <Link to="/contador/avisos" className={styles.quickLink}>
                <MegaphoneIcon className={styles.quickLinkIcon} /> Enviar Avisos
              </Link>
            </div>
          </div>
        </div>

        {/* Coluna de Atividades Recentes */}
        <div className={styles.activityColumn}>
          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitle}>Fluxo de Atividades</h3>
            <div className={styles.activityFeedContainer}>
              {recentActivity.length > 0 ? (
                recentActivity.map((item) => (
                  <div key={item.id} className={styles.activityItem}>
                    <div className={styles.activityIconContainer}>
                      {item.type === 'file' ? <FileIcon className={styles.activityIcon} /> : <MessageIcon className={styles.activityIcon} />}
                    </div>
                    <div className={styles.activityText}>
                      <p>
                        <strong>{item.oscName}</strong>
                        {item.type === 'file' ? ' enviou um arquivo ' : ' enviou uma mensagem '}
                        <br />
                        <span className={styles.activityContent}>"{item.content}"</span>
                      </p>
                      <span className={styles.activityTimestamp}>
                        {formatDateTime(item.timestamp)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className={styles.emptyText}>Nenhuma atividade encontrada.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}