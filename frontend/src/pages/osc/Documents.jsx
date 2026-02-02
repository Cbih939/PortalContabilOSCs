// src/pages/osc/Documents.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import useApi from '../../hooks/useApi.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { Link } from 'react-router-dom';
import * as docService from '../../services/documentService.js';
import DocumentUpload from './components/DocumentUpload.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { FileIcon, DownloadIcon } from '../../components/common/Icons.jsx';
import styles from './Documents.module.css';

// Ícone de Informação Local
const InfoIcon = () => (
  <svg 
    style={{ width: '16px', height: '16px', color: '#EC6D12', cursor: 'help' }} 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Estilos para o Calendário
const calStyles = {
  legend: { display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', fontSize: '11px', color: '#555', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #eee' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '6px' },
  colorBox: (bg, border) => ({ width: '10px', height: '10px', backgroundColor: bg, border: `1px solid ${border}`, borderRadius: '2px' }),
  sectionTitle: { fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' },
  calendarGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))', gap: '8px', marginBottom: '24px' },
  monthBox: (bg, color, border) => ({ backgroundColor: bg, color: color, border: `1px solid ${border}`, borderRadius: '6px', padding: '8px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50px' }),
  monthText: { fontSize: '12px', fontWeight: 'bold' },
  statusText: { fontSize: '9px', fontWeight: '600', marginTop: '2px', textTransform: 'uppercase' },
  periodSelector: { marginBottom: '15px', padding: '12px', backgroundColor: '#fff7ed', borderRadius: '8px', border: '1px solid #ffedd5' }
};

export default function OSCDocumentsPage() {
  const { user } = useAuth();
  const addNotification = useNotification();

  const [myFiles, setMyFiles] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [errorLoading, setErrorLoading] = useState(null);
  
  // ESTADOS DE COMPETÊNCIA
  const [docType, setDocType] = useState('MENSAL');
  const [refMonth, setRefMonth] = useState(new Date().getMonth() + 1);
  const [refYear, setRefYear] = useState(new Date().getFullYear());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());

  const { request: uploadFile, isLoading: isUploading } = useApi(docService.uploadDocument);

  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const years = [2024, 2025, 2026];

  // --- LÓGICA DO CALENDÁRIO BASEADA EM REFERÊNCIA ---
  const getMonthStatus = (monthIndex) => {
    const monthNum = monthIndex + 1;
    
    // Filtra documentos pela competência selecionada no visualizador
    const docsInMonth = myFiles.filter(d => d.ref_month === monthNum && d.ref_year === viewYear);

    const hasDoc = docsInMonth.length > 0;
    const isVerified = hasDoc && docsInMonth.some(d => d.status === 'CONCLUIDO');

    if (isVerified) return 'concluded';
    if (hasDoc) return 'sent';
    
    // Lógica de atraso ou pendência baseada na data atual do sistema
    const now = new Date();
    const isCurrentMonth = viewYear === now.getFullYear() && monthIndex === now.getMonth();
    const isPast = viewYear < now.getFullYear() || (viewYear === now.getFullYear() && monthIndex < now.getMonth());

    if (isCurrentMonth) return 'pending';
    if (isPast) return 'late';
    return 'future';
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

  const fetchDocuments = async () => {
    setIsLoadingList(true);
    setErrorLoading(null);
    try {
      const response = await docService.getMyDocuments();
      const docs = Array.isArray(response) ? response : (response.data || []);
      // Ordena por competência (mais recente primeiro)
      const sortedData = docs.sort((a, b) => {
        if (b.ref_year !== a.ref_year) return b.ref_year - a.ref_year;
        return b.ref_month - a.ref_month;
      });
      setMyFiles(sortedData);
    } catch (err) {
      setErrorLoading("Não foi possível carregar os documentos.");
      addNotification("Erro ao carregar documentos.", "error");
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    if(user?.id) fetchDocuments();
  }, [user?.id]);

  const handleFileUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('doc_type', docType);
      formData.append('ref_month', refMonth);
      formData.append('ref_year', refYear);
      
      await uploadFile(formData);
      addNotification(`Ficheiro enviado para o período ${refMonth}/${refYear}!`, 'success');
      await fetchDocuments();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      addNotification(`Falha no upload: ${errorMsg}`, 'error');
    }
  };

  const handleDownload = async (file) => {
    try {
      await docService.downloadDocument(file.id, file.original_name || file.name);
    } catch (err) {
      addNotification('Erro ao descarregar ficheiro.', 'error');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.grid}>
        
        {/* Coluna 1: Info e Upload */}
        <div className={styles.uploadColumn}>
          <div className={`${styles.infoCard} mb-8`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <p className={styles.welcomeText}>
                Espaço para compartilhamento de documentos oficiais. 
                Selecione o <strong>Mês e Ano</strong> antes de enviar.
              </p>
              <div className={styles.tooltipContainer}>
                <InfoIcon />
                <span className={styles.tooltipText} style={{ top: '150%', bottom: 'auto', transform: 'translateX(-90%)' }}>
                  Documentação Mensal: limitada a 20 arquivos. O envio retroativo é permitido selecionando o ano anterior.
                </span>
              </div>
            </div>
            
            {/* SELETORES DE COMPETÊNCIA PARA UPLOAD */}
            <div style={calStyles.periodSelector}>
                <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', color: '#ea580c' }}>1. TIPO DE DOCUMENTO</label>
                    <select 
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                    >
                        <option value="MENSAL">Envio Mensal (Contábil)</option>
                        <option value="FIXO">Documento Fixo (Permanente)</option>
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', color: '#ea580c' }}>2. MÊS REF.</label>
                        <select 
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                            value={refMonth}
                            onChange={(e) => setRefMonth(parseInt(e.target.value))}
                        >
                            {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                        </select>
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', color: '#ea580c' }}>3. ANO REF.</label>
                        <select 
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                            value={refYear}
                            onChange={(e) => setRefYear(parseInt(e.target.value))}
                        >
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <p className={styles.infoText}><strong>Organização:</strong> {user?.name}</p>
            <p className={styles.infoText}><strong>CNPJ:</strong> {user?.cnpj || 'Não informado'}</p>
          </div>
          
          <DocumentUpload onUpload={handleFileUpload} isLoading={isUploading} />
        </div>

        {/* Coluna 2: Calendário + Lista de Documentos */}
        <div className={`${styles.listCard} ${styles.listColumn}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 className={styles.cardTitle} style={{ margin: 0 }}>Meus Documentos</h2>
            
            {/* SELETOR DE ANO PARA VISUALIZAÇÃO */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Ano:</span>
              <select 
                style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
                value={viewYear}
                onChange={(e) => setViewYear(parseInt(e.target.value))}
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* === CALENDÁRIO FILTRADO POR ANO === */}
          <div style={{marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px'}}>
            <h4 style={calStyles.sectionTitle}>
              Situação em {viewYear}
            </h4>
            
            <div style={calStyles.legend}>
                {['late', 'pending', 'sent', 'concluded'].map(s => (
                    <div key={s} style={calStyles.legendItem}>
                        <div style={calStyles.colorBox(getStatusStyle(s)[0], getStatusStyle(s)[2])}></div> {getStatusLabel(s)}
                    </div>
                ))}
            </div>

            <div style={calStyles.calendarGrid}>
                {months.map((m, idx) => {
                    const status = getMonthStatus(idx);
                    const [bg, color, border] = getStatusStyle(status);
                    return (
                        <div key={m} style={calStyles.monthBox(bg, color, border)}>
                            <span style={calStyles.monthText}>{m}</span>
                            <span style={calStyles.statusText}>{getStatusLabel(status)}</span>
                        </div>
                    )
                })}
            </div>
          </div>

          {/* === LISTA DE DOCUMENTOS === */}
          {isLoadingList ? (
            <div className={styles.loadingContainer}><Spinner text="A carregar..." /></div>
          ) : errorLoading ? (
            <div className={styles.emptyContainer} style={{color: 'red'}}>{errorLoading}</div>
          ) : myFiles.filter(f => f.ref_year === viewYear).length === 0 ? (
            <div className={styles.emptyContainer}><p>Nenhum documento referente a {viewYear}.</p></div>
          ) : (
            <div className={styles.fileListContainer}>
              {myFiles.filter(f => f.ref_year === viewYear).map((file) => (
                <div key={file.id} className={styles.fileItem}>
                  <div className={styles.fileInfo}>
                    <FileIcon className={styles.fileIcon} />
                    <div className={styles.fileText}>
                      <span className={styles.fileName}>
                        {file.original_name || file.name}
                        <span style={{ fontSize: '10px', marginLeft: '8px', color: file.doc_type === 'FIXO' ? '#4f46e5' : '#92400e', fontWeight: 'bold' }}>
                            [{file.doc_type || 'MENSAL'}]
                        </span>
                      </span>
                      <span className={styles.fileDate}>
                        Ref: {months[file.ref_month - 1]}/{file.ref_year} • Enviado em {new Date(file.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => handleDownload(file)} className={styles.downloadButton} title="Descarregar">
                    <DownloadIcon className={styles.icon} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}