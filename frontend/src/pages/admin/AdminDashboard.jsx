import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiUploadCloud, FiClock, FiUsers, FiBriefcase, FiFolder, FiBell, FiSettings, FiGrid, FiBookOpen, FiDollarSign,
} from 'react-icons/fi';
import api from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { MONTHLY_REFERENCE_FALLBACK } from '../../utils/constants.js';
import useDocumentStats from '../../hooks/useDocumentStats.js';
import ds from '../../components/dashboard/dashboard.module.css';
import StatCard from '../../components/dashboard/StatCard.jsx';
import MonthlyReference from '../../components/dashboard/MonthlyReference.jsx';
import HistoryChart from '../../components/dashboard/HistoryChart.jsx';
import RecentDocuments from '../../components/dashboard/RecentDocuments.jsx';
import ErrorState from '../../components/dashboard/ErrorState.jsx';

export default function AdminDashboard() {
  const { user } = useAuth();
  const addNotification = useNotification();

  const [range, setRange] = useState({ key: '6' });
  const statsParams = range.key === 'custom' ? { from: range.from, to: range.to } : { months: range.key };
  const { data: stats, isLoading: statsLoading, error: statsError, reload: reloadStats } = useDocumentStats(statsParams);

  const [totalsData, setTotalsData] = useState(null);
  const [totalsError, setTotalsError] = useState(null);
  const [isMaintenanceActive, setIsMaintenanceActive] = useState(false);

  const loadSystem = async () => {
    setTotalsError(null);
    try {
      const [statsResponse, statusResponse] = await Promise.all([
        api.get('/admin/dashboard-stats'),
        api.get('/system/status'),
      ]);
      setTotalsData(statsResponse.data);
      setIsMaintenanceActive(!!statusResponse.data.maintenance_mode);
    } catch {
      setTotalsError('Erro ao conectar com o servidor central.');
    }
  };

  useEffect(() => { loadSystem(); }, []);

  const handleToggleMaintenance = async () => {
    const action = isMaintenanceActive ? 'DESATIVAR' : 'ATIVAR';
    if (!window.confirm(`Tem certeza que deseja ${action} o Modo de Manutenção?\n\nSe ativado, todos os utilizadores (exceto admins) receberão um aviso e serão bloqueados em 3 minutos.`)) return;
    try {
      await api.post('/system/toggle-maintenance', { active: !isMaintenanceActive, minutesUntilLock: 3 });
      setIsMaintenanceActive(!isMaintenanceActive);
      addNotification(`Modo de manutenção ${!isMaintenanceActive ? 'ATIVADO' : 'DESATIVADO'} com sucesso!`, 'success');
    } catch {
      addNotification('Erro ao alterar modo de manutenção.', 'error');
    }
  };

  const totals = stats?.totals;
  const referenceMonthly = stats?.reference?.monthly || MONTHLY_REFERENCE_FALLBACK;
  const loadingTotals = totalsData === null && !totalsError;

  const shortcuts = [
    { to: '/admin/usuarios', label: 'Usuários', icon: FiUsers },
    { to: '/admin/oscs', label: 'OSCs', icon: FiGrid },
    { to: '/admin/offices', label: 'Escritórios', icon: FiBriefcase },
    { to: '/admin/financeiro', label: 'Financeiro', icon: FiDollarSign },
    { to: '/admin/biblioteca', label: 'Biblioteca', icon: FiBookOpen },
    { to: '/admin/avisos', label: 'Aviso global', icon: FiBell },
  ];

  return (
    <div className={ds.page}>
      <header className={ds.pageHead}>
        <div>
          <h1 className={ds.hello}>Olá, {user?.name?.split(' ')[0] || 'Administrador'}!</h1>
          <p className={ds.sub}>Visão global da plataforma.</p>
        </div>
      </header>

      {(statsError || totalsError) && <ErrorState message={statsError || totalsError} onRetry={() => { reloadStats(); loadSystem(); }} />}

      <div className={ds.statGrid}>
        <StatCard
          className={ds.span2}
          tone="hero"
          tourId="stat-sent"
          label="Documentos enviados"
          value={totals?.sent ?? 0}
          hint="Este mês, em toda a plataforma"
          icon={FiUploadCloud}
          loading={statsLoading}
        />
        <StatCard tone={(totals?.inReview ?? 0) > 0 ? 'warning' : 'default'} label="Em análise" value={totals?.inReview ?? 0} hint="Aguardando validação" icon={FiClock} loading={statsLoading} />
        <StatCard label="OSCs cadastradas" value={totalsData?.totalOscs ?? 0} icon={FiGrid} loading={loadingTotals} to="/admin/oscs" />
        <StatCard label="Escritórios" value={totalsData?.totalOffices ?? 0} icon={FiBriefcase} loading={loadingTotals} to="/admin/offices" />
        <StatCard label="Usuários" value={totalsData?.totalUsers ?? 0} icon={FiUsers} loading={loadingTotals} to="/admin/usuarios" />
        <StatCard label="Arquivos no cofre" value={totalsData?.totalDocs ?? 0} hint="Inclui registros TEC" icon={FiFolder} loading={loadingTotals} />
      </div>

      <MonthlyReference sent={totals?.sent ?? 0} reference={referenceMonthly} loading={statsLoading} />

      <div className={ds.twoCol}>
        <HistoryChart
          title="Histórico de envios da plataforma"
          history={stats?.history || []}
          current={stats?.current}
          range={range}
          onRangeChange={setRange}
          loading={statsLoading}
          error={statsError}
          onRetry={reloadStats}
        />
        <RecentDocuments items={stats?.recent || []} showOsc />
      </div>

      <section className={ds.card} aria-labelledby="quick-title">
        <div className={ds.cardHead}>
          <h2 id="quick-title" className={ds.cardTitle}>Ações rápidas</h2>
        </div>
        <div className={ds.headActions}>
          {shortcuts.map((s) => (
            <Link key={s.to} to={s.to} className={ds.secondaryBtn}><s.icon aria-hidden="true" /> {s.label}</Link>
          ))}
          <button
            type="button"
            className={isMaintenanceActive ? ds.primaryBtn : ds.secondaryBtn}
            onClick={handleToggleMaintenance}
            aria-pressed={isMaintenanceActive}
          >
            <FiSettings aria-hidden="true" /> {isMaintenanceActive ? 'Desativar manutenção' : 'Ativar manutenção (3 min)'}
          </button>
        </div>
      </section>
    </div>
  );
}
