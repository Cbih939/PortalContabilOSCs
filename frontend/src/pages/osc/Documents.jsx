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

// Ícone declarado localmente para evitar erro no Build do Vite
const InfoIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const calStyles = {
  legend: { display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', fontSize: '11px', color: '#555', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #eee' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '6px' },
  colorBox: (bg, border) => ({ width: '10px', height: '10px', backgroundColor: bg, border: `1px solid ${border}`, borderRadius: '2px' }),
  sectionTitle: { fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' },
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

  // Mapeamento das 10 Classificações para o Tooltip
  const classifications = {
    "Estatuto Social": "1- CLASSIFICAÇÃO: Modelo Base - Completo Básico.\nIndicado para: constituição e registro.\nEvolução: Assistência Social | MROSC | CEBAS",
    "Ata de Fundação": "2- CLASSIFICAÇÃO: Modelo Unificado - Fundação Simples.\nRelacionado: Estatuto Social.\nIndicado para: Registro + CNPJ",
    "Regimento Interno": "3- CLASSIFICAÇÃO: Modelo Básico.\nIndicado para: Organização inicial da OSC.",
    "Declarações Usuais": "4- CLASSIFICAÇÃO: Pacote Básico.\nIndicado para: Bancos, parcerias iniciais e cadastros simples.",
    "Estatuto MROSC": "5- CLASSIFICAÇÃO: Versão MROSC (Lei 13.019).\nIndicado para: Chamamentos públicos e parcerias.",
    "Regimento MROSC": "6- CLASSIFICAÇÃO: Versão MROSC.\nIndicado para: Parcerias com Poder Público e prestação de contas.",
    "Estatuto CEBAS": "7- CLASSIFICAÇÃO: CEBAS Assistência Social.\nIndicado para: Certificação e Renovação do CEBAS.",
    "Regimento CEBAS": "8- CLASSIFICAÇÃO: CEBAS Assistência Social.\nIndicado para: Concessão e renovação CEBAS.",
    "Declarações CEBAS": "9- CLASSIFICAÇÃO: Declarações Específicas CEBAS.\nIndicado para: Protocolos no MDS/CMAS.",
    "Estatuto Profissional": "10- CLASSIFICAÇÃO: MROSC + CEBAS + Remuneração.\nIndicado para: Gestão profissionalizada e parcerias amplas."
  };

  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const currentMonthIndex = new Date().getMonth();

  const fetchDocuments = async () => {
    setIsLoadingList(true);
    try {
      const response = await docService.getMyDocuments();
      const docs = Array.isArray(response) ? response : (response.data || []);
      setMyFiles(docs.sort((a, b) => (a.name || '').localeCompare(b.name || '')));
    } catch (err) {
      setErrorLoading("Falha ao carregar documentos.");
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => { if (user?.id) fetchDocuments(); }, [user?.id]);

  const getMonthStatus = (idx) => {
    const docsInMonth = myFiles.filter(d => new Date(d.date || d.created_at).getMonth() === idx);
    if (idx > currentMonthIndex) return 'future';
    if (docsInMonth.some(d => d.status === 'APPROVED' || d.verified)) return 'concluded';
    if (docsInMonth.length > 0) return 'sent';
    return idx === currentMonthIndex ? 'pending' : 'late';
  };

  const getStatusStyle = (s) => {
    switch (s) {
      case 'late': return ['#fee2e2', '#b91c1c', '#fecaca'];
      case 'pending': return ['#fef9c3', '#a16207', '#fde047'];
      case 'sent': return ['#dbeafe', '#1d4ed8', '#bfdbfe'];
      case 'concluded': return ['#dcfce7', '#15803d', '#86efac'];
      default: return ['#f3f4f6', '#9ca3af', '#e5e7eb'];
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* SEÇÃO INSTITUCIONAL - TEXTOS SOLICITADOS */}
      <section className={styles.introSection}>
        <div className={styles.introCard}>
          <h1>BEM-VINDO(A) AO CONTA COMIGO</h1>
          <p className={styles.mainDescription}>O Conta Comigo é um aplicativo criado para apoiar, organizar e fortalecer organizações da sociedade civil... especialmente aquelas que não possuem acesso facilitado a assessoria jurídica, contábil, administrativa, marketing e mobilização de recursos.</p>
          
          <div className={styles.infoAccordion}>
            <details>
              <summary>O QUE É A BIBLIOTECA DIGITAL</summary>
              <div className={styles.detailsContent}>
                <p>A Biblioteca Digital do Conta Comigo é um acervo organizado de documentos orientativos, desenvolvidos a partir da prática real do terceiro setor.</p>
                <ul>
                  <li>Estatutos Sociais | Atas institucionais | Regimentos internos</li>
                  <li>Declarações usuais | Checklists de organização</li>
                </ul>
                <p className={styles.alertText}><strong>Importante:</strong> Os documentos são modelos de referência que devem ser adaptados à sua realidade.</p>
              </div>
            </details>

            <details>
              <summary>COMO UTILIZAR A BIBLIOTECA (PASSO A PASSO)</summary>
              <div className={styles.detailsContent}>
                <h4>1. Identifique o estágio da sua organização</h4>
                <p>Antes de baixar, reflita: Minha organização está começando? Já atuamos em políticas públicas? Queremos CEBAS?</p>
                <h4>2. Escolha o modelo correto</h4>
                <p>Regra de ouro: Use o modelo que atende sua necessidade atual. Modelos complexos são para fases avançadas.</p>
                <h4>3. Preencha, Registre e Atualize</h4>
                <p>Preencha nomes e datas com atenção. Estatutos e atas devem ser registrados em cartório.</p>
              </div>
            </details>
          </div>
        </div>
      </section>

      <div className={styles.grid}>
        <div className={styles.uploadColumn}>
          <div className={styles.infoCard}>
            <p className={styles.infoText}><strong>Entidade:</strong> {user.name}</p>
            <p className={styles.infoText}><strong>CNPJ:</strong> {user.cnpj || 'Não informado'}</p>
            <DocumentUpload onUpload={async (f) => { await uploadFile(f); fetchDocuments(); }} isLoading={isUploading} />
          </div>

          <div className={styles.legalNotice}>
            <h4>AVISO LEGAL (TRANSPARÊNCIA)</h4>
            <p>Os modelos disponibilizados no Conta Comigo são orientativos e não substituem a análise jurídica ou contábil especializada.</p>
          </div>
        </div>

        <div className={styles.listColumn}>
          {/* CALENDÁRIO */}
          <div className={styles.calendarContainer}>
            <h4 style={calStyles.sectionTitle}>Sua Situação em {new Date().getFullYear()}</h4>
            <div style={calStyles.legend}>
              <div style={calStyles.legendItem}><div style={calStyles.colorBox('#fee2e2', '#fecaca')}></div> Atraso</div>
              <div style={calStyles.legendItem}><div style={calStyles.colorBox('#fef9c3', '#fde047')}></div> Aberto</div>
              <div style={calStyles.legendItem}><div style={calStyles.colorBox('#dbeafe', '#bfdbfe')}></div> Enviado</div>
              <div style={calStyles.legendItem}><div style={calStyles.colorBox('#dcfce7', '#86efac')}></div> Concluso</div>
            </div>
            <div style={calStyles.calendarGrid}>
              {months.map((m, idx) => {
                const status = getMonthStatus(idx);
                const [bg, color, border] = getStatusStyle(status);
                return (
                  <div key={m} style={calStyles.monthBox(bg, color, border)}>
                    <span style={calStyles.monthText}>{m}</span>
                    <span style={calStyles.statusText}>{status !== 'future' ? status.toUpperCase() : '-'}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* LISTA DE ARQUIVOS */}
          <div className={styles.fileListContainer}>
            <h2 className={styles.cardTitle}>Meus Documentos Postados</h2>
            {isLoadingList ? <Spinner /> : myFiles.length === 0 ? <p>Nenhum documento encontrado.</p> : (
              myFiles.map(file => (
                <div key={file.id} className={styles.fileItem}>
                  <div className={styles.fileInfo}>
                    <FileIcon className={styles.fileIcon} />
                    <div className={styles.fileText}>
                      <span className={styles.fileName}>{file.name || file.original_name}</span>
                      <div className={styles.classificationWrapper}>
                        <InfoIcon className={styles.infoIconSmall} />
                        <span className={styles.tooltipText}>
                          {classifications[file.name] || "Classificação na Biblioteca: Documento Geral"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => docService.downloadDocument(file.id)} className={styles.downloadButton}>
                    <DownloadIcon />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <footer className={styles.purposeFooter}>
        <h4>PROPÓSITO DA REDE PAPEL SOLIDÁRIO</h4>
        <p>Democratizar o acesso à informação | Reduzir barreiras burocráticas | Fortalecer pequenas organizações</p>
      </footer>
    </div>
  );
}