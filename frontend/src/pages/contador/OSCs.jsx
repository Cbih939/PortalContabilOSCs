import React, { useState, useEffect } from 'react';
import * as oscService from '../../services/oscService.js';
import * as alertService from '../../services/alertService.js';
import * as docService from '../../services/documentService.js'; 
import api from '../../services/api.js';

import ViewOSCModal from './components/ViewOSCModal.jsx';
import EditOSCModal from './components/EditOSCModal.jsx';
import SendAlertModal from './components/SendAlertModal.jsx';

import Spinner from '../../components/common/Spinner.jsx';
import Button from '../../components/ui/Button.jsx';
import useApi from '../../hooks/useApi.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import styles from './OSCs.module.css';

import { 
  FiChevronDown, FiChevronUp, FiEdit2, FiEye, FiBell, 
  FiFileText, FiCheck, FiSearch, FiPlus, FiInfo, 
  FiUpload, FiTrash2, FiCornerUpLeft, FiDownload 
} from 'react-icons/fi';

const OSCAccordionItem = ({ osc, isExpanded, onToggle, onView, onEdit, onSendAlert, onDelete, onRefresh }) => {
  const addNotification = useNotification();
  const [isUploading, setIsUploading] = useState(false);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [actionMonths, setActionMonths] = useState([new Date().getMonth() + 1]);
  const [actionYear, setActionYear] = useState(new Date().getFullYear());
  const [selectedDocs, setSelectedDocs] = useState([]);

  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const years = [2024, 2025, 2026];

  const getOriginDate = () => {
    const rawDate = osc.data_origem_estatuto || osc.dataOrigemEstatuto || osc.data_fundacao || osc.dataFundacao || osc.created_at || osc.createdAt;
    if (!rawDate) return { year: 2000, month: 0 }; 
    if (typeof rawDate === 'string' && rawDate.includes('-')) {
        const parts = rawDate.split('T')[0].split('-');
        return { year: parseInt(parts[0], 10), month: parseInt(parts[1], 10) - 1 };
    }
    const d = new Date(rawDate);
    return { year: d.getFullYear(), month: d.getMonth() };
  };

  const originDate = getOriginDate();
  const isBeforeOrigin = (year, monthIndex) => year < originDate.year || (year === originDate.year && monthIndex < originDate.month);

  const toggleMonth = (m) => {
    if (isBeforeOrigin(actionYear, m - 1)) {
        addNotification("Este mês é anterior à origem da OSC.", "warning");
        return;
    }
    setActionMonths(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  const toggleAllMonths = () => {
    const validMonths = months.map((_, i) => i + 1).filter(m => !isBeforeOrigin(actionYear, m - 1));
    if (actionMonths.length === validMonths.length) setActionMonths([]);
    else setActionMonths(validMonths);
  };

  const handleConcludeMonths = async () => {
    if (actionMonths.length === 0) return addNotification("Selecione pelo menos um mês.", "error");
    if (!window.confirm(`Deseja marcar os ${actionMonths.length} meses selecionados do ano ${actionYear} como CONCLUÍDOS?`)) return;
    setIsUploading(true);
    try {
      await Promise.all(actionMonths.map(month => docService.markAsConcluded({ oscId: osc.id, month, year: actionYear })));
      addNotification(`Meses concluídos com sucesso!`, "success");
      onRefresh();
    } catch (err) { addNotification("Erro ao concluir período.", "error"); } 
    finally { setIsUploading(false); }
  };

  const handlePendingMonths = async () => {
    if (actionMonths.length === 0) return addNotification("Selecione pelo menos um mês.", "error");
    if (!window.confirm(`Deseja reverter os ${actionMonths.length} meses selecionados para PENDENTE?\nIsto anula a marcação de Concluído e apaga os históricos de TEC desse período.`)) return;
    setIsUploading(true);
    try {
      await Promise.all(actionMonths.map(month => docService.markAsPending({ oscId: osc.id, month, year: actionYear })));
      addNotification(`Meses revertidos para PENDENTE com sucesso!`, "success");
      onRefresh();
    } catch (err) { addNotification("Erro ao reverter para pendente.", "error"); } 
    finally { setIsUploading(false); }
  };

  const handleUpload = async (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;
    if (actionMonths.length === 0) {
      e.target.value = "";
      return addNotification("Selecione pelo menos um mês no painel de ações antes de enviar o arquivo.", "error");
    }
    setIsUploading(true);
    try {
      await Promise.all(actionMonths.map(month => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('osc_id', osc.id);
        formData.append('doc_type', docType); 
        formData.append('ref_month', month);
        formData.append('ref_year', actionYear);
        return docService.uploadDocument(formData);
      }));
      addNotification(`Documento enviado com sucesso para ${actionMonths.length} meses!`, "success");
      onRefresh();
    } catch (err) { addNotification("Erro ao enviar documento.", "error"); } 
    finally { setIsUploading(false); e.target.value = ""; }
  };

  const handleDeleteDocument = async (e, docId, docName) => {
    e.stopPropagation(); 
    if (!window.confirm(`Tem certeza que deseja excluir o documento:\n"${docName}"?\n\nEsta ação não pode ser desfeita.`)) return;
    try {
      await docService.deleteDocument(docId);
      addNotification("Documento excluído com sucesso.", "success");
      setSelectedDocs(prev => prev.filter(id => id !== docId));
      onRefresh();
    } catch (err) { addNotification("Erro ao excluir o documento.", "error"); }
  };

  const handleBulkDelete = async () => {
    if (selectedDocs.length === 0) return;
    if (!window.confirm(`Excluir ${selectedDocs.length} documento(s) selecionado(s)?\nEsta ação não tem volta.`)) return;
    setIsUploading(true);
    try {
      await Promise.all(selectedDocs.map(id => docService.deleteDocument(id)));
      addNotification(`${selectedDocs.length} documentos excluídos com sucesso.`, "success");
      setSelectedDocs([]);
      onRefresh();
    } catch (err) { addNotification("Erro ao excluir alguns documentos.", "error"); } 
    finally { setIsUploading(false); }
  };

  const handleToggleSelectDoc = (docId) => setSelectedDocs(prev => prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]);

  const handleSelectAllDocs = (docsList) => {
    const listIds = docsList.map(d => d.id);
    const allSelected = listIds.every(id => selectedDocs.includes(id));
    if (allSelected) setSelectedDocs(prev => prev.filter(id => !listIds.includes(id)));
    else setSelectedDocs(prev => [...new Set([...prev, ...listIds])]);
  };

  const openDocument = async (doc) => {
    if (!doc) return;
    if (doc.doc_type === 'CONCLUSO TEC' && (!doc.file_path || doc.file_path === 'none' || doc.file_path.startsWith('tec_virtual'))) {
      alert("Este é um registro de Histórico (TEC) sem arquivo físico.");
      return;
    }
    try {
      const fileBlob = await docService.downloadDocument(doc.id);
      const fileURL = window.URL.createObjectURL(new Blob([fileBlob], { type: doc.mime_type || 'application/pdf' }));
      const link = document.createElement('a');
      link.href = fileURL; link.target = '_blank';
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(fileURL), 10000);
    } catch (error) { alert("Não foi possível carregar o arquivo."); }
  };

  const getMonthStatus = (monthIndex) => {
    if (isBeforeOrigin(viewYear, monthIndex)) return 'pre_origin';
    const monthNum = monthIndex + 1;
    const docsInMonth = osc.documents ? osc.documents.filter(d => parseInt(d.ref_month) === monthNum && parseInt(d.ref_year) === viewYear) : [];
    const hasDoc = docsInMonth.length > 0;
    const hasConclusoTec = hasDoc && docsInMonth.some(d => d.doc_type === 'CONCLUSO TEC');
    const isVerified = hasDoc && docsInMonth.some(d => d.status === 'CONCLUIDO');
    
    if (hasConclusoTec) return 'concluso_tec'; 
    if (isVerified) return 'concluded'; 
    if (hasDoc) return 'sent';           
    
    const now = new Date();
    if (viewYear === now.getFullYear() && monthIndex === now.getMonth()) return 'pending';
    if (viewYear < now.getFullYear() || (viewYear === now.getFullYear() && monthIndex < now.getMonth())) return 'late';
    return 'future';
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pre_origin': return { bg: '#f3f4f6', color: '#9ca3af', border: '#e5e7eb' };
      case 'late': return { bg: '#fee2e2', color: '#b91c1c', border: '#fecaca' };
      case 'pending': return { bg: '#fef9c3', color: '#a16207', border: '#fde047' };
      case 'sent': return { bg: '#dbeafe', color: '#1d4ed8', border: '#bfdbfe' };
      case 'concluded': return { bg: '#dcfce7', color: '#15803d', border: '#86efac' };
      case 'concluso_tec': return { bg: '#f3e8ff', color: '#7e22ce', border: '#e9d5ff' };
      default: return { bg: '#f3f4f6', color: '#9ca3af', border: '#e5e7eb' };
    }
  };

  const getStatusLabel = (status) => {
    if (status === 'pre_origin') return '-';
    switch (status) {
      case 'late': return 'Atraso';
      case 'pending': return 'Aberto';
      case 'sent': return 'Enviado';
      case 'concluded': return 'Concluso'; 
      case 'concluso_tec': return 'Concluso TEC'; 
      default: return '-';
    }
  };

  const sortedDocsInViewYear = osc.documents ? [...osc.documents].filter(d => parseInt(d.ref_year) === viewYear).sort((a, b) => parseInt(b.ref_month || 0) - parseInt(a.ref_month || 0)) : [];
  const docsContabil = sortedDocsInViewYear.filter(d => ['MENSAL', 'RELATORIO'].includes(d.doc_type));
  const docsGov = sortedDocsInViewYear.filter(d => ['FIXO', 'CERTIFICACAO'].includes(d.doc_type));
  const docsTec = sortedDocsInViewYear.filter(d => d.doc_type === 'CONCLUSO TEC');

  return (
    <div className={`${styles.accordionItem} ${isExpanded ? styles.expanded : ''}`}>
      <div className={styles.accordionHeader} onClick={() => onToggle(osc.id)}>
        <div className={styles.oscInfo}>
          <span className={styles.oscName}>
            {osc.name || osc.razao_social}
            {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
          </span>
          <span className={styles.oscCnpj}>CNPJ: {osc.cnpj || 'Não informado'}</span>
        </div>
        <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
          <button className={`${styles.actionBtn} ${styles.view}`} onClick={() => onView(osc)} title="Ver Detalhes"><FiEye /></button>
          <button className={`${styles.actionBtn} ${styles.edit}`} onClick={() => onEdit(osc)} title="Editar Dados"><FiEdit2 /></button>
          <button className={`${styles.actionBtn} ${styles.alert}`} onClick={() => onSendAlert(osc)} title="Enviar Alerta"><FiBell /></button>
          <button className={`${styles.actionBtn} ${styles.delete}`} onClick={() => onDelete(osc)} title="Excluir Organização"><FiTrash2 /></button>
        </div>
      </div>

      {isExpanded && (
        <div className={styles.accordionBody}>
          
          <div className={styles.actionPanel}>
            <div className={styles.panelRow}>
              <span className={styles.panelLabel}>Ano de Referência:</span>
              <select className={styles.selectInput} value={actionYear} onChange={(e) => setActionYear(parseInt(e.target.value))}>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <span className={styles.panelLabel} style={{marginBottom: '8px'}}>1. Selecione os Meses:</span>
              <div className={styles.monthGrid}>
                <button onClick={toggleAllMonths} className={styles.monthBtn}>Todos</button>
                {months.map((m, i) => {
                  const isPre = isBeforeOrigin(actionYear, i);
                  return (
                    <button 
                      key={m} 
                      onClick={() => toggleMonth(i+1)}
                      title={isPre ? "Mês anterior à criação da OSC" : ""}
                      className={`${styles.monthBtn} ${actionMonths.includes(i+1) ? styles.active : ''}`}
                      disabled={isPre}
                    >
                      {m}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className={styles.panelDivider}></div>
            
            <span className={styles.panelLabel}>2. Escolha a ação para os meses selecionados:</span>
            <div className={styles.actionButtons}>
              <Button variant="success" icon={<FiCheck />} onClick={handleConcludeMonths} disabled={isUploading}>
                Concluir Manualmente
              </Button>
              <Button variant="warning" icon={<FiCornerUpLeft />} onClick={handlePendingMonths} disabled={isUploading}>
                Voltar para Pendente
              </Button>
              <Button variant="secondary" icon={<FiDownload />} disabled={isUploading} onClick={async () => {
                if (actionMonths.length === 0) return addNotification("Selecione pelo menos um mês.", "error");
                setIsUploading(true);
                try {
                  for (const m of actionMonths) await docService.downloadMonthZip(osc.id, m, actionYear);
                  addNotification("Downloads iniciados!", "success");
                } catch (e) { addNotification("Erro ao baixar ZIP.", "error"); } 
                finally { setIsUploading(false); }
              }}>
                Baixar Lote (.zip)
              </Button>
              
              <label>
                <Button variant="primary" icon={<FiUpload />} disabled={isUploading} as="span">Enviar Doc. Contábil</Button>
                <input type="file" style={{ display: 'none' }} onChange={(e) => handleUpload(e, 'MENSAL')} disabled={isUploading} />
              </label>
              <label>
                <Button variant="success" icon={<FiUpload />} disabled={isUploading} as="span">Enviar Doc. Governança</Button>
                <input type="file" style={{ display: 'none' }} onChange={(e) => handleUpload(e, 'FIXO')} disabled={isUploading} />
              </label>
              <label>
                <Button variant="danger" icon={<FiUpload />} disabled={isUploading} as="span" style={{backgroundColor: '#7e22ce', borderColor: '#7e22ce'}}>Enviar Histórico TEC</Button>
                <input type="file" style={{ display: 'none' }} onChange={(e) => handleUpload(e, 'CONCLUSO TEC')} disabled={isUploading} />
              </label>
            </div>
          </div>

          <div className={styles.legend}>
            <div className={styles.legendItem}><div className={styles.colorBox} style={{backgroundColor: '#fee2e2'}}></div> Em Atraso</div>
            <div className={styles.legendItem}><div className={styles.colorBox} style={{backgroundColor: '#fef9c3'}}></div> Pendente</div>
            <div className={styles.legendItem}><div className={styles.colorBox} style={{backgroundColor: '#dbeafe'}}></div> Enviado</div>
            <div className={styles.legendItem}><div className={styles.colorBox} style={{backgroundColor: '#dcfce7'}}></div> Concluso</div>
            <div className={styles.legendItem}><div className={styles.colorBox} style={{backgroundColor: '#f3e8ff'}}></div> Concluso TEC</div>
          </div>

          <h4 className={styles.sectionTitle}>
            Calendário de Conformidade - Ano: 
            <select className={styles.selectInput} style={{marginLeft: '10px'}} value={viewYear} onChange={(e) => setViewYear(parseInt(e.target.value))}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </h4>

          <div className={styles.calendarGrid}>
            {months.map((m, idx) => {
              const status = getMonthStatus(idx);
              const isPreOrigin = status === 'pre_origin';
              const isExactOrigin = viewYear === originDate.year && idx === originDate.month;
              const {bg, color, border} = getStatusStyle(status);
              
              return (
                <div key={m} className={styles.monthBox} style={{ backgroundColor: bg, borderColor: border, color: color, opacity: isPreOrigin ? 0.4 : 1 }}>
                  <span className={styles.monthBoxText}>{m}</span>
                  <span className={styles.monthBoxStatus}>{getStatusLabel(status)}</span>
                  {isExactOrigin && <span className={styles.originBadge}>ORIGEM</span>}
                </div>
              )
            })}
          </div>

          {selectedDocs.length > 0 && (
            <div style={{ padding: '10px 15px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '13px', color: '#b91c1c', fontWeight: 'bold' }}>
                {selectedDocs.length} documento(s) selecionado(s) para exclusão.
              </span>
              <Button variant="danger" size="sm" icon={<FiTrash2 />} onClick={handleBulkDelete} disabled={isUploading}>
                Excluir Selecionados
              </Button>
            </div>
          )}

          {/* SECÇÃO CONTÁBIL */}
          <h4 className={styles.sectionTitle}><FiFileText /> DOCUMENTAÇÃO | CONTÁBIL (Mensal)</h4>
          <div className={styles.docList}>
            {docsContabil.length > 0 && (
              <div className={styles.docListHeader}>
                <input type="checkbox" checked={docsContabil.every(d => selectedDocs.includes(d.id))} onChange={() => handleSelectAllDocs(docsContabil)} />
                <span>Selecionar todos Contábeis</span>
              </div>
            )}
            {docsContabil.length > 0 ? (
              docsContabil.map((doc, i) => (
                <div key={i} className={styles.docItem}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input type="checkbox" checked={selectedDocs.includes(doc.id)} onChange={(e) => { e.stopPropagation(); handleToggleSelectDoc(doc.id); }} />
                    <div className={styles.docMain} onClick={() => openDocument(doc)}>
                      <FiFileText /> <span>{doc.original_name}</span>
                    </div>
                  </div>
                  <div className={styles.docMeta}>
                    <span className={styles.docRef}>Ref: {months[(doc.ref_month || 1) - 1]}/{doc.ref_year}</span>
                    <span className={styles.typeBadge} style={{backgroundColor: '#e0e7ff', color: '#3730a3'}}>CONTÁBIL</span>
                    <span className={styles.docDate}>Postado: {new Date(doc.createdAt || doc.created_at).toLocaleDateString('pt-BR')}</span>
                    <button className={styles.deleteBtn} onClick={(e) => handleDeleteDocument(e, doc.id, doc.original_name)} title="Excluir documento"><FiTrash2 /></button>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>Sem registros contábeis enviados no ano de {viewYear}.</div>
            )}
          </div>

          {/* SECÇÃO GOVERNANÇA */}
          <h4 className={styles.sectionTitle}><FiFileText /> DOCUMENTAÇÃO | GOVERNANÇA (Fixo)</h4>
          <div className={styles.docList}>
            {docsGov.length > 0 && (
              <div className={styles.docListHeader}>
                <input type="checkbox" checked={docsGov.every(d => selectedDocs.includes(d.id))} onChange={() => handleSelectAllDocs(docsGov)} />
                <span>Selecionar todos de Governança</span>
              </div>
            )}
            {docsGov.length > 0 ? (
              docsGov.map((doc, i) => (
                <div key={i} className={styles.docItem}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input type="checkbox" checked={selectedDocs.includes(doc.id)} onChange={(e) => { e.stopPropagation(); handleToggleSelectDoc(doc.id); }} />
                    <div className={styles.docMain} onClick={() => openDocument(doc)}>
                      <FiFileText /> <span>{doc.original_name}</span>
                    </div>
                  </div>
                  <div className={styles.docMeta}>
                    <span className={styles.docRef}>Ref: {months[(doc.ref_month || 1) - 1]}/{doc.ref_year}</span>
                    <span className={styles.typeBadge} style={{backgroundColor: '#fef3c7', color: '#92400e'}}>GOVERNANÇA</span>
                    <span className={styles.docDate}>Postado: {new Date(doc.createdAt || doc.created_at).toLocaleDateString('pt-BR')}</span>
                    <button className={styles.deleteBtn} onClick={(e) => handleDeleteDocument(e, doc.id, doc.original_name)} title="Excluir documento"><FiTrash2 /></button>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>Sem registros de governança enviados no ano de {viewYear}.</div>
            )}
          </div>

          {/* SECÇÃO TEC */}
          {docsTec.length > 0 && (
            <>
              <h4 className={styles.sectionTitle}><FiFileText /> DOCUMENTAÇÃO | HISTÓRICO TEC</h4>
              <div className={styles.docList}>
                <div className={styles.docListHeader}>
                  <input type="checkbox" checked={docsTec.every(d => selectedDocs.includes(d.id))} onChange={() => handleSelectAllDocs(docsTec)} />
                  <span>Selecionar todos TEC</span>
                </div>
                {docsTec.map((doc, i) => (
                  <div key={i} className={styles.docItem}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input type="checkbox" checked={selectedDocs.includes(doc.id)} onChange={(e) => { e.stopPropagation(); handleToggleSelectDoc(doc.id); }} />
                      <div className={styles.docMain} onClick={() => openDocument(doc)} style={{color: '#7e22ce'}}>
                        <FiFileText /> <span>{doc.original_name}</span>
                      </div>
                    </div>
                    <div className={styles.docMeta}>
                      <span className={styles.docRef}>Ref: {months[(doc.ref_month || 1) - 1]}/{doc.ref_year}</span>
                      <span className={styles.typeBadge} style={{backgroundColor: '#f3e8ff', color: '#7e22ce'}}>CONCLUSO TEC</span>
                      <span className={styles.docDate}>Postado: {new Date(doc.createdAt || doc.created_at).toLocaleDateString('pt-BR')}</span>
                      <button className={styles.deleteBtn} onClick={(e) => handleDeleteDocument(e, doc.id, doc.original_name)} title="Excluir documento"><FiTrash2 /></button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

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
  const [showOnlyPending, setShowOnlyPending] = useState(false);
  const [oscToView, setOscToView] = useState(null);
  const [oscToEdit, setOscToEdit] = useState(null);
  const [oscToSendAlert, setOscToSendAlert] = useState(null);

  const addNotification = useNotification();
  const { request: updateOSC, isLoading: isUpdating } = useApi(oscService.updateOSC);
  const { request: createOSC, isLoading: isCreating } = useApi(oscService.createOSC);
  const { request: sendAlert, isLoading: isSendingAlert } = useApi(alertService.sendAlertToOSC);

  const fetchOSCs = async () => {
    setIsLoadingData(true);
    try {
      const response = await oscService.getMyOSCs();
      let data = Array.isArray(response) ? response : (response?.data || []);
      const sortedData = data.map(osc => ({ ...osc, documents: osc.documents ? [...osc.documents] : [] }));
      setOscs(sortedData.sort((a, b) => (a.name || a.razao_social || '').localeCompare(b.name || b.razao_social || '')));
    } catch (err) { addNotification("Erro ao carregar OSCs.", "error"); setOscs([]); } 
    finally { setIsLoadingData(false); }
  };

  useEffect(() => { fetchOSCs(); }, []);

  const handleDeleteOSC = async (osc) => {
    const confirmMsg = `ATENÇÃO EXTREMA!\n\nTem certeza que deseja excluir definitivamente a organização "${osc.name || osc.razao_social}"?\n\nTODOS os documentos, históricos e dados serão apagados. Esta ação NÃO pode ser desfeita.`;
    if (!window.confirm(confirmMsg)) return;
    try {
      await api.delete(`/oscs/${osc.id}`);
      addNotification("Organização excluída com sucesso!", "success");
      fetchOSCs();
    } catch (err) { addNotification(err.response?.data?.message || "Erro ao excluir a organização.", "error"); }
  };

  const filteredOscs = oscs.filter(osc => {
    const nameMatch = (osc.name || osc.razao_social || '').toLowerCase().includes(searchName.toLowerCase());
    const cnpjMatch = (osc.cnpj || '').replace(/\D/g, '').includes(searchCnpj.replace(/\D/g, ''));
    
    let hasPending = false;
    if (showOnlyPending) {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth(); 
      
      const rawDate = osc.data_origem_estatuto || osc.dataOrigemEstatuto || osc.data_fundacao || osc.dataFundacao || osc.created_at || osc.createdAt;
      let oY = 2000, oM = 0;
      if (rawDate) {
         if (typeof rawDate === 'string' && rawDate.includes('-')) {
            const pts = rawDate.split('T')[0].split('-');
            oY = parseInt(pts[0], 10); oM = parseInt(pts[1], 10) - 1;
         } else {
            const d = new Date(rawDate); oY = d.getFullYear(); oM = d.getMonth();
         }
      }

      for (let i = 0; i <= currentMonth; i++) {
        if (currentYear < oY || (currentYear === oY && i < oM)) continue;
        const monthNum = i + 1;
        const docsInMonth = osc.documents ? osc.documents.filter(d => parseInt(d.ref_month) === monthNum && parseInt(d.ref_year) === currentYear) : [];
        const hasDoc = docsInMonth.length > 0;
        const hasConclusoTec = hasDoc && docsInMonth.some(d => d.doc_type === 'CONCLUSO TEC');
        const isVerified = hasDoc && docsInMonth.some(d => d.status === 'CONCLUIDO');
        if (!hasConclusoTec && !isVerified) { hasPending = true; break; }
      }
    }
    return nameMatch && cnpjMatch && (!showOnlyPending || hasPending);
  });

  const handleToggleAccordion = (id) => setExpandedOscId(prevId => (prevId === id ? null : id));
  const handleCloseModals = () => { setOscToView(null); setOscToEdit(null); setOscToSendAlert(null); };

  const handleSaveEdit = async (formData) => {
    const oscId = formData.id;
    const payload = { ...formData, responsavel: formData.responsible || formData.responsavel, razao_social: formData.name };
    
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
    } catch (err) { addNotification(err.response?.data?.message || 'Erro ao salvar no servidor.', 'error'); }
  };

  const handleSendAlertSubmit = async (alertData) => {
    try {
      await sendAlert(alertData);
      addNotification("Alerta enviado com sucesso!", "success");
      handleCloseModals();
    } catch (err) { addNotification("Erro ao enviar alerta.", "error"); }
  };

  const getDelayCount = (osc) => {
    let delayCount = 0;
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    const rawDate = osc.data_origem_estatuto || osc.dataOrigemEstatuto || osc.data_fundacao || osc.dataFundacao || osc.created_at || osc.createdAt;
    let oY = 2000, oM = 0;
    if (rawDate) {
      if (typeof rawDate === 'string' && rawDate.includes('-')) {
        const pts = rawDate.split('T')[0].split('-');
        oY = parseInt(pts[0], 10); oM = parseInt(pts[1], 10) - 1;
      } else {
        const d = new Date(rawDate); oY = d.getFullYear(); oM = d.getMonth();
      }
    }

    for (let i = 0; i < currentMonth; i++) {
      if (currentYear < oY || (currentYear === oY && i < oM)) continue;
      const monthNum = i + 1;
      const docsInMonth = osc.documents ? osc.documents.filter(d => parseInt(d.ref_month) === monthNum && parseInt(d.ref_year) === currentYear) : [];
      const hasDoc = docsInMonth.length > 0;
      const hasConclusoTec = hasDoc && docsInMonth.some(d => d.doc_type === 'CONCLUSO TEC');
      const isVerified = hasDoc && docsInMonth.some(d => d.status === 'CONCLUIDO');
      if (!hasConclusoTec && !isVerified) delayCount++;
    }
    return delayCount;
  };

  const topDelayedOscs = [...oscs].map(osc => ({ ...osc, delayCount: getDelayCount(osc) })).filter(osc => osc.delayCount > 0).sort((a, b) => b.delayCount - a.delayCount).slice(0, 3);

  if (isLoadingData) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><Spinner text="Carregando..." /></div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.pageTitle}>Minhas Organizações (OSCs)</h1>
          <div className={styles.tooltipContainer}>
            <FiInfo className={styles.infoIcon} />
            <div className={styles.tooltipText}>Gerencie suas organizações, valide envios e monitore a conformidade contábil.</div>
          </div>
        </div>
        <Button variant="primary" icon={<FiPlus />} onClick={() => setOscToEdit({})}>
          Cadastrar Nova OSC
        </Button>
      </div>

      {topDelayedOscs.length > 0 && (
        <div className={styles.alertBox}>
          <h3><FiBell /> SINAL DE ALERTA: OSCs com mais pendências no ano</h3>
          <div className={styles.alertBoxList}>
            {topDelayedOscs.map((osc, idx) => (
              <div key={osc.id} className={styles.alertBoxItem}>
                <span className={styles.alertBoxOscName}>{idx + 1}. {osc.name || osc.razao_social}</span>
                <span className={styles.alertBoxDelay}>{osc.delayCount} meses atrasados</span>
                <Button variant="danger" size="sm" onClick={() => setOscToSendAlert(osc)} style={{marginTop: '4px'}}>Cobrar Agora</Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.searchRow}>
        <div className={styles.searchWrapper}>
          <div className={styles.searchIcon}><FiSearch /></div>
          <input type="text" placeholder="Pesquisar por Nome..." className={styles.searchInput} value={searchName} onChange={(e) => setSearchName(e.target.value)} />
        </div>
        <div className={styles.searchWrapper}>
          <div className={styles.searchIcon}><FiSearch /></div>
          <input type="text" placeholder="Pesquisar por CNPJ..." className={styles.searchInput} value={searchCnpj} onChange={(e) => setSearchCnpj(e.target.value)} />
        </div>
        
        <label className={`${styles.filterCheckboxContainer} ${showOnlyPending ? styles.active : ''}`}>
          <input type="checkbox" checked={showOnlyPending} onChange={(e) => setShowOnlyPending(e.target.checked)} style={{ cursor: 'pointer', accentColor: '#dc2626' }} />
          <span className={styles.filterCheckboxLabel}>Apenas com Pendências</span>
        </label>
      </div>

      <div className={styles.oscList}>
        {filteredOscs.length === 0 ? (
            <div className={styles.emptyState}>
              {showOnlyPending ? "Todas as OSCs encontradas estão em dia! 🎉" : "Nenhuma OSC encontrada."}
            </div>
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
                    onDelete={() => handleDeleteOSC(osc)}
                    onRefresh={fetchOSCs}
                />
            ))
        )}
      </div>

      {oscToView && <ViewOSCModal isOpen={!!oscToView} onClose={handleCloseModals} osc={oscToView} />}
      {oscToEdit && <EditOSCModal isOpen={!!oscToEdit} onClose={handleCloseModals} oscData={oscToEdit} onSave={handleSaveEdit} isLoading={isUpdating || isCreating} />}
      {oscToSendAlert && <SendAlertModal isOpen={!!oscToSendAlert} onClose={handleCloseModals} osc={oscToSendAlert} onSend={handleSendAlertSubmit} isLoading={isSendingAlert} />}
    </div>
  );
}