import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api.js'; 
import styles from './OSCDashboard.module.css';

const FileIcon = () => (<svg className={styles.cardIconBlue} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>);
const FolderWarningIcon = () => (<svg className={styles.cardIconYellow} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" /></svg>);
const MsgIcon = () => (<svg className={styles.cardIconGreen} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>);
const InfoIcon = () => (<svg className={styles.infoIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const ShieldCheckIcon = () => (<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>);
const ShieldAlertIcon = () => (<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" /></svg>);
const ExternalLinkIcon = () => (<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{marginLeft: '4px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>);

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

  // --- LÓGICA CORRIGIDA DO ESCUDO DE GOVERNANÇA ---
  let governanceStatus = { type: 'UNKNOWN', text: 'Cadastre os membros da diretoria para monitorar o mandato.', color: '#6b7280', bg: '#f3f4f6', icon: <ShieldAlertIcon /> };
  
  const activeMembers = boardMembers.filter(m => m.status === 'ATIVO');

  if (activeMembers.length > 0) {
    let mandateEnd = null;
    const president = activeMembers.find(m => m.role.toLowerCase() === 'presidente');
    
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
        governanceStatus = { type: 'EXPIRED', text: `ATENÇÃO: O mandato da diretoria expirou há ${Math.abs(daysLeft)} dias! Atualize a documentação estatutária.`, color: '#991b1b', bg: '#fef2f2', border: '#fca5a5', icon: <ShieldAlertIcon /> };
      } else if (daysLeft <= 60) {
        governanceStatus = { type: 'WARNING', text: `ALERTA: O mandato expira em ${daysLeft} dias. Prepare a assembleia de eleição.`, color: '#9a3412', bg: '#fff7ed', border: '#fdba74', icon: <ShieldAlertIcon /> };
      } else {
        governanceStatus = { type: 'OK', text: `Governança em dia. Mandato da diretoria válido por mais ${daysLeft} dias.`, color: '#065f46', bg: '#ecfdf5', border: '#6ee7b7', icon: <ShieldCheckIcon /> };
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

  // Extrair o Estado (UF) e Cidade (Ignorando case e espaços)
  const oscState = oscData?.estado || oscData?.uf || '';
  const oscCity = oscData?.cidade || oscData?.municipio || '';

  // Filtra os Links Mágicos baseados na morada da OSC
  const linksFederais = officialLinks.filter(l => l.type === 'FEDERAL');
  const linksEstaduais = officialLinks.filter(l => l.type === 'ESTADUAL' && l.state?.toUpperCase() === oscState.toUpperCase());
  const linksMunicipais = officialLinks.filter(l => l.type === 'MUNICIPAL' && l.state?.toUpperCase() === oscState.toUpperCase() && l.city?.toLowerCase().trim() === oscCity.toLowerCase().trim());

  return (
    <div className={styles.container}>
      
      {/* Bem Vindos e Botões de Ação Topo */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }} className={styles.welcomeSection}>
        <div className={styles.welcomeHeader} style={{ flex: 1 }}>
          <img src="/logo_portal.png" alt="Logo" className={styles.welcomeLogo} />
          <div>
            <h1 className={styles.welcomeTitle}>Bem vindo(a), {user?.name || 'Organização'}!</h1>
            <p className={styles.welcomeSubtitle}>Aqui você encontra os pilares para o sucesso da sua Instituição.</p>
          </div>
        </div>

        <button 
          onClick={() => setShowCertificadosModal(true)}
          style={{ backgroundColor: '#059669', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.2)' }}
        >
          <ShieldCheckIcon />
          Acesso às Certificadoras
        </button>
      </div>

      {/* Escudo de Governança */}
      <Link to="/osc/governanca" style={{ textDecoration: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', backgroundColor: governanceStatus.bg, border: `1px solid ${governanceStatus.border || '#d1d5db'}`, borderRadius: '8px', marginBottom: '24px', color: governanceStatus.color, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'transform 0.2s', cursor: 'pointer' }}>
          <div style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '50%' }}>{governanceStatus.icon}</div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold' }}>Escudo de Governança</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>{governanceStatus.text}</p>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 'bold', textDecoration: 'underline' }}>Atualizar Diretoria &rarr;</span>
        </div>
      </Link>

      {/* Cards */}
      <div className={styles.statsGrid}>
        <Link to="/osc/modelos" className={styles.card} style={{ textDecoration: 'none' }}>
          <div className={styles.iconCircleBlue}><FileIcon /></div>
          <div className={styles.cardContent}>
            <div className={styles.labelWithInfo}>
              <span className={styles.cardLabel}>Docs | Modelos</span>
              <div className={styles.tooltipContainer}>
                <InfoIcon /><span className={styles.tooltipText}>Instruções e modelos para envio contábil.</span>
              </div>
            </div>
            <strong className={styles.cardValueText}>Acessar Modelos</strong>
          </div>
          <button className={styles.downloadBtn}>&rarr;</button>
        </Link>

        <div className={styles.card}>
          <div className={styles.iconCircleYellow}><FolderWarningIcon /></div>
          <div className={styles.cardContent}>
            <div className={styles.labelWithInfo}>
              <span className={styles.cardLabel}>Docs. Pendentes</span>
              <div className={styles.tooltipContainer}>
                <InfoIcon /><span className={styles.tooltipText}>Acesse a aba 'Meus Documentos' para regularizar.</span>
              </div>
            </div>
            <strong className={styles.cardValue}>-</strong>
          </div>
        </div>

        <Link to="/osc/mensagens" className={styles.card} style={{ textDecoration: 'none' }}>
          <div className={styles.iconCircleGreen}><MsgIcon /></div>
          <div className={styles.cardContent}>
            <div className={styles.labelWithInfo}>
              <span className={styles.cardLabel}>Suporte Governança</span>
              <div className={styles.tooltipContainer}>
                <InfoIcon /><span className={styles.tooltipText}>Canal direto de suporte sobre governança.</span>
              </div>
            </div>
            <strong className={styles.cardValueText}>Contatar Equipe</strong>
          </div>
        </Link>
      </div>

      {/* Painel de Contabilidade */}
      <div className={styles.calendarSection}>
        <div className={styles.calendarHeaderRow}>
          <div className={styles.calendarTitleGroup}>
            <h2 className={styles.calendarTitle}>Painel de Contabilidade</h2>
            <select className={styles.yearSelector} value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
              {yearsAvailable.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className={styles.legendGrid}>
            <span className={styles.legendItem}><i className={styles.bgRed}></i> Atraso</span>
            <span className={styles.legendItem}><i className={styles.bgYellow}></i> Aberto</span>
            <span className={styles.legendItem}><i className={styles.bgBlue}></i> Enviado</span>
            <span className={styles.legendItem}><i className={styles.bgGreen}></i> Concluso</span>
          </div>
        </div>

        <div className={styles.monthsGrid}>
          {months.map((m, index) => (
            <div key={index} className={`${styles.monthCard} ${m.class}`} onClick={() => handleMonthClick(m, index)} style={{ cursor: m.isBlocked || m.status === '-' ? 'default' : 'pointer', opacity: m.isBlocked ? 0.3 : 1 }} title={m.isBlocked ? "Mês anterior à criação da OSC" : ""}>
              <span className={styles.monthName}>{m.name}</span>
              <span className={styles.monthStatus}>{m.isBlocked ? 'INATIVO' : m.status}</span>
              {m.status === 'ATRASO' && !m.isBlocked && <span className={styles.retroactiveLabel}>Retroativo</span>}
            </div>
          ))}
        </div>
      </div>

      {/* --- MODAL DE ACESSO ÀS CERTIFICADORAS --- */}
      {showCertificadosModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', padding: '0', borderRadius: '12px', width: '100%', maxWidth: '600px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            
            {/* Header do Modal */}
            <div style={{ padding: '20px 30px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, color: '#1f2937', fontSize: '20px' }}>
                <ShieldCheckIcon /> Acesso Rápido às Certificadoras
              </h2>
              <p style={{ color: '#6b7280', fontSize: '13px', margin: '5px 0 0 0' }}>
                Acesse rapidamente os portais oficiais de emissão de certidões correspondentes à sua região ({oscCity ? `${oscCity} - ` : ''}{oscState || 'Brasil'}).
              </p>
            </div>

            {/* Conteúdo com Scroll */}
            <div style={{ padding: '30px', overflowY: 'auto' }}>
              
              <h3 style={{ fontSize: '15px', color: '#111827', borderBottom: '2px solid #bbf7d0', paddingBottom: '5px', marginBottom: '15px', marginTop: 0 }}>
                Links Oficiais de Emissão (Sefaz / Prefeituras)
              </h3>

              {/* Links Federais */}
              {linksFederais.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  {linksFederais.map(l => (
                    <a key={l.id} href={l.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#166534', textDecoration: 'none', marginBottom: '8px', fontSize: '14px', fontWeight: '500', transition: 'transform 0.1s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                      {l.title} <ExternalLinkIcon />
                    </a>
                  ))}
                </div>
              )}

              {/* Links Estaduais */}
              {linksEstaduais.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  {linksEstaduais.map(l => (
                    <a key={l.id} href={l.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', color: '#0369a1', textDecoration: 'none', marginBottom: '8px', fontSize: '14px', fontWeight: '500', transition: 'transform 0.1s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                      {l.title} <ExternalLinkIcon />
                    </a>
                  ))}
                </div>
              )}

              {/* Links Municipais */}
              {linksMunicipais.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  {linksMunicipais.map(l => (
                    <a key={l.id} href={l.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '8px', color: '#7e22ce', textDecoration: 'none', marginBottom: '8px', fontSize: '14px', fontWeight: '500', transition: 'transform 0.1s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                      {l.title} <ExternalLinkIcon />
                    </a>
                  ))}
                </div>
              )}

              {(linksFederais.length === 0 && linksEstaduais.length === 0 && linksMunicipais.length === 0) && (
                <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px dashed #d1d5db' }}>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>A sua contabilidade ainda não disponibilizou links rápidos para a sua região.</p>
                </div>
              )}

            </div>

            {/* Footer do Modal */}
            <div style={{ padding: '20px 30px', borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb', textAlign: 'right' }}>
              <button onClick={() => setShowCertificadosModal(false)} style={{ padding: '10px 20px', backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#374151', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}