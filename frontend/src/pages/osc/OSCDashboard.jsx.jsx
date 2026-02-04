import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { Link, useNavigate } from 'react-router-dom';
import styles from './OSCDashboard.module.css';

// Ícones para os Cards
const FileIcon = () => (
  <svg className={styles.cardIconBlue} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
const FolderWarningIcon = () => (
  <svg className={styles.cardIconYellow} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
  </svg>
);
const MsgIcon = () => (
  <svg className={styles.cardIconGreen} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);
const InfoIcon = () => (
  <svg className={styles.infoIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function OSCDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // --- Lógica de Cronologia ---
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // 1-12
  const currentDay = today.getDate();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const yearsAvailable = [currentYear, currentYear - 1, currentYear - 2];

  // Determina o status visual de cada mês conforme as regras de negócio
  const getMonthConfig = (index) => {
    const monthNum = index + 1;
    
    // Regra para anos anteriores: Tudo o que não está 'Concluso' é 'Atraso'
    if (selectedYear < currentYear) {
      return { status: 'ATRASO', class: styles.statusAtraso };
    }

    // Regra para o ano vigente (Ex: 2026)
    if (selectedYear === currentYear) {
      if (monthNum < currentMonth) {
        // Se o dia atual for maior que 10, o mês anterior não enviado vira atraso
        if (monthNum === currentMonth - 1 && currentDay <= 10) {
           return { status: 'ABERTO', class: styles.statusAberto };
        }
        return { status: 'ATRASO', class: styles.statusAtraso };
      }
      
      if (monthNum === currentMonth) {
        return { status: 'ABERTO', class: styles.statusAberto };
      }

      return { status: '-', class: styles.statusFuturo };
    }

    return { status: '-', class: '' };
  };

  const months = [
    { name: 'Jan' }, { name: 'Fev' }, { name: 'Mar' }, { name: 'Abr' },
    { name: 'Mai' }, { name: 'Jun' }, { name: 'Jul' }, { name: 'Ago' },
    { name: 'Set' }, { name: 'Out' }, { name: 'Nov' }, { name: 'Dez' }
  ].map((m, index) => ({
    ...m,
    ...getMonthConfig(index)
  }));

  const handleMonthClick = (monthIndex) => {
    // Redireciona para gerenciar documentos do mês/ano específicos
    navigate(`/osc/documentos?month=${monthIndex + 1}&year=${selectedYear}`);
  };

  return (
    <div className={styles.container}>
      
      {/* 1. Área de Boas Vindas */}
      <div className={styles.welcomeSection}>
        <div className={styles.welcomeHeader}>
          <img src="/logo_portal.png" alt="Logo" className={styles.welcomeLogo} />
          <div>
            <h1 className={styles.welcomeTitle}>Bem vindo(a), {user?.name || 'OSC'}!</h1>
            <p className={styles.welcomeSubtitle}>Aqui você encontra os pilares para o sucesso da sua Organização Social.</p>
          </div>
        </div>
      </div>

      {/* 2. Cards de Resumo */}
      <div className={styles.statsGrid}>
        <div className={styles.card}>
          <div className={styles.iconCircleBlue}><FileIcon /></div>
          <div className={styles.cardContent}>
            <div className={styles.labelWithInfo}>
              <span className={styles.cardLabel}>Docs | Modelos</span>
              <div className={styles.tooltipContainer}>
                <InfoIcon />
                <span className={styles.tooltipText}>Instruções e modelos de documentos para envio contábil.</span>
              </div>
            </div>
            <strong className={styles.cardValueText}>Planilha Formato Base</strong>
          </div>
          <button className={styles.downloadBtn}>↓</button>
        </div>

        <div className={styles.card}>
          <div className={styles.iconCircleYellow}><FolderWarningIcon /></div>
          <div className={styles.cardContent}>
            <div className={styles.labelWithInfo}>
              <span className={styles.cardLabel}>Docs. Pendentes</span>
              <div className={styles.tooltipContainer}>
                <InfoIcon />
                <span className={styles.tooltipText}>Total de arquivos obrigatórios pendentes no período selecionado.</span>
              </div>
            </div>
            <strong className={styles.cardValue}>4</strong>
          </div>
        </div>

        <Link to="/osc/mensagens" className={styles.card} style={{ textDecoration: 'none' }}>
          <div className={styles.iconCircleGreen}><MsgIcon /></div>
          <div className={styles.cardContent}>
            <div className={styles.labelWithInfo}>
              <span className={styles.cardLabel}>Suporte Governança</span>
              <div className={styles.tooltipContainer}>
                <InfoIcon />
                <span className={styles.tooltipText}>Canal direto de suporte sobre governança e contabilidade.</span>
              </div>
            </div>
            <strong className={styles.cardValueText}>Contatar Equipe</strong>
          </div>
        </Link>
      </div>

      {/* 3. PAINEL DE CONTABILIDADE (CALENDÁRIO) */}
      <div className={styles.calendarSection}>
        <div className={styles.calendarHeaderRow}>
          <div className={styles.calendarTitleGroup}>
            <h2 className={styles.calendarTitle}>Painel de Contabilidade</h2>
            <select 
              className={styles.yearSelector}
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
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
            <div 
              key={index} 
              className={`${styles.monthCard} ${m.class}`}
              onClick={() => m.status !== '-' && handleMonthClick(index)}
              style={{ cursor: m.status !== '-' ? 'pointer' : 'default' }}
            >
              <span className={styles.monthName}>{m.name}</span>
              <span className={styles.monthStatus}>{m.status}</span>
              {m.status === 'ATRASO' && <span className={styles.retroactiveLabel}>Retroativo</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}