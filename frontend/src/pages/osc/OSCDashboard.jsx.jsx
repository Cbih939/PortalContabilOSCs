import React from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { Link } from 'react-router-dom';
import styles from './OSCDashboard.module.css';

// Ícones para os Cards
const FileIcon = () => (
  <svg className={styles.cardIconBlue} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
);
const FolderWarningIcon = () => (
  <svg className={styles.cardIconYellow} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" /></svg>
);
const MsgIcon = () => (
  <svg className={styles.cardIconGreen} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
);

export default function OSCDashboard() {
  const { user } = useAuth();

  const months = [
    { name: 'Jan', status: 'ENVIADO', class: styles.statusEnviado },
    { name: 'Fev', status: '-', class: '' },
    { name: 'Mar', status: '-', class: '' },
    { name: 'Abr', status: '-', class: '' },
    { name: 'Mai', status: '-', class: '' },
    { name: 'Jun', status: '-', class: '' },
    { name: 'Jul', status: '-', class: '' },
    { name: 'Ago', status: '-', class: '' },
    { name: 'Set', status: '-', class: '' },
    { name: 'Out', status: '-', class: '' },
    { name: 'Nov', status: '-', class: '' },
    { name: 'Dez', status: '-', class: '' },
  ];

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
            <span className={styles.cardLabel}>Docs | Modelos</span>
            <strong className={styles.cardValueText}>Planilha Formato Base</strong>
          </div>
          <button className={styles.downloadBtn}>↓</button>
        </div>

        <div className={styles.card}>
          <div className={styles.iconCircleYellow}><FolderWarningIcon /></div>
          <div className={styles.cardContent}>
            <span className={styles.cardLabel}>Docs. Pendentes</span>
            <strong className={styles.cardValue}>4</strong>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.iconCircleGreen}><MsgIcon /></div>
          <div className={styles.cardContent}>
            <span className={styles.cardLabel}>Mensagens</span>
            <strong className={styles.cardValue}>3</strong>
          </div>
        </div>
      </div>

      {/* 3. CALENDÁRIO DE SITUAÇÃO (NOVO) */}
      <div className={styles.calendarSection}>
        <div className={styles.calendarHeader}>
          <h2 className={styles.calendarTitle}>Sua Situação em 2026</h2>
          <div className={styles.legendGrid}>
            <span className={styles.legendItem}><i className={styles.bgRed}></i> Atraso</span>
            <span className={styles.legendItem}><i className={styles.bgYellow}></i> Aberto</span>
            <span className={styles.legendItem}><i className={styles.bgBlue}></i> Enviado</span>
            <span className={styles.legendItem}><i className={styles.bgGreen}></i> Concluso</span>
          </div>
        </div>

        <div className={styles.monthsGrid}>
          {months.map((m, index) => (
            <div key={index} className={`${styles.monthCard} ${m.class}`}>
              <span className={styles.monthName}>{m.name}</span>
              <span className={styles.monthStatus}>{m.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}