import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { formatDateTime } from '../../utils/formatDate.js';
import Spinner from '../../components/common/Spinner.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Ícones
const DownloadIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const SearchIcon = () => <svg width="18" height="18" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.3-4.3" /></svg>;
const FilterIcon = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>;

export default function ContadorReports() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const addNotification = useNotification();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        // Chamada direta para a nova rota
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
    if (st === 'CONCLUIDO' || st === 'CONCLUSO TEC') return <span style={{backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold'}}>Concluído</span>;
    return <span style={{backgroundColor: '#fef9c3', color: '#a16207', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold'}}>Pendente</span>;
  };

  if (isLoading) return <div style={{marginTop: '50px'}}><Spinner text="A compilar dados do sistema..." /></div>;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>Relatórios do Sistema</h1>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '14px' }}>Log de auditoria e atividades das suas organizações.</p>
        </div>
        <button 
          onClick={handleDownloadPDF} 
          style={{ backgroundColor: '#1f2937', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <DownloadIcon /> Exportar PDF
        </button>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', backgroundColor: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <div style={{ position: 'absolute', left: '12px', top: '10px' }}><SearchIcon /></div>
          <input 
            type="text" 
            placeholder="Buscar por OSC ou nome do documento..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FilterIcon />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}
          >
            <option value="">Todos os Status</option>
            <option value="PENDENTE">Pendentes</option>
            <option value="CONCLUIDO">Concluídos</option>
          </select>
        </div>
      </div>

      <div id="report-table-container" style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
            <tr>
              <th style={{ padding: '14px 16px', fontSize: '13px', color: '#374151' }}>Data/Hora</th>
              <th style={{ padding: '14px 16px', fontSize: '13px', color: '#374151' }}>Organização (OSC)</th>
              <th style={{ padding: '14px 16px', fontSize: '13px', color: '#374151' }}>Ação / Tipo</th>
              <th style={{ padding: '14px 16px', fontSize: '13px', color: '#374151' }}>Documento</th>
              <th style={{ padding: '14px 16px', fontSize: '13px', color: '#374151' }}>Ref.</th>
              <th style={{ padding: '14px 16px', fontSize: '13px', color: '#374151' }}>Status Atual</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Nenhum registo encontrado com estes filtros.</td>
              </tr>
            ) : (
              filteredReports.map((r, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4b5563', whiteSpace: 'nowrap' }}>{formatDateTime(r.date)}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 'bold', color: '#1f2937' }}>{r.oscName}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4b5563' }}>{r.action}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#2563eb' }}>{r.document}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4b5563' }}>{r.reference}</td>
                  <td style={{ padding: '12px 16px' }}>{getStatusBadge(r.status)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}