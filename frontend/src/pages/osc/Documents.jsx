import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import useApi from '../../hooks/useApi.jsx';
import api from '../../services/api.js'; 
import { useNotification } from '../../contexts/NotificationContext.jsx';
import * as docService from '../../services/documentService.js';
import DocumentUpload from './components/DocumentUpload.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import Card, { CardBody, CardHeader } from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import { FiInfo, FiFileText, FiDownload, FiLink, FiCalendar, FiFilter } from 'react-icons/fi';
import styles from './Documents.module.css';

export default function OSCDocumentsPage() {
  const { user } = useAuth();
  const addNotification = useNotification();
  const location = useLocation();

  const [myFiles, setMyFiles] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  
  const queryParams = new URLSearchParams(location.search);
  const initialMonth = parseInt(queryParams.get('month')) || new Date().getMonth() + 1;
  const initialYear = parseInt(queryParams.get('year')) || new Date().getFullYear();

  const [docType, setDocType] = useState('MENSAL');
  const [refMonth, setRefMonth] = useState(initialMonth);
  const [refYear, setRefYear] = useState(initialYear);
  const [viewYear, setViewYear] = useState(initialYear);
  const [projectId, setProjectId] = useState('');

  const { request: uploadFile, isLoading: isUploading } = useApi(docService.uploadDocument);

  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const years = [2024, 2025, 2026];

  const filteredFiles = useMemo(() => {
    return myFiles.filter(f => f.ref_year === viewYear && f.ref_month === refMonth);
  }, [myFiles, viewYear, refMonth]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects');
        setProjects(res.data || []);
      } catch (err) {
        console.error("Erro ao carregar projetos", err);
      }
    };
    if (user?.id) fetchProjects();
  }, [user?.id]);

  useEffect(() => {
    const month = parseInt(queryParams.get('month'));
    const year = parseInt(queryParams.get('year'));
    if (month) setRefMonth(month);
    if (year) {
        setRefYear(year);
        setViewYear(year);
    }
  }, [location.search]);

  const getMonthStatus = (monthIndex) => {
    const monthNum = monthIndex + 1;
    const now = new Date();
    const currentDay = now.getDate();
    const currentYear = now.getFullYear();
    const currentMonthNum = now.getMonth() + 1;

    const docsInMonth = myFiles.filter(d => d.ref_month === monthNum && d.ref_year === viewYear);
    const hasDoc = docsInMonth.length > 0;
    const isVerified = hasDoc && docsInMonth.some(d => d.status === 'CONCLUIDO');

    if (isVerified) return 'concluded';
    if (hasDoc) return 'sent';
    
    if (viewYear < currentYear) return 'late';
    if (viewYear === currentYear) {
      if (monthNum < currentMonthNum) {
        if (monthNum === currentMonthNum - 1 && currentDay <= 10) return 'pending';
        return 'late';
      }
      if (monthNum === currentMonthNum) return 'pending';
    }
    return 'future';
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'late': return styles.statusLate;
      case 'pending': return styles.statusPending;
      case 'sent': return styles.statusSent;
      case 'concluded': return styles.statusConcluded;
      default: return styles.statusFuture;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'late': return 'Atraso';
      case 'pending': return 'Aberto';
      case 'sent': return 'Enviado';
      case 'concluded': return 'Concluso';
      default: return '-';
    }
  };

  const fetchDocuments = async () => {
    setIsLoadingList(true);
    try {
      const response = await docService.getMyDocuments();
      setMyFiles(Array.isArray(response) ? response : (response.data || []));
    } catch (err) {
      addNotification("Erro ao carregar lista de documentos.", 'error');
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
      if (projectId) formData.append('project_id', projectId);
      
      await uploadFile(formData);
      addNotification(`Documento enviado para ${refMonth}/${refYear}!`, 'success');
      setProjectId('');
      await fetchDocuments();
    } catch (err) {
      addNotification(`Erro no upload: ${err.response?.data?.message || err.message}`, 'error');
    }
  };

  const handleDownload = async (file) => {
    try {
      await docService.downloadDocument(file.id, file.original_name || file.name);
    } catch (err) {
      addNotification('Erro ao descarregar ficheiro.', 'error');
    }
  };

  const handleShare = async (file) => {
    try {
      const response = await docService.generatePublicLink(file.id);
      if (response && response.link) {
        await navigator.clipboard.writeText(response.link);
        addNotification('Link copiado para a área de transferência!', 'success');
      }
    } catch (err) {
      addNotification('Erro ao gerar link de partilha.', 'error');
    }
  };

  return (
    <div className={styles.pageContainer}>
      
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Meus Documentos</h1>
          <p className={styles.pageSubtitle}>Gerencie o envio da sua documentação mensal e fixa.</p>
        </div>
      </div>

      <div className={styles.grid}>
        
        {/* COLUNA ESQUERDA: UPLOAD & FILTROS */}
        <div className={styles.sidebarColumn}>
          <Card className={styles.filterCard} padding="none">
            <CardHeader className={styles.filterCardHeader} title="Parâmetros de Envio" />
            <CardBody className={styles.filterCardBody}>
              <div className="form-group">
                <label className="form-label">TIPO DE DOCUMENTO</label>
                <select className="input-clean" value={docType} onChange={(e) => setDocType(e.target.value)}>
                  <option value="MENSAL">Mensal (Contábil / Fiscal)</option>
                  <option value="RELATORIO">Relatório Mês a Mês</option>
                  <option value="FIXO">Fixo (Atas, Estatutos, Cartão CNPJ)</option>
                  <option value="CERTIFICACAO">Certificação (Documento Fixo)</option>
                  <option value="CONCLUSO TEC">CONCLUSO TEC (Transf. Escritório)</option>
                </select>
              </div>

              <div className="form-group mt-3">
                <label className="form-label">PROJETO / CENTRO DE CUSTO</label>
                <select className="input-clean" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                  <option value="">Recurso Livre / Sem Projeto</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.rowGrid}>
                <div className="form-group">
                  <label className="form-label">MÊS DE REF.</label>
                  <select className="input-clean" value={refMonth} onChange={(e) => setRefMonth(parseInt(e.target.value))}>
                    {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">ANO DE REF.</label>
                  <select className="input-clean" value={refYear} onChange={(e) => setRefYear(parseInt(e.target.value))}>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            </CardBody>
          </Card>

          <DocumentUpload onUpload={handleFileUpload} isLoading={isUploading} className={styles.uploadWidget} />
        </div>

        {/* COLUNA DIREITA: CALENDÁRIO E LISTA DE ARQUIVOS */}
        <div className={styles.mainColumn}>
          
          <Card padding="none" className={styles.mainCard}>
            <CardHeader 
              className={styles.mainCardHeader}
              title={<span style={{display: 'flex', alignItems: 'center', gap: '8px'}}><FiCalendar /> Calendário de Situação</span>} 
              action={
                <select className="input-clean" style={{width: 'auto'}} value={viewYear} onChange={(e) => setViewYear(parseInt(e.target.value))}>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              }
            />
            <CardBody className={styles.mainCardBody}>
              {user?.data_contrato_conta_comigo && (
                <div className={styles.contractAlert}>
                  🤝 Início da relação contratual com a contabilidade: <strong>{new Date(user.data_contrato_conta_comigo).toLocaleDateString('pt-BR')}</strong>
                </div>
              )}

              <div className={styles.legendGrid}>
                {['late', 'pending', 'sent', 'concluded'].map(s => (
                  <div key={s} className={styles.legendItem}>
                    <div className={`${styles.legendColor} ${getStatusClass(s)}`}></div> {getStatusLabel(s)}
                  </div>
                ))}
              </div>

              <div className={styles.calendarGrid}>
                {months.map((m, idx) => {
                  const status = getMonthStatus(idx);
                  const isSelected = refMonth === idx + 1 && viewYear === refYear;
                  const itemClass = `${styles.monthBox} ${getStatusClass(status)} ${isSelected ? styles.monthSelected : ''}`;
                  
                  return (
                    <div 
                      key={m} 
                      className={itemClass}
                      onClick={() => {
                        setRefMonth(idx + 1);
                        setRefYear(viewYear);
                      }}
                    >
                      <span className={styles.monthName}>{m}</span>
                      <span className={styles.monthStatus}>{getStatusLabel(status)}</span>
                    </div>
                  )
                })}
              </div>
            </CardBody>
          </Card>

          <Card padding="none" className={styles.filesCard}>
            <CardHeader 
              className={styles.filesCardHeader}
              title={`Arquivos de ${months[refMonth - 1]}/${viewYear}`}
            />
            <CardBody className={styles.filesCardBody}>
              {isLoadingList ? (
                <div className={styles.loadingState}><Spinner text="Carregando documentos..." /></div>
              ) : filteredFiles.length === 0 ? (
                <div className={styles.emptyState}>
                  <FiFileText size={48} className="text-muted mb-3" />
                  <p>Nenhum documento enviado para <strong>{months[refMonth - 1]}/{viewYear}</strong>.</p>
                </div>
              ) : (
                <div className={styles.fileList}>
                  {filteredFiles.map((file) => (
                    <div key={file.id} className={styles.fileItem}>
                      <div className={styles.fileIconWrapper}>
                        <FiFileText size={24} />
                      </div>
                      
                      <div className={styles.fileDetails}>
                        <h4 className={styles.fileName}>
                          {file.original_name || file.name}
                        </h4>
                        
                        <div className={styles.fileTagsRow}>
                          <span className={styles.docTypeTag}>{file.doc_type}</span>
                          {file.project_name ? (
                            <span className={styles.projectTag}>{file.project_name}</span>
                          ) : (
                            <span className={styles.noProjectTag}>Recurso Livre</span>
                          )}
                        </div>
                        
                        <span className={styles.fileMeta}>
                          Enviado em {new Date(file.created_at).toLocaleDateString('pt-BR')} • {file.status}
                        </span>
                      </div>

                      <div className={styles.fileActions}>
                        <Button 
                          variant="secondary" 
                          size="sm"
                          icon={<FiLink />}
                          onClick={() => handleShare(file)}
                          title="Gerar Link Público"
                        />
                        <Button 
                          variant="primary" 
                          size="sm"
                          icon={<FiDownload />}
                          onClick={() => handleDownload(file)}
                          title="Fazer Download"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

        </div>
      </div>
    </div>
  );
}