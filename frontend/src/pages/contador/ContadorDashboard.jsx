import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BuildingIcon, FolderIcon, MessageIcon, DownloadIcon
} from '../../components/common/Icons.jsx';
import * as contadorService from '../../services/contadorService.js';
import { formatDateTime } from '../../utils/formatDate.js';
import styles from './ContadorDashboard.module.css';
import Spinner from '../../components/common/Spinner.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Ícones Adicionais
const InfoIcon = () => (
  <svg style={{ width: '14px', height: '14px', color: '#EC6D12', cursor: 'help', marginLeft: '6px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const AlertTriangleIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
);
const ArrowRightIcon = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>;
const UserIcon = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;

export default function ContadorDashboard() {
  const navigate = useNavigate();
  const addNotification = useNotification();

  const [stats, setStats] = useState({ activeOSCs: 0, pendingDocs: 0, unreadMessages: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [oscsMissingDocs, setOscsMissingDocs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, activityResponse] = await Promise.all([
          contadorService.getDashboardStats(),
          contadorService.getRecentActivity(),
        ]);

        const data = statsResponse.data;
        setStats({
          activeOSCs: data.activeOSCs || 0,
          pendingDocs: data.pendingDocs || 0,
          unreadMessages: data.unreadMessages || 0
        });

        setRecentActivity(activityResponse.data || []);
        setOscsMissingDocs(data.missingDocsList || []);

      } catch (err) {
        setError('Erro ao carregar dashboard');
        addNotification('Erro ao conectar com o servidor.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [addNotification]);

  const handleDownloadPDF = async () => {
    const element = document.querySelector(`.${styles.pageContainer}`);
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgHeight = (canvas.height * pdf.internal.pageSize.getWidth()) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), imgHeight);
    pdf.save(`relatorio-escritorio-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  if (error) return <div style={{ padding: '40px', textAlign: 'center', color: '#dc2626' }}>{error}</div>;
  if (isLoading) return <Spinner text="Analisando dados do escritório..." />;

  return (
    <div className={styles.pageContainer}>
      
      {/* Cabeçalho exclusivo do PDF */}
      <div className={styles.printOnlyHeader}>
        <img src="/logo_portal.png" alt="Logo" className={styles.printLogo} />
        <div>
          <h1>Relatório de Conformidade do Escritório</h1>
          <p>Gerado em: {formatDateTime(new Date())}</p>
        </div>
      </div>

      <div className={styles.topActions}>
          <div className={styles.tooltipContainer}>
            <button onClick={handleDownloadPDF} className={`${styles.downloadReportBtn} ${styles.noPrint}`}>
              <DownloadIcon /> Baixar Relatório (PDF)
            </button>
            <span className={styles.tooltipText}>Gera um documento em PDF do painel atual para impressão.</span>
          </div>
      </div>

      <div className={styles.headerWithInfo}>
        <h2 className={styles.title}>Painel Operacional do Escritório</h2>
        <div className={styles.tooltipContainer}>
          <InfoIcon />
          <span className={styles.tooltipText}>Central de ação rápida focada nas pendências documentais da sua carteira.</span>
        </div>
      </div>

      {/* KPIs Corrigidos */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <BuildingIcon /> <strong>OSCs Ativas:</strong> {stats.activeOSCs}
        </div>
        <div className={styles.statCard} style={{ backgroundColor: stats.pendingDocs > 0 ? '#fff7ed' : '#fff', borderColor: stats.pendingDocs > 0 ? '#fdba74' : '#e5e7eb' }}>
          <FolderIcon /> <strong>Docs Aguardando Validação:</strong> <span style={{ color: stats.pendingDocs > 0 ? '#ea580c' : 'inherit' }}>{stats.pendingDocs}</span>
        </div>
        <div className={styles.statCard} style={{ backgroundColor: stats.unreadMessages > 0 ? '#f0fdf4' : '#fff', borderColor: stats.unreadMessages > 0 ? '#86efac' : '#e5e7eb' }}>
          <MessageIcon /> <strong>Mensagens não Lidas:</strong> <span style={{ color: stats.unreadMessages > 0 ? '#16a34a' : 'inherit' }}>{stats.unreadMessages}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginTop: '32px' }}>
        
        {/* Tabela de Ação Focada */}
        <div className={styles.sectionCard}>
          <div className={styles.headerWithInfo}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangleIcon /> Tabela de Ação: OSCs com Pendências
            </h3>
            <div className={styles.tooltipContainer}>
              <InfoIcon />
              <span className={styles.tooltipText}>Lista as OSCs que têm meses em atraso ou documentos aguardando a sua validação.</span>
            </div>
          </div>
          <table className={styles.missingTable}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Organização</th>
                <th style={{ textAlign: 'left' }}>Status de Documentação</th>
                <th style={{ textAlign: 'center', width: '120px' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {oscsMissingDocs.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: '#16a34a', fontWeight: 'bold' }}>
                    🎉 Parabéns! Toda a carteira está em dia com a documentação.
                  </td>
                </tr>
              ) : (
                oscsMissingDocs.map(osc => (
                  <tr key={osc.id}>
                    <td style={{ fontWeight: 'bold', color: '#1f2937' }}>{osc.name}</td>
                    <td style={{ color: '#4b5563', fontSize: '13px', fontWeight: '500' }}>{osc.missing}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        onClick={() => navigate('/contador/oscs')} 
                        style={{ backgroundColor: '#ea580c', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        Validar <ArrowRightIcon />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Log de Atividades do Escritório */}
        <div className={styles.sectionCard}>
          <div className={styles.headerWithInfo}>
            <h3>Log de Atividades do Escritório</h3>
            <div className={styles.tooltipContainer}>
              <InfoIcon />
              <span className={styles.tooltipText}>Monitorize quem enviou documentos na plataforma, sejam eles membros da OSC ou Contadores do seu escritório.</span>
            </div>
          </div>
          <div className={styles.activityList}>
            {recentActivity.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#9ca3af', padding: '40px' }}>Nenhum documento registado recentemente.</p>
            ) : (
              recentActivity.map(item => (
                <div key={item.id} className={styles.activityItem} style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', transition: 'background-color 0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div style={{ color: '#1f2937', fontSize: '14px', lineHeight: '1.4' }}>
                      <strong style={{ color: '#2563eb' }}>{item.oscName}</strong> <br/> {item.content}
                    </div>
                    <span style={{ fontSize: '11px', color: '#9ca3af', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                      {formatDateTime(item.timestamp)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#ea580c', fontWeight: '600', backgroundColor: '#fff7ed', padding: '4px 8px', borderRadius: '4px', width: 'fit-content' }}>
                    <UserIcon /> Enviado por: {item.sender}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}