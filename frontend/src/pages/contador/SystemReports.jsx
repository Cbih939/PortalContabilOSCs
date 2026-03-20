import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
// 👇 AQUI ESTÁ A MÁGICA DA CORREÇÃO DO PDF 👇
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Ícones ---
const SearchIcon = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const DownloadIcon = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const FilterIcon = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>;
const ClearIcon = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;

export default function SystemReports() {
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

  // --- LÓGICA DE GERAÇÃO DE PDF (CORRIGIDA) ---
  const exportToPDF = () => {
    if (logs.length === 0) {
      return addNotification("Não há dados para exportar.", "warning");
    }

    try {
      const doc = new jsPDF('landscape'); // Formato Paisagem
      
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

      // Nova forma segura de chamar a tabela do PDF
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
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', color: '#1f2937', margin: '0 0 8px 0', fontWeight: 'bold' }}>Auditoria e Relatórios</h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>Acompanhe todas as movimentações do sistema e exporte os registos em PDF.</p>
        </div>
        <Button onClick={exportToPDF} style={{ backgroundColor: '#1f2937', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DownloadIcon /> Exportar para PDF
        </Button>
      </div>

      {/* BLOCO 1: FILTROS */}
      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FilterIcon /> Filtros de Pesquisa
        </h3>
        
        <form onSubmit={handleSearch} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 200px' }}>
            <label style={labelStyle}>Data Inicial</label>
            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} style={inputStyle} />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 200px' }}>
            <label style={labelStyle}>Data Final</label>
            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} style={inputStyle} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 200px' }}>
            <label style={labelStyle}>Módulo do Sistema</label>
            <select name="module" value={filters.module} onChange={handleFilterChange} style={inputStyle}>
              <option value="">Todos os Módulos</option>
              <option value="SISTEMA">Sistema Geral</option>
              <option value="OSC">Cadastro de OSC</option>
              <option value="DIRETORIA">Governança/Diretoria</option>
              <option value="DOCUMENTO">Documentos Mensais</option>
              <option value="AVISO">Avisos e Comunicações</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 200px' }}>
            <label style={labelStyle}>Tipo de Ação</label>
            <select name="action" value={filters.action} onChange={handleFilterChange} style={inputStyle}>
              <option value="">Todas as Ações</option>
              <option value="CRIOU">Criação (Adicionar)</option>
              <option value="EDITOU">Edição (Atualizar)</option>
              <option value="EXCLUIU">Exclusão (Remover)</option>
              <option value="APROVOU">Aprovação / Análise</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', flex: '1 1 100%' }}>
            <Button type="submit" style={{ backgroundColor: '#ea580c', color: '#fff', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              <SearchIcon /> Filtrar Resultados
            </Button>
            <Button type="button" onClick={clearFilters} variant="secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ClearIcon /> Limpar
            </Button>
          </div>
        </form>
      </div>

      {/* BLOCO 2: TABELA */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: '#374151' }}>Registo de Atividades</h3>
          <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 'bold' }}>{logs.length} registos encontrados</span>
        </div>

        {isLoading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}><Spinner text="Buscando logs..." /></div>
        ) : (
          <div style={{ overflowX: 'auto', maxHeight: '600px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f3f4f6', zIndex: 1 }}>
                <tr>
                  <th style={thStyle}>Data e Hora</th>
                  <th style={thStyle}>Usuário (Agente)</th>
                  <th style={thStyle}>Ação</th>
                  <th style={thStyle}>Módulo</th>
                  <th style={thStyle}>OSC Relacionada</th>
                  <th style={thStyle}>Detalhes da Operação</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                      Nenhuma atividade encontrada com estes filtros.
                    </td>
                  </tr>
                ) : (
                  logs.map(log => {
                    const colors = getActionColor(log.action);
                    return (
                      <tr key={log.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={tdStyle}>{new Date(log.created_at).toLocaleString('pt-BR')}</td>
                        <td style={tdStyle}><strong>{log.user_name}</strong></td>
                        <td style={tdStyle}>
                          <span style={{ backgroundColor: colors.bg, color: colors.text, padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                            {log.action}
                          </span>
                        </td>
                        <td style={tdStyle}>{log.module}</td>
                        <td style={tdStyle}>{log.osc_name || <span style={{color: '#9ca3af'}}>-</span>}</td>
                        <td style={{ ...tdStyle, color: '#4b5563', maxWidth: '300px' }}>{log.details}</td>
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

const labelStyle = { fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', backgroundColor: '#f9fafb', boxSizing: 'border-box' };
const thStyle = { padding: '14px 16px', fontWeight: 'bold', color: '#4b5563', borderBottom: '1px solid #d1d5db', whiteSpace: 'nowrap' };
const tdStyle = { padding: '14px 16px', verticalAlign: 'middle' };