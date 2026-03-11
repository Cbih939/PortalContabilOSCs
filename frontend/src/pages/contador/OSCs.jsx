// src/pages/contador/OSCs.jsx

import React, { useState, useEffect, useRef } from 'react';
import * as oscService from '../../services/oscService.js';
import * as alertService from '../../services/alertService.js';
import * as docService from '../../services/documentService.js'; 

// Componentes modais
import ViewOSCModal from './components/ViewOSCModal.jsx';
import EditOSCModal from './components/EditOSCModal.jsx';
import SendAlertModal from './components/SendAlertModal.jsx';

import Spinner from '../../components/common/Spinner.jsx';
import useApi from '../../hooks/useApi.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';

// --- ÍCONES SVG NATIVOS ---
const IconChevronDown = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
);
const IconChevronUp = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
);
const IconEdit = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
);
const IconEye = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
);
const IconBell = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
);
const IconFileText = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
);
const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);
const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);
const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);
const IconInfo = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EC6D12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{cursor: 'help'}}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
);
const IconUpload = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
);

// --- ESTILOS ---
const styles = {
  container: { padding: '20px', width: '90%', margin: '0 auto', fontFamily: 'Arial, sans-serif' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' },
  registerBtn: { backgroundColor: '#ea580c', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', boxShadow: '0 2px 4px rgba(234, 88, 12, 0.2)' },
  searchRow: { display: 'flex', gap: '15px', marginBottom: '24px', flexWrap: 'wrap' },
  searchWrapper: { position: 'relative', flex: 1, minWidth: '200px' },
  searchIcon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex' },
  searchInput: { width: '100%', padding: '12px 12px 12px 40px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none', color: '#374151', boxSizing: 'border-box' },
  accordionItem: { border: '1px solid #e0e0e0', borderRadius: '8px', marginBottom: '12px', backgroundColor: '#fff', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  accordionHeader: { padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: '#fff', transition: 'background-color 0.2s' },
  oscInfo: { display: 'flex', flexDirection: 'column' },
  oscName: { fontSize: '16px', fontWeight: 'bold', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' },
  oscCnpj: { fontSize: '13px', color: '#6b7280', marginTop: '4px' },
  actions: { display: 'flex', gap: '8px', alignItems: 'center' },
  actionBtn: (color, bg) => ({ padding: '8px', borderRadius: '50%', border: 'none', cursor: 'pointer', color: color, backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s' }),
  accordionBody: { padding: '20px', backgroundColor: '#f9fafb', borderTop: '1px solid #eee' },
  legend: { display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '20px', fontSize: '12px', color: '#555' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '6px' },
  colorBox: (bg, border) => ({ width: '12px', height: '12px', backgroundColor: bg, border: `1px solid ${border}`, borderRadius: '2px' }),
  sectionTitle: { fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '20px' },
  calendarGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '10px', marginBottom: '24px' },
  monthBox: (bg, color, border) => ({ backgroundColor: bg, color: color, border: `1px solid ${border}`, borderRadius: '6px', padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60px' }),
  monthText: { fontSize: '14px', fontWeight: 'bold' },
  statusText: { fontSize: '10px', fontWeight: '600', marginTop: '4px', textTransform: 'uppercase' },
  docList: { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' },
  docItem: { padding: '12px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s' },
  docMain: { display: 'flex', alignItems: 'center', gap: '10px', color: '#2563eb', fontWeight: '500' },
  docMeta: { display: 'flex', alignItems: 'center', gap: '12px' },
  typeBadge: (isMensal) => ({ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: isMensal ? '#fef3c7' : '#e0e7ff', color: isMensal ? '#92400e' : '#3730a3', fontWeight: 'bold' }),
  docDate: { fontSize: '12px', color: '#9ca3af' },
  checkBtn: { backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' },
  counterUploadBtn: { backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' },
  actionPanel: { display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center', background: '#ffffff', padding: '15px', borderRadius: '8px', border: '1px solid #e5e7eb', flexWrap: 'wrap' },
  selectInput: { padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '13px' },
  emptyState: { textAlign: 'center', padding: '40px', color: '#9ca3af', backgroundColor: '#f9fafb', borderRadius: '8px', border: '2px dashed #e5e7eb' },
  tooltipWrapper: { position: 'relative', display: 'inline-flex', alignItems: 'center' },
  tooltipBox: { visibility: 'hidden', width: '240px', backgroundColor: '#1e2937', color: '#fff', textAlign: 'left', borderRadius: '6px', padding: '10px', position: 'absolute', zIndex: 10, bottom: '125%', left: '50%', marginLeft: '-120px', opacity: 0, transition: 'opacity 0.3s', fontSize: '12px', lineHeight: '1.4', fontWeight: 'normal', pointerEvents: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }
};

const injectStyles = () => {
  if (document.getElementById('osc-styles')) return;
  const styleTag = document.createElement('style');
  styleTag.id = 'osc-styles';
  styleTag.innerHTML = `
    .tooltip-container:hover .tooltip-box { visibility: visible !important; opacity: 1 !important; }
    .accordion-header:hover { background-color: #f9fafb !important; }
    .doc-item-row:hover { background-color: #eff6ff !important; }
  `;
  document.head.appendChild(styleTag);
};
injectStyles();

const OSCAccordionItem = ({ osc, isExpanded, onToggle, onView, onEdit, onSendAlert, onRefresh }) => {
  const addNotification = useNotification();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [actionMonth, setActionMonth] = useState(new Date().getMonth() + 1);
  const [actionYear, setActionYear] = useState(new Date().getFullYear());

  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const years = [2024, 2025, 2026];

  const handleConcludeMonth = async () => {
    if (!window.confirm(`Deseja marcar ${months[actionMonth-1]}/${actionYear} como CONCLUÍDO para esta OSC?`)) return;
    try {
      await docService.markAsConcluded({ 
        oscId: osc.id,
        month: actionMonth,
        year: actionYear
      });
      addNotification(`Período ${actionMonth}/${actionYear} concluído com sucesso!`, "success");
      onRefresh();
    } catch (err) {
      addNotification("Erro ao concluir período.", "error");
    }
  };

  const handleMarkTec = async (type) => {
    const isYearly = type === 'year';
    const confirmMsg = isYearly
      ? `Deseja marcar TODO O ANO de ${actionYear} como CONCLUSO TEC?`
      : `Deseja marcar o mês ${months[actionMonth-1]}/${actionYear} como CONCLUSO TEC?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await docService.markConclusoTec({ 
        osc_id: osc.id, 
        month: isYearly ? 'ALL' : actionMonth, 
        year: actionYear 
      });
      addNotification(`TEC marcado com sucesso!`, "success");
      onRefresh();
    } catch (err) {
      addNotification("Erro ao registrar TEC.", "error");
    }
  };

  const handleCounterUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('osc_id', osc.id);
      formData.append('doc_type', 'FIXO'); 
      formData.append('ref_month', actionMonth);
      formData.append('ref_year', actionYear);
      await docService.uploadDocument(formData);
      addNotification(`Documento enviado (${actionMonth}/${actionYear})!`, "success");
      onRefresh();
    } catch (err) {
      addNotification("Erro ao enviar documento.", "error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const openDocument = (doc) => {
    if (!doc) return;
    if (doc.doc_type === 'CONCLUSO TEC' && (!doc.file_path || doc.file_path === 'none')) {
      alert("Este é um registro de Histórico (TEC). Não há arquivo PDF associado para download.");
      return;
    }
    const apiUrl = import.meta.env.VITE_API_URL || 'https://contacomigo.org.br';
    const rawPath = doc.saved_filename || doc.file_path || doc.filename || "";
    const cleanFileName = rawPath.replace('uploads/', '');
    window.open(`${apiUrl}/uploads/${cleanFileName}`, '_blank');
  };

  // --- NOVA LÓGICA DE STATUS COM 'CONCLUSO TEC' ---
  const getMonthStatus = (monthIndex) => {
    const monthNum = monthIndex + 1;
    const docsInMonth = osc.documents ? osc.documents.filter(d => {
        return parseInt(d.ref_month) === monthNum && parseInt(d.ref_year) === viewYear;
    }) : [];
    const hasDoc = docsInMonth.length > 0;
    
    // Verifica a nova categoria
    const hasConclusoTec = hasDoc && docsInMonth.some(d => d.doc_type === 'CONCLUSO TEC');
    const isVerified = hasDoc && docsInMonth.some(d => d.status === 'CONCLUIDO');
    
    if (hasConclusoTec) return 'concluso_tec'; // Retorna o status especial Roxo
    if (isVerified) return 'concluded'; 
    if (hasDoc) return 'sent';           
    
    const now = new Date();
    if (viewYear === now.getFullYear() && monthIndex === now.getMonth()) return 'pending';
    if (viewYear < now.getFullYear() || (viewYear === now.getFullYear() && monthIndex < now.getMonth())) return 'late';
    return 'future';
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'late': return ['#fee2e2', '#b91c1c', '#fecaca'];
      case 'pending': return ['#fef9c3', '#a16207', '#fde047'];
      case 'sent': return ['#dbeafe', '#1d4ed8', '#bfdbfe'];
      case 'concluded': return ['#dcfce7', '#15803d', '#86efac'];
      case 'concluso_tec': return ['#f3e8ff', '#7e22ce', '#e9d5ff']; // ROXO para Concluso TEC
      default: return ['#f3f4f6', '#9ca3af', '#e5e7eb'];
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'late': return 'Atraso';
      case 'pending': return 'Aberto';
      case 'sent': return 'Enviado';
      case 'concluded': return 'Concluso'; 
      case 'concluso_tec': return 'Concluso TEC'; 
      default: return '-';
    }
  };

  return (
    <div style={{
      ...styles.accordionItem, 
      border: isExpanded ? '1px solid #93c5fd' : '1px solid #e0e0e0',
      boxShadow: isExpanded ? '0 0 0 1px #bfdbfe' : 'none'
    }}>
      <div className="accordion-header" style={styles.accordionHeader} onClick={() => onToggle(osc.id)}>
        <div style={styles.oscInfo}>
          <span style={styles.oscName}>
            {osc.name || osc.razao_social}
            {isExpanded ? <IconChevronUp /> : <IconChevronDown />}
          </span>
          <span style={styles.oscCnpj}>CNPJ: {osc.cnpj || 'Não informado'}</span>
        </div>
        <div style={styles.actions} onClick={(e) => e.stopPropagation()}>
          <button style={styles.actionBtn('#2563eb', '#eff6ff')} onClick={() => onView(osc)} title="Ver Detalhes"><IconEye /></button>
          <button style={styles.actionBtn('#d97706', '#fffbeb')} onClick={() => onEdit(osc)} title="Editar Dados"><IconEdit /></button>
          <button style={styles.actionBtn('#dc2626', '#fef2f2')} onClick={() => onSendAlert(osc)} title="Enviar Alerta"><IconBell /></button>
        </div>
      </div>

      {isExpanded && (
        <div style={styles.accordionBody}>
          
          {/* FAIXA DE CONTRATO */}
          {osc.data_contrato_conta_comigo && (
            <div style={{
              backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', color: '#0369a1',
              padding: '10px 15px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', fontWeight: '500'
            }}>
              🤝 Início da relação contratual com CONTA COMIGO: <strong>{new Date(osc.data_contrato_conta_comigo).toLocaleDateString('pt-BR')}</strong>
            </div>
          )}

          <div style={styles.actionPanel}>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <span style={{fontSize: '13px', fontWeight: 'bold', color: '#374151'}}>Ação para Competência:</span>
              <select style={styles.selectInput} value={actionMonth} onChange={(e) => setActionMonth(parseInt(e.target.value))}>
                {months.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
              </select>
              <select style={styles.selectInput} value={actionYear} onChange={(e) => setActionYear(parseInt(e.target.value))}>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div style={{borderLeft: '1px solid #ddd', height: '24px', margin: '0 10px'}}></div>
            
            <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', flex: 1}}>
              <button style={{...styles.checkBtn, flex: 1, justifyContent: 'center'}} onClick={handleConcludeMonth}>
                <IconCheck /> Concluir
              </button>
              
              {/* NOVOS BOTÕES TEC */}
              <button 
                style={{...styles.checkBtn, backgroundColor: '#7e22ce', flex: 1, justifyContent: 'center'}} 
                onClick={() => handleMarkTec('month')} 
                title="Marcar mês como Transferência (TEC)"
              >
                🟣 TEC (Mês)
              </button>
              <button 
                style={{...styles.checkBtn, backgroundColor: '#581c87', flex: 1, justifyContent: 'center'}} 
                onClick={() => handleMarkTec('year')} 
                title="Marcar ano todo como Transferência (TEC)"
              >
                🟣 TEC (Ano)
              </button>

              <label style={{...styles.counterUploadBtn, flex: 1, justifyContent: 'center'}}>
                {isUploading ? <Spinner size="sm" /> : <><IconUpload /> Enviar</>}
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleCounterUpload} disabled={isUploading} />
              </label>
            </div>

          </div>

          <div style={styles.legend}>
            <div style={styles.legendItem}><div style={styles.colorBox('#fee2e2', '#fecaca')}></div> Em Atraso</div>
            <div style={styles.legendItem}><div style={styles.colorBox('#fef9c3', '#fde047')}></div> Pendente</div>
            <div style={styles.legendItem}><div style={styles.colorBox('#dbeafe', '#bfdbfe')}></div> Enviado</div>
            <div style={styles.legendItem}><div style={styles.colorBox('#dcfce7', '#86efac')}></div> Concluso</div>
            {/* NOVA LEGENDA AQUI */}
            <div style={styles.legendItem}><div style={styles.colorBox('#f3e8ff', '#e9d5ff')}></div> Concluso TEC</div>
          </div>

          <h4 style={styles.sectionTitle}>
            Calendário de Conformidade - Ano: 
            <select style={{...styles.selectInput, marginLeft: '10px'}} value={viewYear} onChange={(e) => setViewYear(parseInt(e.target.value))}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </h4>

          <div style={styles.calendarGrid}>
            {months.map((m, idx) => {
              const status = getMonthStatus(idx);
              const [bg, color, border] = getStatusStyle(status);
              return (
                <div key={m} style={styles.monthBox(bg, color, border)}>
                  <span style={styles.monthText}>{m}</span>
                  <span style={styles.statusText}>{getStatusLabel(status)}</span>
                </div>
              )
            })}
          </div>

          {/* O TÍTULO AGORA ESTÁ SEM O "2025" */}
          <h4 style={styles.sectionTitle}><IconFileText /> DOCUMENTAÇÃO | GOVERNANÇA</h4>
          <div style={styles.docList}>
            {osc.documents && osc.documents.filter(d => parseInt(d.ref_year) === viewYear).length > 0 ? (
              osc.documents
                .filter(d => parseInt(d.ref_year) === viewYear)
                .map((doc, i) => (
                  <div key={i} className="doc-item-row" style={styles.docItem} onClick={() => openDocument(doc)}>
                    <div style={styles.docMain}>
                      <IconFileText />
                      <span>{doc.original_name}</span>
                    </div>
                    <div style={styles.docMeta}>
                      <span style={{fontSize: '11px', color: '#6b7280', fontWeight: '600'}}>
                        Ref: {months[(doc.ref_month || 1) - 1]}/{doc.ref_year}
                      </span>
                      <span style={styles.typeBadge(doc.doc_type === 'MENSAL')}>{doc.doc_type || 'MENSAL'}</span>
                      <span style={styles.docDate}>Postado: {new Date(doc.createdAt || doc.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                ))
            ) : (
              <div style={styles.emptyState}>Sem registros para o ano de {viewYear}.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function OSCsPage() {
  const [oscs, setOscs] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [expandedOscId, setExpandedOscId] = useState(null);
  const [searchName, setSearchName] = useState('');
  const [searchCnpj, setSearchCnpj] = useState('');
  const [oscToView, setOscToView] = useState(null);
  const [oscToEdit, setOscToEdit] = useState(null);
  const [oscToSendAlert, setOscToSendAlert] = useState(null);

  const addNotification = useNotification();
  // Hooks para as requisições
  const { request: updateOSC, isLoading: isUpdating } = useApi(oscService.updateOSC);
  const { request: createOSC, isLoading: isCreating } = useApi(oscService.createOSC);
  const { request: sendAlert, isLoading: isSendingAlert } = useApi(alertService.sendAlertToOSC);

  const fetchOSCs = async () => {
    setIsLoadingData(true);
    try {
      const response = await oscService.getMyOSCs();
      let data = [];
      if (Array.isArray(response)) {
        data = response;
      } else if (response && response.data) {
        data = response.data;
      } else {
        data = response;
      }
      
      const sortedData = data.map(osc => ({
        ...osc,
        documents: osc.documents ? [...osc.documents].sort((a, b) => 
          new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at)
        ) : []
      }));
      setOscs(sortedData.sort((a, b) => (a.name || a.razao_social || '').localeCompare(b.name || b.razao_social || '')));
    } catch (err) {
      console.error("Erro ao buscar OSCs:", err);
      addNotification("Erro ao carregar OSCs. Verifique sua conexão.", "error");
      setOscs([]); 
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => { fetchOSCs(); }, []);

  const filteredOscs = oscs.filter(osc => {
    const name = osc.name || osc.razao_social || '';
    const nameMatch = name.toLowerCase().includes(searchName.toLowerCase());
    const cnpjMatch = (osc.cnpj || '').replace(/\D/g, '').includes(searchCnpj.replace(/\D/g, ''));
    return nameMatch && cnpjMatch;
  });

  const handleToggleAccordion = (id) => setExpandedOscId(prevId => (prevId === id ? null : id));
  const handleCloseModals = () => { setOscToView(null); setOscToEdit(null); setOscToSendAlert(null); };

  const handleSaveEdit = async (formData) => {
    const oscId = formData.id;
    const payload = { ...formData, responsavel: formData.responsible || formData.responsavel };
    
    try {
      if (oscId) {
        await updateOSC(oscId, payload);
        addNotification(`Organização atualizada com sucesso!`, 'success');
      } else {
        await createOSC(payload);
        addNotification(`Nova Organização cadastrada com sucesso!`, 'success');
      }
      fetchOSCs();
      handleCloseModals();
    } catch (err) { 
      console.error("Erro na API:", err);
      addNotification(err.response?.data?.message || 'Erro ao salvar no servidor. Verifique os dados.', 'error'); 
    }
  };

  const handleSendAlertSubmit = async (alertData) => {
    try {
      await sendAlert(alertData);
      addNotification("Alerta enviado com sucesso!", "success");
      handleCloseModals();
    } catch (err) {
      addNotification("Erro ao enviar alerta.", "error");
    }
  };

  if (isLoadingData) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><Spinner text="Carregando..." /></div>;

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h1 style={styles.title}>
          Minhas Organizações (OSCs)
          <div className="tooltip-container" style={styles.tooltipWrapper}>
            <IconInfo />
            <div className="tooltip-box" style={styles.tooltipBox}>
              Gerencie suas organizações, valide envios e monitore a conformidade contábil.
            </div>
          </div>
        </h1>
        <button style={styles.registerBtn} onClick={() => setOscToEdit({})}>
          <IconPlus /> Cadastrar Nova OSC
        </button>
      </div>

      <div style={styles.searchRow}>
        <div style={styles.searchWrapper}>
          <div style={styles.searchIcon}><IconSearch /></div>
          <input type="text" placeholder="Nome..." style={styles.searchInput} value={searchName} onChange={(e) => setSearchName(e.target.value)} />
        </div>
        <div style={styles.searchWrapper}>
          <div style={styles.searchIcon}><IconSearch /></div>
          <input type="text" placeholder="CNPJ..." style={styles.searchInput} value={searchCnpj} onChange={(e) => setSearchCnpj(e.target.value)} />
        </div>
      </div>

      <div>
        {filteredOscs.length === 0 ? (
            <div style={styles.emptyState}>Nenhuma OSC encontrada.</div>
        ) : (
            filteredOscs.map(osc => (
                <OSCAccordionItem 
                    key={osc.id} 
                    osc={osc} 
                    isExpanded={expandedOscId === osc.id}
                    onToggle={handleToggleAccordion}
                    onView={setOscToView}
                    onEdit={(oscData) => setOscToEdit({ ...oscData, id: osc.id })}
                    onSendAlert={setOscToSendAlert}
                    onRefresh={fetchOSCs}
                />
            ))
        )}
      </div>

      {oscToView && <ViewOSCModal isOpen={!!oscToView} onClose={handleCloseModals} osc={oscToView} />}
      
      {oscToEdit && (
        <EditOSCModal 
          isOpen={!!oscToEdit} 
          onClose={handleCloseModals} 
          oscData={oscToEdit} 
          onSave={handleSaveEdit} 
          isLoading={isUpdating || isCreating} 
        />
      )}
      
      {oscToSendAlert && <SendAlertModal isOpen={!!oscToSendAlert} onClose={handleCloseModals} osc={oscToSendAlert} onSend={handleSendAlertSubmit} isLoading={isSendingAlert} />}
    </div>
  );
}