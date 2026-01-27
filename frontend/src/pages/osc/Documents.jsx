import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import useApi from '../../hooks/useApi.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { Link } from 'react-router-dom';
import * as docService from '../../services/documentService.js';
import DocumentUpload from './components/DocumentUpload.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { FileIcon, DownloadIcon, InfoIcon } from '../../components/common/Icons.jsx';
import { formatDate } from '../../utils/formatDate.js';
import styles from './Documents.module.css';

const calStyles = {
    // ... (mantidos os seus calStyles originais)
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

    // Mapeamento das classificações para o Tooltip
    const classifications = {
        "Estatuto Social": "Versão: Modelo Base – Completo Básico\nIndicado para: constituição e registro em cartório\nEvolução futura: Assistência Social | MROSC | CEBAS",
        "Ata de Fundação": "Versão: Modelo Unificado – Fundação Simples\nIndicado para: Registro em cartório + CNPJ",
        "Regimento Interno": "Versão: Modelo Básico\nIndicado para: Organização inicial da OSC"
    };

    const fetchDocuments = async () => {
        setIsLoadingList(true);
        try {
            const response = await docService.getMyDocuments();
            const docs = Array.isArray(response) ? response : (response.data || []);
            setMyFiles(docs.sort((a, b) => (a.name || '').localeCompare(b.name || '')));
        } catch (err) {
            setErrorLoading("Não foi possível carregar os documentos.");
        } finally {
            setIsLoadingList(false);
        }
    };

    useEffect(() => { if (user?.id) fetchDocuments(); }, [user?.id]);

    // Funções de auxílio do calendário (getMonthStatus, getStatusStyle, etc mantidas...)
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentMonthIndex = new Date().getMonth();
    const getMonthStatus = (idx) => { /* sua lógica original */ return 'pending'; }; 
    const getStatusStyle = (s) => { /* sua lógica original */ return ['#f3f4f6', '#9ca3af', '#e5e7eb']; };
    const getStatusLabel = (s) => { /* sua lógica original */ return '-'; };

    return (
        <div className={styles.pageContainer}>
            {/* SEÇÃO 1: BOAS-VINDAS E TEXTOS INSTITUCIONAIS */}
            <section className={styles.introSection}>
                <div className={styles.introCard}>
                    <h1>BEM-VINDO(A) AO CONTA COMIGO</h1>
                    <p>O Conta Comigo é um aplicativo criado para apoiar, organizar e fortalecer organizações da sociedade civil... especialmente aquelas que não possuem acesso facilitado a assessoria jurídica, contábil, administrativa, marketing e mobilização de recursos.</p>
                    
                    <div className={styles.infoAccordion}>
                        <details>
                            <summary>O QUE É A BIBLIOTECA DIGITAL</summary>
                            <div className={styles.detailsContent}>
                                <p>A Biblioteca Digital do Conta Comigo é um acervo organizado de documentos orientativos...</p>
                                <ul>
                                    <li>Estatutos Sociais</li>
                                    <li>Atas institucionais</li>
                                    <li>Regimentos internos</li>
                                </ul>
                                <p><strong>Importante:</strong> Os documentos são modelos de referência que devem ser adaptados.</p>
                            </div>
                        </details>

                        <details>
                            <summary>COMO UTILIZAR A BIBLIOTECA (PASSO A PASSO)</summary>
                            <div className={styles.detailsContent}>
                                <h4>1. Identifique o estágio da sua organização</h4>
                                <p>Antes de baixar um documento, reflita sobre seu momento atual (Início? MROSC? CEBAS?).</p>
                                <h4>2. Escolha o modelo correto</h4>
                                <p>Use o modelo que atende sua necessidade atual. Modelos complexos são para fases avançadas.</p>
                                <h4>3. Preencha com atenção</h4>
                                <p>Fique atento a nomes, municípios e mandatos.</p>
                            </div>
                        </details>
                    </div>
                </div>
            </section>

            <div className={styles.grid}>
                {/* Coluna 1: Upload e Info do Usuário */}
                <div className={styles.uploadColumn}>
                    <div className={styles.infoCard}>
                        <p className={styles.infoText}><strong>Entidade:</strong> {user.name}</p>
                        <p className={styles.infoText}><strong>CNPJ:</strong> {user.cnpj || 'Não informado'}</p>
                        <DocumentUpload onUpload={async (f) => { await uploadFile(f); fetchDocuments(); }} isLoading={isUploading} />
                    </div>

                    <div className={styles.legalNotice}>
                        <h4>AVISO LEGAL</h4>
                        <p>Os modelos disponibilizados são orientativos e não substituem análise jurídica especializada.</p>
                    </div>
                </div>

                {/* Coluna 2: Calendário e Lista de Arquivos */}
                <div className={styles.listColumn}>
                    {/* Calendário */}
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
                                        <span style={calStyles.statusText}>{getStatusLabel(status)}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Lista de Documentos */}
                    <div className={styles.fileListContainer}>
                        <h2 className={styles.cardTitle}>Meus Documentos Postados</h2>
                        {isLoadingList ? <Spinner /> : myFiles.map(file => (
                            <div key={file.id} className={styles.fileItem}>
                                <div className={styles.fileInfo}>
                                    <FileIcon className={styles.fileIcon} />
                                    <div className={styles.fileText}>
                                        <span className={styles.fileName}>{file.name || file.original_name}</span>
                                        {/* TOOLTIP DE CLASSIFICAÇÃO */}
                                        <div className={styles.classificationWrapper}>
                                            <InfoIcon className={styles.infoIconSmall} />
                                            <span className={styles.tooltipText}>
                                                {classifications[file.name] || "Documento Geral da Organização"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => docService.downloadDocument(file.id)} className={styles.downloadButton}>
                                    <DownloadIcon />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* PROPÓSITO NO RODAPÉ */}
            <footer className={styles.purposeFooter}>
                <h4>PROPÓSITO DA REDE PAPEL SOLIDÁRIO</h4>
                <p>Democratizar o acesso à informação | Reduzir barreiras burocráticas | Fortalecer pequenas organizações | Promover transparência</p>
            </footer>
        </div>
    );
}