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

  // Dados Mockados para o visual
  const recentActivities = [
    { id: 1, text: 'OSC Esperança enviou um arquivo "Liderança_Nexialista.pdf"', date: '17/12/2025, 09:09' },
    { id: 2, text: 'OSC Esperança enviou o arquivo "Ebook 10 Receitas.pdf"', date: '24/10/2025, 19:06' },
    { id: 3, text: 'OSC Esperança enviou o arquivo "download.jpg"', date: '24/10/2025, 19:05' },
    { id: 4, text: 'OSC Esperança enviou o arquivo "Relatório Anual.pdf"', date: '24/10/2025, 15:48' },
  ];

  return (
    <div className={styles.container}>
      
      {/* 1. Área de Boas Vindas com Logo */}
      <div className={styles.welcomeSection}>
        <div className={styles.logoCircle}>
          <img src="/logo_portal.png" alt="Logo" className={styles.logoImg} />
        </div>
        <div>
          <h1 className={styles.welcomeTitle}>Bem vindo(a) ao aplicativo CONTA COMIGO, {user?.name || 'OSC'}!</h1>
          <p className={styles.welcomeSubtitle}>Aqui você encontra os 3 pilares que tornarão possível o sucesso da sua Organização Social: Governança, Contabilidade e Comunicação Institucional. Conta comigo para manter a documentação em dia e tornar a captação dos recursos um verdadeiro sucesso, ampliando o seu impacto social.</p>
        </div>
      </div>

      {/* 2. Cards de Resumo (Stats) */}
      <div className={styles.statsGrid}>
        
        {/* Card 1: Modelo Download */}
        <div className={styles.card}>
          <div className={styles.iconCircleBlue}><FileIcon /></div>
          <div className={styles.cardContent}>
            <span className={styles.cardLabel}>Documentos e Modelos</span>
            <strong className={styles.cardValueText}>Planilha Formato Base</strong>
            <span className={styles.cardSubtext}>planilha-formato-base.xlsx</span>
          </div>
          <button className={styles.downloadBtn}>↓</button>
        </div>

        {/* Card 2: Docs Pendentes */}
        <div className={styles.card}>
          <div className={styles.iconCircleYellow}><FolderWarningIcon /></div>
          <div className={styles.cardContent}>
            <span className={styles.cardLabel}>Documentos Pendentes</span>
            <strong className={styles.cardValue}>4</strong>
          </div>
        </div>

        {/* Card 3: Mensagens */}
        <div className={styles.card}>
          <div className={styles.iconCircleGreen}><MsgIcon /></div>
          <div className={styles.cardContent}>
            <span className={styles.cardLabel}>Alerta de mensagens não lidas</span>
            <strong className={styles.cardValue}>3</strong>
          </div>
        </div>
      </div>

      {/* 3. Área Inferior: Ações e Histórico */}
      <div className={styles.bottomGrid}>
        
        

      </div>
    </div>
  );
}