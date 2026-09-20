import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js'; 
import Spinner from '../../components/common/Spinner.jsx'; 
import Card, { CardBody, CardHeader } from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import ReportCharts from '../../components/charts/ReportCharts.jsx';
import { FiUsers, FiBriefcase, FiFolder, FiBell, FiSettings } from 'react-icons/fi';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState({ totalUsers: 0, totalOscs: 0, totalDocs: 0, totalOffices: 0 });
  const [isMaintenanceActive, setIsMaintenanceActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const addNotification = useNotification();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, statusResponse] = await Promise.all([
            api.get('/admin/dashboard-stats'),
            api.get('/system/status')
        ]);
        
        setDashboardData(statsResponse.data);
        setIsMaintenanceActive(statusResponse.data.maintenance_mode);
      } catch (error) {
        addNotification('Erro ao conectar com o servidor central.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [addNotification]);

  const handleToggleMaintenance = async () => {
    const action = isMaintenanceActive ? 'DESATIVAR' : 'ATIVAR';
    if (!window.confirm(`Tem certeza que deseja ${action} o Modo de Manutenção?\n\nSe ativado, todos os utilizadores (exceto admins) receberão um aviso e serão desconectados em 3 minutos.`)) return;

    try {
        await api.post('/system/toggle-maintenance', { 
            active: !isMaintenanceActive, 
            minutesUntilLock: 3 
        });
        setIsMaintenanceActive(!isMaintenanceActive);
        addNotification(`Modo de manutenção ${!isMaintenanceActive ? 'ATIVADO' : 'DESATIVADO'} com sucesso!`, 'success');
    } catch (err) {
        addNotification('Erro ao alterar modo de manutenção.', 'error');
    }
  };

  const stats = [
    { title: 'Total de Usuários', value: dashboardData.totalUsers, icon: FiUsers, theme: styles.blueTheme },
    { title: 'OSCs Cadastradas', value: dashboardData.totalOscs, icon: FiBriefcase, theme: styles.greenTheme },
    { title: 'Escritórios Contábeis', value: dashboardData.totalOffices, icon: FiBriefcase, theme: styles.purpleTheme },
    { title: 'Arquivos no Cofre', value: dashboardData.totalDocs, icon: FiFolder, theme: styles.orangeTheme },
  ];

  if (isLoading) return <div className={styles.loadingContainer}><Spinner text="A calcular métricas do sistema..." /></div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Visão Geral do Sistema</h1>
          <p className={styles.pageSubtitle}>Estatísticas e ações globais do painel administrativo.</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <Card key={index} padding="md" className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={`${styles.iconWrapper} ${stat.theme}`}>
                <stat.icon size={24} />
              </div>
              <div className={styles.statText}>
                <span className={styles.statLabel}>{stat.title}</span>
                <span className={styles.statValue}>{stat.value}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <ReportCharts role="ADMIN" />

      <Card padding="none" className={styles.actionsCard}>
        <CardHeader 
          className={styles.actionsHeader}
          title="Ações Rápidas de Gestão"
        />
        <CardBody className={styles.actionsBody}>
          <div className={styles.actionsGrid}>
            <Link to="/admin/usuarios" className={styles.linkNoDecoration}>
              <Button block variant="primary" icon={<FiUsers />} className={styles.actionBtn}>
                Gerenciar Usuários
              </Button>
            </Link>

            <Link to="/admin/oscs" className={styles.linkNoDecoration}>
              <Button block variant="primary" icon={<FiBriefcase />} className={styles.actionBtn}>
                Gerenciar OSCs e Escritórios
              </Button>
            </Link>
            
            <Link to="/admin/biblioteca" className={styles.linkNoDecoration}>
              <Button block variant="primary" icon={<FiFolder />} className={styles.actionBtn}>
                Biblioteca Geral e Modelos
              </Button>
            </Link>

            <Link to="/admin/avisos" className={styles.linkNoDecoration}>
              <Button block variant="secondary" icon={<FiBell />} className={styles.actionBtn}>
                Disparar Aviso Global
              </Button>
            </Link>

            <Button 
               block
               variant={isMaintenanceActive ? 'danger' : 'secondary'} 
               onClick={handleToggleMaintenance} 
               icon={<FiSettings />}
               className={styles.actionBtn}
            >
               {isMaintenanceActive ? 'Desativar Manutenção' : 'Ativar Manutenção (3 min)'}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}