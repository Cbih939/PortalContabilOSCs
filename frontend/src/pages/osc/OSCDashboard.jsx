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

export default function OSCDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [oscData, setOscData] = useState(null);
  const [showCertificadosModal, setShowCertificadosModal] = useState(false);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; 
  const currentDay = today.getDate();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const yearsAvailable = [currentYear, currentYear - 1, currentYear - 2];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/oscs/me');
        setOscData(response.data.osc || response.data[0] || response.data);
      } catch (error) {
        console.error("Erro ao buscar dados da OSC", error);
      }
    };
    fetchProfile();
  }, []);

  let governanceStatus = { type: 'UNKNOWN', text: 'Cadastre o fim do mandato no Perfil', color: '#6b7280', bg: '#f3f4f6', icon: <ShieldAlertIcon /> };
  
  if (oscData?.fim_mandato) {
    const mandateEnd = new Date(oscData.fim_mandato);
    const diffTime = mandateEnd - today;
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      governanceStatus = { type: 'EXPIRED', text: `ATENÇÃO: Mandato expirou há ${Math.abs(daysLeft)} dias! Atualize a documentação estatutária no setor de governança para ficar com todos os seus documentos em dias.`, color: '#991b1b', bg: '#fef2f2', border: '#fca5a5', icon: <ShieldAlertIcon /> };
    } else if (daysLeft <= 60) {
      governanceStatus = { type: 'WARNING', text: `ALERTA: O mandato expira em ${daysLeft} dias. Prepare a assembleia de eleição.`, color: '#9a3412', bg: '#fff7ed', border: '#fdba74', icon: <ShieldAlertIcon /> };
    } else {
      governanceStatus = { type: 'OK', text: `Governança em dia. Mandato válido por mais ${daysLeft} dias.`, color: '#065f46', bg: '#ecfdf5', border: '#6ee7b7', icon: <ShieldCheckIcon /> };
    }
  }

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

        {/* --- NOVO BOTÃO DE CERTIFICADOS --- */}
        <button 
          onClick={() => setShowCertificadosModal(true)}
          style={{ backgroundColor: '#059669', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.2)' }}
        >
          <ShieldCheckIcon />
          Certificados de Regularidade
        </button>
      </div>

      {/* Escudo de Governança */}
      <Link to="/osc/perfil" style={{ textDecoration: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', backgroundColor: governanceStatus.bg, border: `1px solid ${governanceStatus.border || '#d1d5db'}`, borderRadius: '8px', marginBottom: '24px', color: governanceStatus.color, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'transform 0.2s', cursor: 'pointer' }}>
          <div style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '50%' }}>{governanceStatus.icon}</div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold' }}>Escudo de Governança</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>{governanceStatus.text}</p>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 'bold', textDecoration: 'underline' }}>Atualizar Perfil &rarr;</span>
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
                <InfoIcon /><span className={styles.tooltipText}>Instruções e modelos de documentos para envio contábil.</span>
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
                <InfoIcon /><span className={styles.tooltipText}>Canal direto de suporte sobre governança e contabilidade.</span>
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

      {/* --- MODAL DE CERTIFICADOS DIGITAIS --- */}
      {showCertificadosModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '550px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: 0, color: '#1f2937', fontSize: '20px' }}>
              <ShieldCheckIcon /> Certidões de Regularidade
            </h2>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '25px', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px' }}>
              {oscData?.name || oscData?.razao_social || 'Sua Organização'} <br/>
              <strong>Ano Calendário: {new Date().getFullYear()}</strong>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {/* Bloco Federal */}
              <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ display: 'block', color: '#1f2937', fontSize: '15px' }}>Âmbito Federal</strong>
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>Certidão Conjunta Receita Federal</span>
                </div>
                {oscData?.cert_federal ? (
                  <a href={oscData.cert_federal} target="_blank" rel="noreferrer" style={{ padding: '8px 14px', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold' }}>Visualizar Certidão</a>
                ) : (
                  <span style={{ fontSize: '13px', color: '#dc2626', fontWeight: 'bold', backgroundColor: '#fef2f2', padding: '6px 12px', borderRadius: '6px' }}>Pendente</span>
                )}
              </div>

              {/* Bloco Estadual */}
              <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ display: 'block', color: '#1f2937', fontSize: '15px' }}>Âmbito Estadual</strong>
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>Secretaria da Fazenda (Sefaz)</span>
                </div>
                {oscData?.cert_estadual ? (
                  <a href={oscData.cert_estadual} target="_blank" rel="noreferrer" style={{ padding: '8px 14px', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold' }}>Visualizar Certidão</a>
                ) : (
                  <span style={{ fontSize: '13px', color: '#dc2626', fontWeight: 'bold', backgroundColor: '#fef2f2', padding: '6px 12px', borderRadius: '6px' }}>Pendente</span>
                )}
              </div>

              {/* Bloco Municipal */}
              <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ display: 'block', color: '#1f2937', fontSize: '15px' }}>Âmbito Municipal</strong>
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>Prefeitura Municipal</span>
                </div>
                {oscData?.cert_municipal ? (
                  <a href={oscData.cert_municipal} target="_blank" rel="noreferrer" style={{ padding: '8px 14px', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold' }}>Visualizar Certidão</a>
                ) : (
                  <span style={{ fontSize: '13px', color: '#dc2626', fontWeight: 'bold', backgroundColor: '#fef2f2', padding: '6px 12px', borderRadius: '6px' }}>Pendente</span>
                )}
              </div>
            </div>

            <div style={{ marginTop: '25px', textAlign: 'right' }}>
              <button onClick={() => setShowCertificadosModal(false)} style={{ padding: '10px 20px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#374151' }}>
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}