import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import useApi from '../../hooks/useApi.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { Link } from 'react-router-dom';
import * as docService from '../../services/documentService.js';
import DocumentUpload from './components/DocumentUpload.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { FileIcon, DownloadIcon } from '../../components/common/Icons.jsx';
import { formatDate } from '../../utils/formatDate.js';
import styles from './Documents.module.css';

// Ícone de Informação Local (Reutilizado para Tooltips)
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

// Estilos dinâmicos para o Calendário de Situação
const calStyles = {
  legend: { display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', fontSize: '11px', color: '#555', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #eee' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '6px' },
  colorBox: (bg, border) => ({ width: '10px', height: '10px', backgroundColor: bg, border: `1px solid ${border}`, borderRadius: '2px' }),
  sectionTitle: { fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' },
  calendarGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))', gap: '8px', marginBottom: '24px' },
  monthBox: (bg, color, border) => ({ backgroundColor: bg, color: color, border: `1px solid ${border}`, borderRadius: '6px', padding: '8px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50px' }),
  monthText: { fontSize: '12px', fontWeight: 'bold' },
  statusText: { fontSize: '9px', fontWeight: '600', marginTop: '2px', textTransform: 'uppercase' }
};

export default function OSCDocumentsPage() {
  const { user } = useAuth();
  const addNotification = useNotification();
  const [myFiles, setMyFiles] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [errorLoading, setErrorLoading] = useState(null);

  const { request: uploadFile, isLoading: isUploading } = useApi(docService.uploadDocument);

  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const currentMonthIndex = new Date().getMonth();

  // --- LÓGICA DE STATUS DO CALENDÁRIO ---
  const getMonthStatus = (monthIndex) => {
    if (monthIndex > currentMonthIndex) return 'future';
    const docsInMonth = myFiles.filter(d => {
      const dateStr = d.date || d.created_at;
      return dateStr && new Date(dateStr).getMonth() === monthIndex;
    });
    if (monthIndex === currentMonthIndex && docsInMonth.length === 0) return 'pending';
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

  // --- BUSCA DE DOCUMENTOS ---
  const fetchDocuments = async () => {
    setIsLoadingList(true);
    setErrorLoading(null);
    try {
      const response = await docService.getMyDocuments();
      const docs = Array.isArray(response) ? response : (response.data || []);
      setMyFiles(docs.sort((a, b) => (a.name || a.original_name || '').localeCompare(b.name || b.original_name || '')));
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

  // --- HANDLERS ---
  const handleFileUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      await uploadFile(formData);
      addNotification('Ficheiro enviado com sucesso!', 'success');
      fetchDocuments();
    } catch (err) {
      addNotification('Falha no upload do ficheiro.', 'error');
    }
  };

  const handleDownload = async (file) => {
    try {
      await docService.downloadDocument(file.id, file.name || file.original_name);
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
              <p className={styles.welcomeText} style={{ margin: 0, paddingRight: '20px' }}>
                Caro usuário, este é o espaço para compartilhamento dos seus documentos oficiais. Utilize a aba{" "}
                <Link to="/osc/modelos" className={styles.orangeLink}>
                  "Docs | Modelos"
                </Link>{" "}
                para baixar os padrões necessários.
              </p>
              <div className={styles.tooltipContainer}>
                <InfoIcon />
                <span className={styles.tooltipText} style={{ top: '150%', bottom: 'auto', transform: 'translateX(-90%)' }}>
                  Utilize esta área para enviar os documentos preenchidos. O seu contador receberá uma notificação automática para validação.
                </span>
              </div>
            </div>
            <p className={styles.infoText}><strong>Nome:</strong> {user?.name || 'Carregando...'}</p>
            <p className={styles.infoText}><strong>CNPJ:</strong> {user?.cnpj || 'Não informado'}</p>
          </div>
          <DocumentUpload onUpload={handleFileUpload} isLoading={isUploading} />
        </div>

        {/* Coluna 2: Calendário + Lista de Documentos */}
        <div className={`${styles.listCard} ${styles.listColumn}`}>
          <h2 className={styles.cardTitle}>Meus Documentos</h2>

          {/* Calendário de Situação Mensal */}
          <div style={{marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px'}}>
            <h4 style={calStyles.sectionTitle}>
              Sua Situação em {new Date().getFullYear()}
              <div className={styles.tooltipContainer}>
                <InfoIcon />
                <span className={styles.tooltipText} style={{ top: '150%', bottom: 'auto' }}>
                  Acompanhe a pontualidade dos seus envios mensais. O status "OK" (Verde) significa que o contador já validou o seu arquivo.
                </span>
              </div>
            </h4>
            
            <div style={calStyles.legend}>
                {['late', 'pending', 'sent', 'concluded'].map(status => (
                  <div key={status} style={calStyles.legendItem}>
                    <div style={calStyles.colorBox(getStatusStyle(status)[0], getStatusStyle(status)[2])}></div> 
                    {getStatusLabel(status)}
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

          {/* Lista de Ficheiros Enviados */}
          {isLoadingList ? (
            <div className={styles.loadingContainer}><Spinner text="A carregar documentos..." /></div>
          ) : errorLoading ? (
            <div className={styles.emptyContainer} style={{color: 'red'}}>{errorLoading}</div>
          ) : myFiles.length === 0 ? (
            <div className={styles.emptyContainer}><p>Nenhum documento encontrado.</p></div>
          ) : (
            <div className={styles.fileListContainer}>
              {myFiles.map((file) => (
                <div key={file.id} className={styles.fileItem}>
                  <div className={styles.fileInfo}>
                    <FileIcon className={styles.fileIcon} />
                    <div className={styles.fileText}>
                      <span className={styles.fileName} title={file.name || file.original_name}>
                        {file.name || file.original_name}
                      </span>
                      <span className={styles.fileDate}>
                        Postado em {formatDate(file.date || file.created_at)}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDownload(file)} 
                    className={styles.downloadButton}
                    title="Descarregar arquivo"
                  >
                    <DownloadIcon />
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