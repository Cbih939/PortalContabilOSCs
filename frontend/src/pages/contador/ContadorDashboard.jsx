import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
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

// Ícone de Informação Local
const InfoIcon = () => (
  <svg 
    style={{ width: '14px', height: '14px', color: '#EC6D12', cursor: 'help', marginLeft: '6px' }} 
    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const COLORS = ['#EC6D12', '#1f2937', '#6b7280', '#eab308'];

export default function ContadorDashboard() {
  const [stats, setStats] = useState({ activeOSCs: 0, pendingDocs: 0, unreadMessages: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [oscsMissingDocs, setOscsMissingDocs] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const addNotification = useNotification();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, activityResponse] = await Promise.all([
          contadorService.getDashboardStats(),
          contadorService.getRecentActivity(),
        ]);

        setStats(statsResponse.data);
        setRecentActivity(activityResponse.data);

        setOscsMissingDocs([
          { id: 1, name: 'Associação Vida Ativa', missing: 'Estatuto Social, Ata 2025' },
          { id: 2, name: 'Instituto Esperança', missing: 'Certidões Negativas, Ata de Eleição' },
          { id: 3, name: 'Centro Comunitário Sol', missing: 'Relatório de Atividades, Balancete' },
          { id: 4, name: 'ONG Verde Mar', missing: 'Comprovante de Endereço' },
          { id: 5, name: 'Fundação Cultural', missing: 'RG dos Diretores' }
        ]);

        setChartData([
          { name: 'Seg', envios: 4 },
          { name: 'Ter', envios: 7 },
          { name: 'Qua', envios: 5 },
          { name: 'Qui', envios: 12 },
          { name: 'Sex', envios: statsResponse.data.pendingDocs || 0 },
        ]);
      } catch (err) {
        setError('Erro ao carregar dashboard');
        addNotification('Erro ao carregar dados', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [addNotification]);

  const handleDownloadPDF = async () => {
    const element = document.querySelector(`.${styles.pageContainer}`);
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });

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

    pdf.save(`relatorio-analitico-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const pieData = [
    { name: 'Documentos', value: stats.pendingDocs },
    { name: 'Mensagens', value: stats.unreadMessages },
    { name: 'OSCs Ativas', value: stats.activeOSCs },
  ];

  if (error) return <div>{error}</div>;
  if (isLoading) return <Spinner text="Carregando dashboard..." />;

  return (
    <div className={styles.pageContainer}>
      {/* Cabeçalho exclusivo do PDF */}
      <div className={styles.printOnlyHeader}>
        <img src="/logo_portal.png" alt="Logo" className={styles.printLogo} />
        <div>
          <h1>Relatório Analítico de Gestão</h1>
          <p>Gerado em: {formatDateTime(new Date())}</p>
        </div>
      </div>

      <div className={styles.topActions}>
          <div className={styles.tooltipContainer}>
            <button onClick={handleDownloadPDF} className={`${styles.downloadReportBtn} ${styles.noPrint}`}>
              <DownloadIcon /> Baixar Relatório (PDF)
            </button>
            <span className={styles.tooltipText}>
              Gera um documento consolidado em PDF contendo todos os gráficos e tabelas deste painel para fins de auditoria ou apresentação.
            </span>
          </div>
      </div>

      <div className={styles.headerWithInfo}>
        <h2 className={styles.title}>Painel de Controle Analítico</h2>
        <div className={styles.tooltipContainer}>
          <InfoIcon />
          <span className={styles.tooltipText}>
            Visão geral em tempo real da conformidade documental e fluxo de comunicação de todas as OSCs sob sua responsabilidade.
          </span>
        </div>
      </div>

      {/* KPIs */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <BuildingIcon /> <strong>OSCs Ativas:</strong> {stats.activeOSCs}
        </div>
        <div className={styles.statCard}>
          <FolderIcon /> <strong>Docs Pendentes:</strong> {stats.pendingDocs}
        </div>
        <div className={styles.statCard}>
          <MessageIcon /> <strong>Mensagens:</strong> {stats.unreadMessages}
        </div>
      </div>

      <div className={styles.chartsGrid}>
        {/* GRÁFICOS */}
        <div className={styles.sectionCard}>
          <div className={styles.headerWithInfo}>
            <h3>Volume de Envios (Semanal)</h3>
            <div className={styles.tooltipContainer}>
              <InfoIcon />
              <span className={styles.tooltipText}>
                Métrica de produtividade que mostra a quantidade de documentos submetidos pelas OSCs nos últimos 5 dias úteis.
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="envios" fill="#EC6D12" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.sectionCard}>
          <div className={styles.headerWithInfo}>
            <h3>Distribuição de Demandas</h3>
            <div className={styles.tooltipContainer}>
              <InfoIcon />
              <span className={styles.tooltipText}>
                Proporção atual entre documentos aguardando análise, mensagens não lidas e volume de clientes ativos.
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} dataKey="value" outerRadius={100}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TABELAS */}
      <div className={styles.sectionCard}>
        <div className={styles.headerWithInfo}>
          <h3>Documentos em Falta / OSCs com Pendências</h3>
          <div className={styles.tooltipContainer}>
            <InfoIcon />
            <span className={styles.tooltipText}>
              Lista crítica de organizações que possuem documentos obrigatórios vencidos ou não enviados, impedindo a conformidade contábil.
            </span>
          </div>
        </div>
        <table className={styles.missingTable}>
          <thead>
            <tr>
              <th>OSC</th>
              <th>Pendências</th>
            </tr>
          </thead>
          <tbody>
            {oscsMissingDocs.map(osc => (
              <tr key={osc.id}>
                <td>{osc.name}</td>
                <td>{osc.missing}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.sectionCard}>
        <div className={styles.headerWithInfo}>
          <h3>Fluxo de Atividades Recentes</h3>
          <div className={styles.tooltipContainer}>
            <InfoIcon />
            <span className={styles.tooltipText}>
              Log cronológico das últimas interações, incluindo uploads de documentos e novas mensagens recebidas.
            </span>
          </div>
        </div>
        <div className={styles.activityList}>
          {recentActivity.map(item => (
            <div key={item.id} className={styles.activityItem}>
              <strong>{item.oscName}</strong> — {item.content}
              <br />
              <small>{formatDateTime(item.timestamp)}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}