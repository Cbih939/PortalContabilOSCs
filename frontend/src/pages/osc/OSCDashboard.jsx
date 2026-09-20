import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api.js'; 
import styles from './OSCDashboard.module.css';
import Card, { CardBody, CardHeader } from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import { FiAlertCircle, FiShield, FiCalendar, FiExternalLink, FiChevronRight, FiUploadCloud, FiClock, FiCheckCircle } from 'react-icons/fi';
import ds from '../../components/dashboard/dashboard.module.css';
import StatCard from '../../components/dashboard/StatCard.jsx';
import MonthlyReference from '../../components/dashboard/MonthlyReference.jsx';
import HistoryChart from '../../components/dashboard/HistoryChart.jsx';
import RecentDocuments from '../../components/dashboard/RecentDocuments.jsx';
import ErrorState from '../../components/dashboard/ErrorState.jsx';
import useDocumentStats from '../../hooks/useDocumentStats.js';
import { MONTHLY_REFERENCE_FALLBACK } from '../../utils/constants.js';

export default function OSCDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [oscData, setOscData] = useState(null);
  const [boardMembers, setBoardMembers] = useState([]);
  const [officialLinks, setOfficialLinks] = useState([]);
  const [showCertificadosModal, setShowCertificadosModal] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; 
  const currentDay = today.getDate();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const yearsAvailable = [currentYear, currentYear - 1, currentYear - 2];

  // Dados REAIS do dashboard (documentos enviados, histórico mensal, pendências)
  const [range, setRange] = useState({ key: '6' });
  const statsParams = range.key === 'custom' ? { from: range.from, to: range.to } : { months: range.key };
  const { data: stats, isLoading: statsLoading, error: statsError, reload: reloadStats } = useDocumentStats(statsParams);
  const totals = stats?.totals;
  const lateMonths = stats?.late?.lateMonths || [];
  const referenceMonthly = stats?.reference?.monthly || MONTHLY_REFERENCE_FALLBACK;

  const syncCalendar = () => {
    import('../../utils/calendar.js').then(module => {
      module.downloadICS("Envio Contábil", "Lembrete mensal", "Portal");
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [oscRes, boardRes, linksRes] = await Promise.all([
            api.get('/oscs/me'),
            api.get('/board').catch(() => ({ data: [] })),
            api.get('/certificates').catch(() => ({ data: [] })) 
        ]);
        setOscData(oscRes.data.osc || oscRes.data[0] || oscRes.data);
        setBoardMembers(boardRes.data || []);
        setOfficialLinks(linksRes.data || []);
      } catch (error) {
        console.error("Erro ao buscar dados do Dashboard", error);
      }
    };
    fetchData();
  }, []);

  // --- LÓGICA DO ESCUDO DE GOVERNANÇA ---
  let governanceStatus = { type: 'UNKNOWN', text: 'Cadastre os membros da diretoria para monitorar o mandato.', theme: 'muted', icon: <FiAlertCircle /> };
  
  const activeMembers = boardMembers.filter(m => m.status === 'ATIVO');

  if (activeMembers.length > 0) {
    let mandateEnd = null;
    const president = activeMembers.find(m => m.role && m.role.trim().toLowerCase() === 'presidente');
    
    if (president && president.end_date) {
        mandateEnd = new Date(president.end_date);
    } else {
        const dates = activeMembers.filter(m => m.end_date).map(m => new Date(m.end_date));
        if (dates.length > 0) mandateEnd = new Date(Math.max(...dates));
    }

    if (mandateEnd) {
      mandateEnd.setHours(0, 0, 0, 0);
      const diffTime = mandateEnd - today;
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (daysLeft < 0) {
        governanceStatus = { type: 'EXPIRED', text: `ATENÇÃO: O mandato expirou há ${Math.abs(daysLeft)} dias!`, theme: 'danger', icon: <FiAlertCircle /> };
      } else if (daysLeft <= 60) {
        governanceStatus = { type: 'WARNING', text: `ALERTA: O mandato expira em ${daysLeft} dias.`, theme: 'warning', icon: <FiAlertCircle /> };
      } else {
        governanceStatus = { type: 'OK', text: `Governança em dia. Válido por mais ${daysLeft} dias.`, theme: 'success', icon: <FiShield /> };
      }
    }
  }

  // --- LÓGICA DO CALENDÁRIO ---
  const originDateStr = oscData?.data_origem_estatuto || oscData?.data_fundacao || oscData?.created_at;
  let originYear = 2000, originMonth = 0; 
  
  if (originDateStr) {
    if (typeof originDateStr === 'string' && originDateStr.includes('-')) {
        const parts = originDateStr.split('T')[0].split('-');
        originYear = parseInt(parts[0], 10);
        originMonth = parseInt(parts[1], 10) - 1;
    } else {
        const d = new Date(originDateStr);
        originYear = d.getFullYear();
        originMonth = d.getMonth();
    }
  }

  const getMonthConfig = (index) => {
    const monthNum = index + 1;
    if (selectedYear < originYear || (selectedYear === originYear && index < originMonth)) return { status: '-', class: styles.statusFuturo, isBlocked: true };
    if (selectedYear < currentYear) return { status: 'ATRASO', class: styles.statusAtraso, isBlocked: false };
    if (selectedYear === currentYear) {
      if (monthNum < currentMonth) {
        if (monthNum === currentMonth - 1 && currentDay <= 10) return { status: 'ABERTO', class: styles.statusAberto, isBlocked: false };
        return { status: 'ATRASO', class: styles.statusAtraso, isBlocked: false };
      }
      if (monthNum === currentMonth) return { status: 'ABERTO', class: styles.statusAberto, isBlocked: false };
      return { status: '-', class: styles.statusFuturo, isBlocked: false };
    }
    return { status: '-', class: '', isBlocked: false };
  };

  const months = [{ name: 'Jan' }, { name: 'Fev' }, { name: 'Mar' }, { name: 'Abr' }, { name: 'Mai' }, { name: 'Jun' }, { name: 'Jul' }, { name: 'Ago' }, { name: 'Set' }, { name: 'Out' }, { name: 'Nov' }, { name: 'Dez' }].map((m, index) => ({ ...m, ...getMonthConfig(index) }));

  const handleMonthClick = (m, monthIndex) => {
    if (m.isBlocked) return;
    navigate(`/osc/documentos?month=${monthIndex + 1}&year=${selectedYear}`);
  };

  const oscState = oscData?.estado || oscData?.uf || '';
  const oscCity = oscData?.cidade || oscData?.municipio || '';

  const linksFederais = officialLinks.filter(l => l.type === 'FEDERAL');
  const linksEstaduais = officialLinks.filter(l => l.type === 'ESTADUAL' && l.state?.toUpperCase() === oscState.toUpperCase());
  const linksMunicipais = officialLinks.filter(l => l.type === 'MUNICIPAL' && l.state?.toUpperCase() === oscState.toUpperCase() && l.city?.toLowerCase().trim() === oscCity.toLowerCase().trim());

  return (
    <div className={ds.page}>
      
      {/* CABEÇALHO: saudação + ação principal */}
      <header className={ds.pageHead}>
        <div>
          <h1 className={ds.hello}>Olá, {user?.name?.split(' ')[0] || 'OSC'}!</h1>
          <p className={ds.sub}>Veja como está a sua movimentação.</p>
        </div>
        <div className={ds.headActions}>
          <Link to="/osc/documentos?enviar=1" className={`${ds.primaryBtn} ${ds.belowDesktop}`}>
            <FiUploadCloud aria-hidden="true" /> Enviar documento
          </Link>
          <button type="button" className={ds.secondaryBtn} onClick={syncCalendar}>
            <FiCalendar aria-hidden="true" /> Calendário
          </button>
          <button type="button" className={ds.secondaryBtn} onClick={() => setShowCertificadosModal(true)}>
            <FiShield aria-hidden="true" /> Certidões
          </button>
        </div>
      </header>

      {statsError && <ErrorState message={statsError} onRetry={reloadStats} />}

      {/* INDICADORES (dados reais) */}
      <div className={ds.statGrid}>
        <StatCard
          className={ds.span2}
          tone="hero"
          tourId="stat-sent"
          label="Documentos enviados"
          value={totals?.sent ?? 0}
          hint="Este mês"
          icon={FiUploadCloud}
          loading={statsLoading}
        />
        <StatCard label="Em análise" value={totals?.inReview ?? 0} hint="Aguardando conferência" icon={FiClock} loading={statsLoading} />
        <StatCard label="Concluídos" tone="success" value={totals?.concluded ?? 0} hint="Validados pela contabilidade" icon={FiCheckCircle} loading={statsLoading} />
        <StatCard
          className={ds.span2}
          tone={lateMonths.length > 0 ? 'warning' : 'default'}
          label="Meses sem envio"
          value={lateMonths.length}
          hint={lateMonths.length > 0 ? 'Toque para regularizar' : 'Tudo em dia'}
          icon={FiAlertCircle}
          loading={statsLoading}
          to={lateMonths.length > 0 ? '/osc/documentos' : undefined}
        />
      </div>

      <MonthlyReference sent={totals?.sent ?? 0} reference={referenceMonthly} loading={statsLoading} />

      <div className={ds.twoCol}>
        <HistoryChart
          history={stats?.history || []}
          current={stats?.current}
          range={range}
          onRangeChange={setRange}
          loading={statsLoading}
          error={statsError}
          onRetry={reloadStats}
        />
        <RecentDocuments items={stats?.recent || []} viewAllTo="/osc/documentos" uploadTo="/osc/documentos?enviar=1" />
      </div>

      {/* BANNER GOVERNANÇA */}
      <Link to="/osc/governanca" className={styles.noUnderline}>
        <div className={`${styles.governanceBanner} ${styles[`gov-${governanceStatus.theme}`]}`}>
          <div className={styles.govIconWrapper}>{governanceStatus.icon}</div>
          <div className={styles.govContent}>
            <h3>Escudo de Governança</h3>
            <p>{governanceStatus.text}</p>
          </div>
          <div className={styles.govAction}>
            <FiChevronRight size={20} />
          </div>
        </div>
      </Link>

      {/* CALENDÁRIO CONTÁBIL */}
      <Card className={styles.calendarCard}>
        <CardHeader 
          title="Painel Contábil" 
          action={
            <select className="input-clean" style={{width: 'auto', padding: '0.4rem'}} value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
              {yearsAvailable.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          }
        />
        <CardBody>
          <div className={styles.legendGrid}>
            <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.bgRed}`}></span> Atraso</span>
            <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.bgYellow}`}></span> Aberto</span>
            <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.bgBlue}`}></span> Enviado</span>
            <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.bgGreen}`}></span> Concluso</span>
          </div>
          
          <div className={styles.monthsGrid}>
            {months.map((m, index) => (
              <div 
                key={index} 
                className={`${styles.monthCard} ${m.class}`} 
                onClick={() => handleMonthClick(m, index)} 
                style={{ cursor: m.isBlocked || m.status === '-' ? 'default' : 'pointer', opacity: m.isBlocked ? 0.4 : 1 }}
              >
                <span className={styles.monthName}>{m.name}</span>
                <span className={styles.monthStatus}>{m.isBlocked ? 'INATIVO' : m.status}</span>
                {m.status === 'ATRASO' && !m.isBlocked && <span className={styles.retroactiveLabel}>Retroativo</span>}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* MODAL CERTIFICADORAS */}
      {showCertificadosModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3><FiShield /> Certificadoras e CNDs</h3>
              <p>Acesse rapidamente os portais oficiais ({oscCity ? `${oscCity} - ` : ''}{oscState || 'Brasil'}).</p>
            </div>

            <div className={styles.modalBody}>
              {linksFederais.length > 0 && (
                <div className={styles.linkGroup}>
                  <h4>Federal</h4>
                  {linksFederais.map(l => (
                    <a key={l.id} href={l.url} target="_blank" rel="noreferrer" className={`${styles.linkCard} ${styles.linkFederal}`}>
                      {l.title} <FiExternalLink />
                    </a>
                  ))}
                </div>
              )}

              {linksEstaduais.length > 0 && (
                <div className={styles.linkGroup}>
                  <h4>Estadual</h4>
                  {linksEstaduais.map(l => (
                    <a key={l.id} href={l.url} target="_blank" rel="noreferrer" className={`${styles.linkCard} ${styles.linkEstadual}`}>
                      {l.title} <FiExternalLink />
                    </a>
                  ))}
                </div>
              )}

              {linksMunicipais.length > 0 && (
                <div className={styles.linkGroup}>
                  <h4>Municipal</h4>
                  {linksMunicipais.map(l => (
                    <a key={l.id} href={l.url} target="_blank" rel="noreferrer" className={`${styles.linkCard} ${styles.linkMunicipal}`}>
                      {l.title} <FiExternalLink />
                    </a>
                  ))}
                </div>
              )}

              {(linksFederais.length === 0 && linksEstaduais.length === 0 && linksMunicipais.length === 0) && (
                <div className={styles.emptyState}>
                  <p>Nenhum link configurado para a sua região.</p>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <Button variant="secondary" onClick={() => setShowCertificadosModal(false)}>Fechar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}