import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BuildingIcon, FolderIcon, MessageIcon, FileIcon, DownloadIcon
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

        // O backend agora deve enviar sender_name na atividade
        setRecentActivity(activityResponse.data || []);
        
        // Dados focados na documentação
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
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    pdf.save(`relatorio-documental-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  if (error) return <div style={{ padding: '40px', textAlign: 'center', color: '#dc2626' }}>{error}</div>;
  if (isLoading) return <Spinner text="Analisando dados do escritório..." />;

  return (
    <div className={styles.pageContainer}>
      
      {/* Cabeçalho exclusivo do PDF */}
      <div className={styles.printOnlyHeader}>
        <img src="/logo_portal.png" alt="Logo" className={styles.printLogo} />
        <div>
          <h1>Relatório Documental de Gestão</h1>
          <p>Gerado em: {formatDateTime(new Date())}</p>
        </div>
      </div>

      {/* Alerta Global de Pendências Críticas */}
      {oscsMissingDocs.length > 0 && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ color: '#dc2626' }}><AlertTriangleIcon /></div>
          <div>
            <h4 style={{ margin: 0, color: '#991b1b', fontSize: '15px' }}>Atenção: Ação Requerida</h4>
            <p style={{ margin: 0, color: '#b91c1c', fontSize: '13px' }}>Existem <strong>{oscsMissingDocs.length} organizações</strong> com pendências documentais aguardando a sua análise ou envio.</p>
          </div>
        </div>
      )}

      <div className={styles.topActions}>
          <div className={styles.tooltipContainer}>
            <button onClick={handleDownloadPDF} className={`${styles.downloadReportBtn} ${styles.noPrint}`}>
              <DownloadIcon /> Baixar Relatório (PDF)
            </button>
            <span className={styles.tooltipText}>Gera um documento em PDF do painel atual.</span>
          </div>
      </div>

      <div className={styles.headerWithInfo}>
        <h2 className={styles.title}>Painel de Gestão Documental</h2>
        <div className={styles.tooltipContainer}>
          <InfoIcon />
          <span className={styles.tooltipText}>Visão geral do calendário de documentação da carteira do escritório.</span>
        </div>
      </div>

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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginTop: '32px' }}>
        
        {/* Tabela de Ação Focada em Documentos */}
        <div className={styles.sectionCard}>
          <div className={styles.headerWithInfo}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangleIcon /> Tabela de Ação: Calendário de Documentação
            </h3>
            <div className={styles.tooltipContainer}>
              <InfoIcon />
              <span className={styles.tooltipText}>Mostra apenas OSCs com documentos pendentes de validação ou em atraso.</span>
            </div>
          </div>
          <table className={styles.missingTable}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Organização</th>
                <th style={{ textAlign: 'left' }}>Pendências de Documentação</th>
                <th style={{ textAlign: 'center' }}>Ação Rápida</th>
              </tr>
            </thead>
            <tbody>
              {oscsMissingDocs.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '30px', color: '#16a34a', fontWeight: 'bold' }}>
                    🎉 Parabéns! Todas as OSCs estão com a documentação em dia e sem pendências.
                  </td>
                </tr>
              ) : (
                oscsMissingDocs.map(osc => (
                  <tr key={osc.id}>
                    <td style={{ fontWeight: 'bold', color: '#1f2937' }}>{osc.name}</td>
                    <td style={{ color: '#dc2626', fontSize: '13px', fontWeight: '500' }}>{osc.missing}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        onClick={() => navigate('/contador/oscs')} 
                        style={{ backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        Validar Documentos <ArrowRightIcon />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Log de Atividades do Escritório (Com identificação de quem enviou) */}
        <div className={styles.sectionCard}>
          <div className={styles.headerWithInfo}>
            <h3>Log de Envio de Documentos e Atividades</h3>
          </div>
          <div className={styles.activityList}>
            {recentActivity.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>Nenhum documento enviado ou atividade registada recentemente.</p>
            ) : (
              recentActivity.map(item => (
                <div key={item.id} className={styles.activityItem} style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '12px', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <strong style={{ color: '#1f2937', fontSize: '14px' }}>{item.oscName}</strong>
                      <span style={{ color: '#4b5563', fontSize: '14px' }}> — {item.content}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                      {formatDateTime(item.timestamp)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#ea580c', fontWeight: '500' }}>
                    <UserIcon /> Enviado por: {item.sender_name || 'Usuário Desconhecido'}
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