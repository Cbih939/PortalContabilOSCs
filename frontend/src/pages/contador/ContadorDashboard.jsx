import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as contadorService from '../../services/contadorService.js';
import { formatDateTime } from '../../utils/formatDate.js';
import styles from './ContadorDashboard.module.css';
import Spinner from '../../components/common/Spinner.jsx';
import Button from '../../components/ui/Button.jsx';
import Card, { CardBody, CardHeader } from '../../components/ui/Card.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FiBriefcase, FiFolder, FiMessageSquare, FiDownload, FiInfo, FiAlertTriangle, FiArrowRight, FiUser } from 'react-icons/fi';

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

        const rawStats = statsResponse.data;
        const data = Array.isArray(rawStats) ? rawStats[0] : rawStats;

        if (data) {
          setStats({
            activeOSCs: data.activeOSCs || data.activeoscs || data.totalOscs || 0,
            pendingDocs: data.pendingDocs || data.pendingdocs || data.docsPendentes || 0,
            unreadMessages: data.unreadMessages || data.unreadmessages || data.mensagens || 0
          });
          
          setOscsMissingDocs(data.missingDocsList || data.missingdocslist || []);
        }

        const rawActivity = activityResponse.data;
        setRecentActivity(Array.isArray(rawActivity) ? rawActivity : []);

      } catch (err) {
        setError('Erro ao carregar dashboard. Verifique a conexão com o servidor.');
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

  if (error) return <div className={styles.errorState}>{error}</div>;
  if (isLoading) return <div className={styles.loadingContainer}><Spinner text="Analisando dados do escritório..." /></div>;

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

      <div className={styles.header}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.pageTitle}>Painel Operacional do Escritório</h1>
          <div className={styles.tooltipContainer}>
            <FiInfo className={styles.infoIcon} />
            <span className={styles.tooltipText}>Central de ação rápida focada nas pendências documentais da sua carteira.</span>
          </div>
        </div>
        
        <div className={styles.headerActions}>
          <div className={styles.tooltipContainer}>
            <Button 
              variant="secondary" 
              onClick={handleDownloadPDF} 
              icon={<FiDownload />}
              className={styles.noPrint}
            >
              Baixar Relatório (PDF)
            </Button>
            <span className={styles.tooltipText}>Gera um documento em PDF do painel atual para impressão.</span>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <CardBody className={styles.statBody}>
            <div className={styles.statIconWrapper} style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
              <FiBriefcase size={24} />
            </div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>OSCs Ativas</p>
              <h3 className={styles.statValue}>{stats.activeOSCs}</h3>
            </div>
          </CardBody>
        </Card>

        <Card className={styles.statCard} style={{ borderColor: stats.pendingDocs > 0 ? '#fdba74' : undefined, backgroundColor: stats.pendingDocs > 0 ? '#fff7ed' : undefined }}>
          <CardBody className={styles.statBody}>
            <div className={styles.statIconWrapper} style={{ backgroundColor: stats.pendingDocs > 0 ? '#ffedd5' : '#f3f4f6', color: stats.pendingDocs > 0 ? '#ea580c' : '#6b7280' }}>
              <FiFolder size={24} />
            </div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Docs Aguardando Validação</p>
              <h3 className={styles.statValue} style={{ color: stats.pendingDocs > 0 ? '#ea580c' : 'inherit' }}>
                {stats.pendingDocs}
              </h3>
            </div>
          </CardBody>
        </Card>

        <Card className={styles.statCard} style={{ borderColor: stats.unreadMessages > 0 ? '#86efac' : undefined, backgroundColor: stats.unreadMessages > 0 ? '#f0fdf4' : undefined }}>
          <CardBody className={styles.statBody}>
            <div className={styles.statIconWrapper} style={{ backgroundColor: stats.unreadMessages > 0 ? '#dcfce3' : '#f3f4f6', color: stats.unreadMessages > 0 ? '#16a34a' : '#6b7280' }}>
              <FiMessageSquare size={24} />
            </div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Mensagens não Lidas</p>
              <h3 className={styles.statValue} style={{ color: stats.unreadMessages > 0 ? '#16a34a' : 'inherit' }}>
                {stats.unreadMessages}
              </h3>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className={styles.grid}>
        
        {/* Tabela de Ação */}
        <div className={styles.colSpan}>
          <Card padding="none" className={styles.actionCard}>
            <CardHeader 
              title={
                <div className={styles.cardTitleGroup}>
                  <FiAlertTriangle className={styles.warningIcon} />
                  Tabela de Ação: OSCs com Pendências
                </div>
              } 
            />
            <CardBody className={styles.tableBody}>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Organização</th>
                      <th>Status de Documentação</th>
                      <th style={{ textAlign: 'center' }}>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {oscsMissingDocs.length === 0 ? (
                      <tr>
                        <td colSpan="3" className={styles.emptyTable}>
                          Nenhuma pendência crítica encontrada para validação neste momento.
                        </td>
                      </tr>
                    ) : (
                      oscsMissingDocs.map((osc, idx) => (
                        <tr key={osc.id || idx}>
                          <td className={styles.oscName}>{osc.name || osc.razao_social || 'OSC'}</td>
                          <td className={styles.oscStatus}>{osc.missing}</td>
                          <td style={{ textAlign: 'center' }}>
                            <Button 
                              onClick={() => navigate('/contador/oscs')}
                              variant="primary"
                              size="sm"
                              icon={<FiArrowRight />}
                              iconPosition="right"
                            >
                              Validar
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Log de Atividades */}
        <div className={styles.colSpan}>
          <Card padding="none">
            <CardHeader title="Log de Atividades do Escritório" />
            <CardBody className={styles.activityBody}>
              <div className={styles.activityList}>
                {recentActivity.length === 0 ? (
                  <div className={styles.emptyActivity}>Nenhum documento registrado recentemente.</div>
                ) : (
                  recentActivity.map((item, idx) => (
                    <div key={item.id || idx} className={styles.activityItem}>
                      <div className={styles.activityHeader}>
                        <div className={styles.activityContent}>
                          <span className={styles.activityOscName}>{item.oscName || 'OSC'}</span>
                          <span className={styles.activityDesc}>{item.content || item.original_name}</span>
                        </div>
                        <span className={styles.activityTime}>
                          {formatDateTime(item.timestamp || item.created_at)}
                        </span>
                      </div>
                      <div className={styles.activitySender}>
                        <FiUser size={12} /> Enviado por: {item.sender || item.sender_name || 'Sistema'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardBody>
          </Card>
        </div>

      </div>
    </div>
  );
}