// src/pages/contador/OSCs.jsx

import React, { useState, useEffect } from 'react';
import * as oscService from '../../services/oscService.js';
import * as alertService from '../../services/alertService.js';

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
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
);
const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);
const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);

// Ícone de Informação (Tooltip)
const IconInfo = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EC6D12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{cursor: 'help'}}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
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
  actions: { display: 'flex', gap: '8px' },
  actionBtn: (color, bg) => ({ padding: '8px', borderRadius: '50%', border: 'none', cursor: 'pointer', color: color, backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s' }),
  accordionBody: { padding: '20px', backgroundColor: '#f9fafb', borderTop: '1px solid #eee' },
  legend: { display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '20px', fontSize: '12px', color: '#555' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '6px' },
  colorBox: (bg, border) => ({ width: '12px', height: '12px', backgroundColor: bg, border: `1px solid ${border}`, borderRadius: '2px' }),
  sectionTitle: { fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' },
  calendarGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '10px', marginBottom: '24px' },
  monthBox: (bg, color, border) => ({ backgroundColor: bg, color: color, border: `1px solid ${border}`, borderRadius: '6px', padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60px' }),
  monthText: { fontSize: '14px', fontWeight: 'bold' },
  statusText: { fontSize: '10px', fontWeight: '600', marginTop: '4px', textTransform: 'uppercase' },
  docList: { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', maxHeight: '200px', overflowY: 'auto' },
  docItem: { padding: '12px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' },
  emptyState: { textAlign: 'center', padding: '40px', color: '#9ca3af', backgroundColor: '#f9fafb', borderRadius: '8px', border: '2px dashed #e5e7eb' },
  
  // TOOLTIP STYLES (Inline simulation)
  tooltipWrapper: { position: 'relative', display: 'inline-flex', alignItems: 'center' },
  tooltipBox: {
    visibility: 'hidden',
    width: '240px',
    backgroundColor: '#1e2937',
    color: '#fff',
    textAlign: 'left',
    borderRadius: '6px',
    padding: '10px',
    position: 'absolute',
    zIndex: 10,
    bottom: '125%',
    left: '50%',
    marginLeft: '-120px',
    opacity: 0,
    transition: 'opacity 0.3s',
    fontSize: '12px',
    lineHeight: '1.4',
    fontWeight: 'normal',
    pointerEvents: 'none',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  }
};

// Inserção de CSS Global dinâmico para os estados de Hover do Tooltip
const injectStyles = () => {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = `
    .tooltip-container:hover .tooltip-box { visibility: visible !important; opacity: 1 !important; }
    .accordion-header:hover { background-color: #f9fafb !important; }
  `;
  document.head.appendChild(styleTag);
};
injectStyles();

// --- COMPONENTE LOCAL: Item do Acordeon ---
const OSCAccordionItem = ({ osc, isExpanded, onToggle, onView, onEdit, onSendAlert }) => {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const currentMonthIndex = new Date().getMonth(); 

  const getMonthStatus = (monthIndex) => {
    if (monthIndex > currentMonthIndex) return 'future';
    if (monthIndex === currentMonthIndex) {
        const hasDocCurrentMonth = osc.documents && osc.documents.some(d => {
            if (!d.createdAt) return false;
            return new Date(d.createdAt).getMonth() === monthIndex;
        });
        if (!hasDocCurrentMonth) return 'pending';
    }
    const docsInMonth = osc.documents ? osc.documents.filter(d => {
        if (!d.createdAt) return false;
        return new Date(d.createdAt).getMonth() === monthIndex;
    }) : [];
    const hasDoc = docsInMonth.length > 0;
    const isVerified = hasDoc && docsInMonth.some(d => d.verified === true || d.status === 'APPROVED');
    if (isVerified) return 'concluded'; 
    if (hasDoc) return 'sent';          
    return 'late';
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'late': return ['#fee2e2', '#b91c1c', '#fecaca'];
      case 'pending': return ['#fef9c3', '#a16207', '#fde047'];
      case 'sent': return ['#dbeafe', '#1d4ed8', '#bfdbfe'];
      case 'concluded': return ['#dcfce7', '#15803d', '#86efac'];
      default: return ['#f3f4f6', '#9ca3af', '#e5e7eb'];
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'late': return 'Atraso';
      case 'pending': return 'Aberto';
      case 'sent': return 'Enviado';
      case 'concluded': return 'OK';
      default: return '-';
    }
  };

  return (
    <div style={{
      ...styles.accordionItem, 
      border: isExpanded ? '1px solid #93c5fd' : '1px solid #e0e0e0',
      boxShadow: isExpanded ? '0 0 0 1px #bfdbfe' : 'none'
    }}>
      <div 
        className="accordion-header"
        style={styles.accordionHeader}
        onClick={() => onToggle(osc.id)}
      >
        <div style={styles.oscInfo}>
          <span style={styles.oscName}>
            {osc.name}
            {isExpanded ? <IconChevronUp /> : <IconChevronDown />}
          </span>
          <span style={styles.oscCnpj}>CNPJ: {osc.cnpj || 'Não informado'}</span>
        </div>

        <div style={styles.actions} onClick={(e) => e.stopPropagation()}>
          <button style={styles.actionBtn('#2563eb', '#eff6ff')} onClick={() => onView(osc)} title="Ver">
            <IconEye />
          </button>
          <button style={styles.actionBtn('#d97706', '#fffbeb')} onClick={() => onEdit(osc)} title="Editar">
            <IconEdit />
          </button>
          <button style={styles.actionBtn('#dc2626', '#fef2f2')} onClick={() => onSendAlert(osc)} title="Alertar">
            <IconBell />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div style={styles.accordionBody}>
          <div style={styles.legend}>
            <div style={styles.legendItem}><div style={styles.colorBox('#fee2e2', '#fecaca')}></div> Em Atraso</div>
            <div style={styles.legendItem}><div style={styles.colorBox('#fef9c3', '#fde047')}></div> Pendente</div>
            <div style={styles.legendItem}><div style={styles.colorBox('#dbeafe', '#bfdbfe')}></div> Enviado</div>
            <div style={styles.legendItem}><div style={styles.colorBox('#dcfce7', '#86efac')}></div> Concluso</div>
          </div>

          <h4 style={styles.sectionTitle}>
            Situação Anual ({new Date().getFullYear()})
            <div className="tooltip-container" style={styles.tooltipWrapper}>
              <IconInfo />
              <div className="tooltip-box" style={styles.tooltipBox}>
                Este calendário monitora a conformidade mensal da OSC. O status "OK" indica que os documentos foram revisados e aprovados por você.
              </div>
            </div>
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

          <h4 style={{...styles.sectionTitle, gap: '8px'}}>
            <IconFileText /> Documentações Recentes
            <div className="tooltip-container" style={styles.tooltipWrapper}>
              <IconInfo />
              <div className="tooltip-box" style={styles.tooltipBox}>
                Lista dos últimos arquivos submetidos pela organização para conferência.
              </div>
            </div>
          </h4>
          
          {osc.documents && osc.documents.length > 0 ? (
            <div style={styles.docList}>
                {osc.documents.map((doc, i) => (
                    <div key={i} style={styles.docItem}>
                        <span style={{color: '#374151', fontWeight: '500'}}>{doc.title || `Documento sem título`}</span>
                        <span style={{fontSize: '12px', color: '#6b7280'}}>
                            {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : '-'}
                        </span>
                    </div>
                ))}
            </div>
          ) : (
            <div style={{padding: '15px', color: '#888', fontStyle: 'italic', border: '1px dashed #ccc', borderRadius: '4px', textAlign: 'center', fontSize: '13px'}}>
                Nenhuma documentação registrada.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- PÁGINA PRINCIPAL ---

export default function OSCsPage() {
  const [oscs, setOscs] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [expandedOscId, setExpandedOscId] = useState(null);

  const [searchName, setSearchName] = useState('');
  const [searchCnpj, setSearchCnpj] = useState('');
  const [searchResponsible, setSearchResponsible] = useState('');

  const [oscToView, setOscToView] = useState(null);
  const [oscToEdit, setOscToEdit] = useState(null);
  const [oscToSendAlert, setOscToSendAlert] = useState(null);

  const addNotification = useNotification();
  const { request: updateOSC, isLoading: isUpdating } = useApi(oscService.updateOSC);
  const { request: sendAlert, isLoading: isSendingAlert } = useApi(alertService.sendAlertToOSC);

  useEffect(() => {
    const fetchOSCs = async () => {
      setIsLoadingData(true);
      try {
        const response = await oscService.getMyOSCs();
        let data = [];
        if (Array.isArray(response)) data = response;
        else if (response?.data) data = Array.isArray(response.data) ? response.data : response.data.data || [];

        setOscs(data.sort((a, b) => (a.name || '').localeCompare(b.name || '')));
      } catch (err) {
        addNotification("Erro ao carregar OSCs.", "error");
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchOSCs();
  }, [addNotification]);

  const filteredOscs = oscs.filter(osc => {
    const nameMatch = osc.name?.toLowerCase().includes(searchName.toLowerCase());
    const cnpjMatch = osc.cnpj?.replace(/\D/g, '').includes(searchCnpj.replace(/\D/g, ''));
    const respMatch = !searchResponsible || osc.responsible?.toLowerCase().includes(searchResponsible.toLowerCase());
    return nameMatch && cnpjMatch && respMatch;
  });

  const handleToggleAccordion = (id) => setExpandedOscId(prevId => (prevId === id ? null : id));
  const handleCloseModals = () => { setOscToView(null); setOscToEdit(null); setOscToSendAlert(null); };
  const handleRegister = () => setOscToEdit({});

  const handleSaveEdit = async (formData) => {
    try {
      const isCreation = !formData.id;
      const response = await updateOSC(formData.id, formData);
      const updatedOSC = response.data || response; 
      setOscs(prev => isCreation ? [...prev, updatedOSC] : prev.map(o => o.id === updatedOSC.id ? updatedOSC : o));
      addNotification(`OSC salva com sucesso!`, 'success');
      handleCloseModals();
    } catch (err) { addNotification('Erro ao salvar.', 'error'); }
  };

  const handleSendAlertSubmit = async (formData) => {
    try {
      await sendAlert(formData);
      addNotification('Alerta enviado!', 'success');
      handleCloseModals();
    } catch (err) { addNotification('Erro ao enviar.', 'error'); }
  };

  if (isLoadingData) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><Spinner text="Carregando..." /></div>;

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h1 style={styles.title}>
          Organizações Cadastradas
          <div className="tooltip-container" style={styles.tooltipWrapper}>
            <IconInfo />
            <div className="tooltip-box" style={styles.tooltipBox}>
              Gerencie aqui todas as OSCs vinculadas à sua carteira. Você pode monitorar documentos, editar dados e enviar alertas de pendências.
            </div>
          </div>
        </h1>
        <button style={styles.registerBtn} onClick={handleRegister}>
          <IconPlus /> Cadastrar Nova OSC
        </button>
      </div>

      <div style={styles.searchRow}>
        <div style={styles.searchWrapper}>
          <div style={styles.searchIcon}><IconSearch /></div>
          <input type="text" placeholder="Nome da OSC..." style={styles.searchInput} value={searchName} onChange={(e) => setSearchName(e.target.value)} />
        </div>
        <div style={styles.searchWrapper}>
          <div style={styles.searchIcon}><IconSearch /></div>
          <input type="text" placeholder="CNPJ..." style={styles.searchInput} value={searchCnpj} onChange={(e) => setSearchCnpj(e.target.value)} />
        </div>
        <div style={styles.searchWrapper}>
          <div style={styles.searchIcon}><IconSearch /></div>
          <input type="text" placeholder="Responsável..." style={styles.searchInput} value={searchResponsible} onChange={(e) => setSearchResponsible(e.target.value)} />
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
                    onView={(o) => setOscToView(o)}
                    onEdit={(o) => setOscToEdit(o)}
                    onSendAlert={(o) => setOscToSendAlert(o)}
                />
            ))
        )}
      </div>

      {oscToView && <ViewOSCModal isOpen={!!oscToView} onClose={handleCloseModals} osc={oscToView} />}
      {oscToEdit && <EditOSCModal isOpen={!!oscToEdit} onClose={handleCloseModals} oscData={oscToEdit} onSave={handleSaveEdit} isLoading={isUpdating} />}
      {oscToSendAlert && <SendAlertModal isOpen={!!oscToSendAlert} onClose={handleCloseModals} osc={oscToSendAlert} onSend={handleSendAlertSubmit} isLoading={isSendingAlert} />}
    </div>
  );
}