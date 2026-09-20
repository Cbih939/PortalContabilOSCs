import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import Button from '../../components/ui/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import ReportCharts from '../../components/charts/ReportCharts.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';
import styles from './SystemReports.module.css';

import { FiSearch, FiDownload, FiFilter, FiX } from 'react-icons/fi';

export default function SystemReports() {
  const { user } = useAuth();
  const role = user?.role?.toUpperCase();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const addNotification = useNotification();

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    module: '',
    action: ''
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async (currentFilters = filters) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentFilters.startDate) params.append('startDate', currentFilters.startDate);
      if (currentFilters.endDate) params.append('endDate', currentFilters.endDate);
      if (currentFilters.module) params.append('module', currentFilters.module);
      if (currentFilters.action) params.append('action', currentFilters.action);

      const response = await api.get(`/logs?${params.toString()}`);
      setLogs(response.data || []);
    } catch (error) {
      addNotification("Erro ao buscar os relatórios.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLogs(filters);
  };

  const clearFilters = () => {
    const emptyFilters = { startDate: '', endDate: '', module: '', action: '' };
    setFilters(emptyFilters);
    fetchLogs(emptyFilters);
  };

  const exportToPDF = () => {
    if (logs.length === 0) {
      return addNotification("Não há dados para exportar.", "warning");
    }

    try {
      const doc = new jsPDF('landscape'); 
      
      doc.setFontSize(18);
      doc.text("Relatório de Auditoria e Logs - Conta Comigo", 14, 20);
      doc.setFontSize(11);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 28);
      
      if (filters.startDate || filters.endDate) {
        doc.text(`Período: ${filters.startDate ? new Date(filters.startDate).toLocaleDateString('pt-BR') : 'Início'} até ${filters.endDate ? new Date(filters.endDate).toLocaleDateString('pt-BR') : 'Hoje'}`, 14, 34);
      }

      const tableColumn = ["Data e Hora", "Usuário", "Ação", "Módulo", "OSC Relacionada", "Detalhes da Ação"];
      const tableRows = [];

      logs.forEach(log => {
        const logData = [
          new Date(log.created_at).toLocaleString('pt-BR'),
          log.user_name,
          log.action,
          log.module,
          log.osc_name || '-',
          log.details || '-'
        ];
        tableRows.push(logData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [234, 88, 12] },
        columnStyles: {
          0: { cellWidth: 35 }, 
          1: { cellWidth: 40 }, 
          2: { cellWidth: 25 }, 
          3: { cellWidth: 30 }, 
          4: { cellWidth: 45 }, 
          5: { cellWidth: 'auto' } 
        }
      });

      doc.save(`Relatorio_ContaComigo_${new Date().getTime()}.pdf`);
      addNotification("Download do PDF concluído!", "success");

    } catch (error) {
      console.error("Erro ao gerar o PDF:", error);
      addNotification("Erro ao gerar o PDF. Verifique o console.", "error");
    }
  };

  const getActionColor = (action) => {
    switch (action?.toUpperCase()) {
      case 'CRIOU': return { bg: '#dcfce7', text: '#166534' };
      case 'EDITOU': return { bg: '#fef08a', text: '#854d0e' };
      case 'EXCLUIU': return { bg: '#fee2e2', text: '#991b1b' };
      case 'APROVOU': return { bg: '#cffafe', text: '#155e75' };
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  return (
    <div className={styles.pageContainer}>
      
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Auditoria e Relatórios</h1>
          <p className={styles.subtitle}>Acompanhe todas as movimentações do sistema e exporte os registos em PDF.</p>
        </div>
        <Button onClick={exportToPDF} variant="primary" icon={<FiDownload />}>
          Exportar para PDF
        </Button>
      </div>

      <ReportCharts role={role} />

      <div className={styles.filtersContainer}>
        <h3 className={styles.filtersTitle}>
          <FiFilter style={{color: 'var(--primary-color)'}}/> Filtros de Pesquisa
        </h3>
        
        <form onSubmit={handleSearch} className={styles.formGrid}>
          
          <div className={styles.inputGroup}>
            <label className={styles.formLabel}>Data Inicial</label>
            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className={styles.formInput} />
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.formLabel}>Data Final</label>
            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className={styles.formInput} />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.formLabel}>Módulo do Sistema</label>
            <select name="module" value={filters.module} onChange={handleFilterChange} className={styles.formSelect}>
              <option value="">Todos os Módulos</option>
              <option value="SISTEMA">Sistema Geral</option>
              <option value="OSC">Cadastro de OSC</option>
              <option value="DIRETORIA">Governança/Diretoria</option>
              <option value="DOCUMENTO">Documentos Mensais</option>
              <option value="AVISO">Avisos e Comunicações</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.formLabel}>Tipo de Ação</label>
            <select name="action" value={filters.action} onChange={handleFilterChange} className={styles.formSelect}>
              <option value="">Todas as Ações</option>
              <option value="CRIOU">Criação (Adicionar)</option>
              <option value="EDITOU">Edição (Atualizar)</option>
              <option value="EXCLUIU">Exclusão (Remover)</option>
              <option value="APROVOU">Aprovação / Análise</option>
            </select>
          </div>

          <div className={styles.actionsGroup}>
            <Button type="submit" variant="primary" icon={<FiSearch />} style={{ flex: 1, justifyContent: 'center' }}>
              Filtrar Resultados
            </Button>
            <Button type="button" onClick={clearFilters} variant="secondary" icon={<FiX />}>
              Limpar
            </Button>
          </div>
        </form>
      </div>

      <div className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <h3 className={styles.tableTitle}>Registo de Atividades</h3>
          <span className={styles.tableCount}>{logs.length} registos encontrados</span>
        </div>

        {isLoading ? (
          <div style={{ padding: '60px', display: 'flex', justifyContent: 'center' }}><Spinner text="Buscando logs..." /></div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Data e Hora</th>
                  <th className={styles.th}>Usuário (Agente)</th>
                  <th className={styles.th}>Ação</th>
                  <th className={styles.th}>Módulo</th>
                  <th className={styles.th}>OSC Relacionada</th>
                  <th className={styles.th}>Detalhes da Operação</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr className={styles.emptyRow}>
                    <td colSpan="6">Nenhuma atividade encontrada com estes filtros.</td>
                  </tr>
                ) : (
                  logs.map(log => {
                    const colors = getActionColor(log.action);
                    return (
                      <tr key={log.id} className={styles.tr}>
                        <td className={`${styles.td} ${styles.tdDate}`}>{new Date(log.created_at).toLocaleString('pt-BR')}</td>
                        <td className={`${styles.td} ${styles.tdUser}`}>{log.user_name}</td>
                        <td className={styles.td}>
                          <span style={{ backgroundColor: colors.bg, color: colors.text, padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '800' }}>
                            {log.action}
                          </span>
                        </td>
                        <td className={`${styles.td} ${styles.tdModule}`}>{log.module}</td>
                        <td className={`${styles.td} ${styles.tdOsc}`}>{log.osc_name || <span style={{color: 'var(--text-muted)'}}>-</span>}</td>
                        <td className={`${styles.td} ${styles.tdDetails}`}>{log.details}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}