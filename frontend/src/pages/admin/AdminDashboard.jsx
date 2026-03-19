import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js'; 
import Spinner from '../../components/common/Spinner.jsx'; 
import { useNotification } from '../../contexts/NotificationContext.jsx';
import styles from './AdminDashboard.module.css';

// --- Ícones SVG ---
const UsersIcon = () => (
  <svg className={styles.icon || "w-6 h-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
);
const BuildingIcon = () => (
  <svg className={styles.icon || "w-6 h-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
);
const FolderIcon = () => (
  <svg className={styles.icon || "w-6 h-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H5z" /></svg>
);
const MegaphoneIcon = () => (
    <svg className={styles.icon || "w-6 h-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
);
const OfficeIcon = () => (
  <svg className={styles.icon || "w-6 h-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
);
const SettingsIcon = () => (
  <svg className={styles.icon || "w-6 h-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState({ totalUsers: 0, totalOscs: 0, totalDocs: 0, totalOffices: 0 });
  const [isMaintenanceActive, setIsMaintenanceActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const addNotification = useNotification();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Traz as estatísticas e verifica se o modo de manutenção já está ligado!
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

  // Transformando os dados da API para o array do Grid
  const stats = [
    { title: 'Total de Usuários', value: dashboardData.totalUsers, icon: UsersIcon, theme: styles.blueTheme || 'blueTheme' },
    { title: 'OSCs Cadastradas', value: dashboardData.totalOscs, icon: BuildingIcon, theme: styles.greenTheme || 'greenTheme' },
    { title: 'Escritórios Contábeis', value: dashboardData.totalOffices, icon: OfficeIcon, theme: styles.purpleTheme || 'purpleTheme' },
    { title: 'Arquivos no Cofre', value: dashboardData.totalDocs, icon: FolderIcon, theme: styles.orangeTheme || 'orangeTheme' },
  ];

  if (isLoading) return <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spinner text="A calcular métricas do sistema..." /></div>;

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Visão Geral do Sistema</h1>

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
        <h3 className={styles.sectionTitle}>Ações Rápidas de Gestão</h3>
        
        <div className={styles.actionsGrid}>
          
          <Link to="/admin/usuarios" className={`${styles.actionButton} ${styles.btnOrange}`}>
            <UsersIcon />
            <span>Gerenciar Usuários</span>
          </Link>

          <Link to="/admin/oscs" className={`${styles.actionButton} ${styles.btnGreen}`}>
            <BuildingIcon />
            <span>Gerenciar OSCs e Escritórios</span>
          </Link>
          
          <Link to="/admin/biblioteca" className={`${styles.actionButton} ${styles.btnIndigo}`}>
            <FolderIcon />
            <span>Biblioteca Geral e Modelos</span>
          </Link>

          <Link to="/admin/avisos" className={`${styles.actionButton} ${styles.btnGray}`}>
             <MegaphoneIcon />
             <span>Disparar Aviso Global</span>
          </Link>

          {/* BOTÃO MODO MANUTENÇÃO */}
          <button 
             onClick={handleToggleMaintenance} 
             className={`${styles.actionButton}`}
             style={isMaintenanceActive ? { backgroundColor: '#dc2626', color: '#fff', borderColor: '#b91c1c' } : {}}
          >
             <SettingsIcon />
             <span>{isMaintenanceActive ? 'Desativar Manutenção' : 'Ativar Manutenção (3 min)'}</span>
          </button>

        </div>
      </div>
    </div>
  );
}