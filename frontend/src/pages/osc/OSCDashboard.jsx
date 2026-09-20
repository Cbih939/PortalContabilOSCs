import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api.js'; 
import styles from './OSCDashboard.module.css';
import ReportCharts from '../../components/charts/ReportCharts.jsx';
import Card, { CardBody, CardHeader } from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import { FiFileText, FiAlertCircle, FiMessageSquare, FiShield, FiCalendar, FiExternalLink, FiInfo, FiChevronRight } from 'react-icons/fi';

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
    <div className={styles.container}>
      
      {/* HEADER SECTION (App-like) */}
      <div className={styles.headerSection}>
        <div className={styles.headerTitleGroup}>
          <img src="/logo_portal.png" alt="Logo" className={styles.logo} />
          <div>
            <h1 className={styles.title}>Olá, {user?.name?.split(' ')[0] || 'OSC'}!</h1>
            <p className={styles.subtitle}>O que faremos hoje?</p>
          </div>
        </div>
        
        <div className={`${styles.headerActions} hide-on-mobile`}>
          <Button 
            variant="outline" 
            icon={<FiCalendar />}
            onClick={() => {
              import('../../utils/calendar.js').then(module => {
                module.downloadICS("Envio Contábil", "Lembrete mensal", "Portal");
              });
            }}
          >
            Sincronizar Calendário
          </Button>
          <Button 
            variant="primary" 
            icon={<FiShield />}
            onClick={() => setShowCertificadosModal(true)}
          >
            Certificadoras
          </Button>
        </div>
      </div>

      {/* MOBILE AÇÕES RÁPIDAS */}
      <div className={`${styles.mobileQuickActions} show-on-mobile-flex`}>
        <Button size="sm" variant="outline" icon={<FiCalendar />} block onClick={() => {/* logic */}}>Calendário</Button>
        <Button size="sm" variant="primary" icon={<FiShield />} block onClick={() => setShowCertificadosModal(true)}>Certidões</Button>
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

      {/* QUICK STATS CARDS */}
      <div className={styles.statsGrid}>
        <Link to="/osc/modelos" className={styles.noUnderline}>
          <Card className={styles.statCard} padding="md">
            <div className={`${styles.statIcon} ${styles.iconBlue}`}>
              <FiFileText size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Modelos &amp; Manuais</span>
              <span className={styles.statValueText}>Acessar &rarr;</span>
            </div>
          </Card>
        </Link>

        <Card className={styles.statCard} padding="md">
          <div className={`${styles.statIcon} ${styles.iconYellow}`}>
            <FiAlertCircle size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Docs Pendentes</span>
            <span className={styles.statValue}>-</span>
          </div>
        </Card>

        <Link to="/osc/mensagens" className={styles.noUnderline}>
          <Card className={styles.statCard} padding="md">
            <div className={`${styles.statIcon} ${styles.iconGreen}`}>
              <FiMessageSquare size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Suporte Governança</span>
              <span className={styles.statValueText}>Contatar &rarr;</span>
            </div>
          </Card>
        </Link>
      </div>

      {/* GRÁFICOS */}
      <div className={styles.chartsSection}>
        <ReportCharts role="OSC" />
      </div>

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