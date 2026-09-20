import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  FiUploadCloud, FiClock, FiBriefcase, FiAlertTriangle, FiMessageSquare, FiDownload,
  FiArrowRight, FiUser, FiCheckCircle, FiUsers, FiDollarSign,
} from 'react-icons/fi';
import * as contadorService from '../../services/contadorService.js';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { formatDateTime } from '../../utils/formatDate.js';
import { MONTHLY_REFERENCE_FALLBACK } from '../../utils/constants.js';
import useDocumentStats from '../../hooks/useDocumentStats.js';
import ds from '../../components/dashboard/dashboard.module.css';
import StatCard from '../../components/dashboard/StatCard.jsx';
import MonthlyReference from '../../components/dashboard/MonthlyReference.jsx';
import HistoryChart from '../../components/dashboard/HistoryChart.jsx';
import EmptyState from '../../components/dashboard/EmptyState.jsx';
import ErrorState from '../../components/dashboard/ErrorState.jsx';
import RecentDocuments from '../../components/dashboard/RecentDocuments.jsx';

/**
 * Painel do Contador. O ADM Contador (dono do escritório) vê os mesmos indicadores
 * do escritório e ganha atalhos para Equipe e Financeiro.
 */
export default function ContadorDashboard() {
  const navigate = useNavigate();
  const { user, isOfficeAdmin } = useAuth();
  const addNotification = useNotification();

  const [range, setRange] = useState({ key: '6' });
  const statsParams = range.key === 'custom' ? { from: range.from, to: range.to } : { months: range.key };
  const { data: stats, isLoading: statsLoading, error: statsError, reload: reloadStats } = useDocumentStats(statsParams);

  const [ops, setOps] = useState({ activeOSCs: 0, unreadMessages: 0, missing: [] });
  const [activity, setActivity] = useState([]);
  const [opsLoading, setOpsLoading] = useState(true);
  const [opsError, setOpsError] = useState(null);

  const loadOps = async () => {
    setOpsLoading(true);
    setOpsError(null);
    try {
      const [statsResponse, activityResponse] = await Promise.all([
        contadorService.getDashboardStats(),
        contadorService.getRecentActivity(),
      ]);
      const raw = statsResponse.data;
      const data = (Array.isArray(raw) ? raw[0] : raw) || {};
      setOps({
        activeOSCs: data.activeOSCs || 0,
        unreadMessages: data.unreadMessages || 0,
        missing: data.missingDocsList || [],
      });
      setActivity(Array.isArray(activityResponse.data) ? activityResponse.data : []);
    } catch {
      setOpsError('Erro ao carregar as pendências. Verifique a conexão com o servidor.');
      addNotification('Erro ao conectar com o servidor.', 'error');
    } finally {
      setOpsLoading(false);
    }
  };

  useEffect(() => { loadOps(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDownloadPDF = async () => {
    const element = document.querySelector('[data-report-root]');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgHeight = (canvas.height * pdf.internal.pageSize.getWidth()) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), imgHeight);
    pdf.save(`relatorio-escritorio-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const totals = stats?.totals;
  const referenceMonthly = stats?.reference?.monthly || MONTHLY_REFERENCE_FALLBACK;
  const oscsWithLate = stats?.late?.oscsWithLate ?? 0;
  const firstName = user?.name?.split(' ')[0] || 'Contador';

  return (
    <div className={ds.page} data-report-root>
      <header className={ds.pageHead}>
        <div>
          <h1 className={ds.hello}>Olá, {firstName}!</h1>
          <p className={ds.sub}>
            {isOfficeAdmin ? 'Visão do desempenho do seu escritório.' : 'Veja a movimentação da sua carteira de OSCs.'}
          </p>
        </div>
        <div className={ds.headActions}>
          <Link to="/contador/mensagens" className={ds.primaryBtn}>
            <FiMessageSquare aria-hidden="true" /> Mensagens{ops.unreadMessages > 0 ? ` (${ops.unreadMessages})` : ''}
          </Link>
          <button type="button" className={ds.secondaryBtn} onClick={handleDownloadPDF}>
            <FiDownload aria-hidden="true" /> Baixar PDF
          </button>
        </div>
      </header>

      {statsError && <ErrorState message={statsError} onRetry={reloadStats} />}

      <div className={ds.statGrid}>
        <StatCard
          className={ds.span2}
          tone="hero"
          tourId="stat-sent"
          label="Documentos enviados"
          value={totals?.sent ?? 0}
          hint="Este mês, pela sua carteira"
          icon={FiUploadCloud}
          loading={statsLoading}
        />
        <StatCard
          tone={(totals?.inReview ?? 0) > 0 ? 'warning' : 'default'}
          label="Em análise"
          value={totals?.inReview ?? 0}
          hint="Aguardando sua validação"
          icon={FiClock}
          loading={statsLoading}
        />
        <StatCard label="OSCs ativas" value={stats?.oscCount ?? ops.activeOSCs} hint="Na carteira" icon={FiBriefcase} loading={statsLoading} to="/contador/oscs" />
        <StatCard
          className={ds.span2}
          tone={oscsWithLate > 0 ? 'warning' : 'success'}
          label="OSCs com meses sem envio"
          value={oscsWithLate}
          hint={oscsWithLate > 0 ? 'Veja a lista de pendências abaixo' : 'Todas em dia'}
          icon={oscsWithLate > 0 ? FiAlertTriangle : FiCheckCircle}
          loading={statsLoading}
        />
      </div>

      <MonthlyReference sent={totals?.sent ?? 0} reference={referenceMonthly} loading={statsLoading} />

      <div className={ds.twoCol}>
        <HistoryChart
          title="Histórico de envios da carteira"
          history={stats?.history || []}
          current={stats?.current}
          range={range}
          onRangeChange={setRange}
          loading={statsLoading}
          error={statsError}
          onRetry={reloadStats}
        />

        <section className={ds.card} aria-labelledby="late-title" data-tour="late-oscs">
          <div className={ds.cardHead}>
            <h2 id="late-title" className={ds.cardTitle}>OSCs com pendências</h2>
          </div>

          {opsError ? (
            <ErrorState message={opsError} onRetry={loadOps} />
          ) : opsLoading ? (
            <div className={ds.chartSkeleton} aria-label="Carregando pendências" />
          ) : ops.missing.length === 0 ? (
            <EmptyState compact icon={FiCheckCircle} title="Nenhuma pendência" text="Nenhuma OSC com documentos aguardando ou meses em atraso neste momento." />
          ) : (
            <ul className={ds.lateList}>
              {ops.missing.map((osc, idx) => (
                <li key={osc.id || idx} className={ds.lateItem}>
                  <span className={ds.lateName}>{osc.name || osc.razao_social || 'OSC'}</span>
                  <span className={ds.lateTags}>
                    {osc.awaitingValidation > 0 && (
                      <span className={`${ds.badge} ${ds.badge_warning}`}><FiClock aria-hidden="true" />{osc.awaitingValidation} em análise</span>
                    )}
                    {osc.lateMonths?.length > 0 && (
                      <span className={`${ds.badge} ${ds.badge_danger}`}><FiAlertTriangle aria-hidden="true" />Atraso: {osc.lateMonths.join(', ')}</span>
                    )}
                    {osc.awaitingValidation === undefined && osc.missing && (
                      <span className={`${ds.badge} ${ds.badge_warning}`}>{osc.missing}</span>
                    )}
                  </span>
                  <button type="button" className={ds.primaryBtn} onClick={() => navigate('/contador/oscs')}>
                    Validar <FiArrowRight aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className={ds.twoCol}>
        <RecentDocuments items={stats?.recent || []} showOsc viewAllTo="/contador/documentos" />

        <section className={ds.card} aria-labelledby="activity-title">
          <div className={ds.cardHead}>
            <h2 id="activity-title" className={ds.cardTitle}>Atividade do escritório</h2>
          </div>
          {activity.length === 0 ? (
            <EmptyState compact icon={FiUser} title="Sem atividade recente" text="Nenhum documento registrado recentemente." />
          ) : (
            <ul className={ds.docList}>
              {activity.slice(0, 6).map((item, idx) => (
                <li key={item.id || idx} className={ds.docItem}>
                  <span className={ds.docIcon}><FiUser aria-hidden="true" /></span>
                  <div className={ds.docInfo}>
                    <strong>{item.oscName || 'OSC'}</strong>
                    <small>{item.content || item.original_name} · {formatDateTime(item.timestamp || item.created_at)}</small>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {isOfficeAdmin && (
        <section className={ds.card} aria-labelledby="office-title">
          <div className={ds.cardHead}>
            <h2 id="office-title" className={ds.cardTitle}>Gestão do escritório</h2>
          </div>
          <div className={ds.headActions}>
            <Link to="/contador/equipe" className={ds.secondaryBtn}><FiUsers aria-hidden="true" /> Equipe do escritório</Link>
            <Link to="/contador/financeiro" className={ds.secondaryBtn}><FiDollarSign aria-hidden="true" /> Financeiro</Link>
          </div>
        </section>
      )}
    </div>
  );
}
