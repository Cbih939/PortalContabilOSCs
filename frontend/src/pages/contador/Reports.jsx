import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { formatDateTime } from '../../utils/formatDate.js';
import Spinner from '../../components/common/Spinner.jsx';
import Button from '../../components/ui/Button.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ReportCharts from '../../components/charts/ReportCharts.jsx';
import styles from './Reports.module.css';
import { FiDownload, FiSearch, FiFilter } from 'react-icons/fi';

export default function ContadorReports() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const addNotification = useNotification();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get('/contador/reports');
        setReports(response.data);
      } catch (err) {
        addNotification('Erro ao carregar relatórios.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, [addNotification]);

  const handleDownloadPDF = async () => {
    const element = document.getElementById('report-table-container');
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgHeight = (canvas.height * pdf.internal.pageSize.getWidth()) / canvas.width;
    
    pdf.setFontSize(16);
    pdf.text("Relatório Geral do Sistema - Conta Comigo", 10, 10);
    pdf.setFontSize(10);
    pdf.text(`Gerado em: ${formatDateTime(new Date())}`, 10, 16);
    
    pdf.addImage(imgData, 'PNG', 0, 25, pdf.internal.pageSize.getWidth(), imgHeight);
    pdf.save(`auditoria-sistema-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const filteredReports = reports.filter(r => {
    const matchSearch = r.oscName.toLowerCase().includes(search.toLowerCase()) || r.document.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === '' || (r.status || 'Pendente').toUpperCase() === statusFilter.toUpperCase();
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status) => {
    const st = String(status).toUpperCase();
    if (st === 'CONCLUIDO' || st === 'CONCLUSO TEC') return <span className={styles.badgeConcluido}>Concluído</span>;
    return <span className={styles.badgePendente}>Pendente</span>;
  };

  if (isLoading) return <div style={{display: 'flex', justifyContent: 'center', padding: '50px'}}><Spinner text="A compilar dados do sistema..." /></div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Relatórios do Sistema</h1>
          <p className={styles.subtitle}>Log de auditoria e atividades das suas organizações.</p>
        </div>
        <Button onClick={handleDownloadPDF} variant="primary" icon={<FiDownload />}>
          Exportar PDF
        </Button>
      </div>

      <ReportCharts role="CONTADOR" />

      <div className={styles.filtersContainer}>
        <div className={styles.searchGroup}>
          <div className={styles.searchIconWrapper}><FiSearch /></div>
          <input 
            type="text" 
            placeholder="Buscar por OSC ou nome do documento..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filterGroup}>
          <FiFilter style={{color: 'var(--text-muted)'}} />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Todos os Status</option>
            <option value="PENDENTE">Pendentes</option>
            <option value="CONCLUIDO">Concluídos</option>
          </select>
        </div>
      </div>

      <div id="report-table-container" className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Data/Hora</th>
              <th className={styles.th}>Organização (OSC)</th>
              <th className={styles.th}>Ação / Tipo</th>
              <th className={styles.th}>Documento</th>
              <th className={styles.th}>Ref.</th>
              <th className={styles.th}>Status Atual</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length === 0 ? (
              <tr className={styles.emptyRow}>
                <td colSpan="6">Nenhum registo encontrado com estes filtros.</td>
              </tr>
            ) : (
              filteredReports.map((r, idx) => (
                <tr key={idx} className={styles.tr}>
                  <td className={`${styles.td} ${styles.tdDate}`}>{formatDateTime(r.date)}</td>
                  <td className={`${styles.td} ${styles.tdOsc}`}>{r.oscName}</td>
                  <td className={`${styles.td} ${styles.tdAction}`}>{r.action}</td>
                  <td className={`${styles.td} ${styles.tdDocument}`}>{r.document}</td>
                  <td className={`${styles.td} ${styles.tdRef}`}>{r.reference}</td>
                  <td className={styles.td}>{getStatusBadge(r.status)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}