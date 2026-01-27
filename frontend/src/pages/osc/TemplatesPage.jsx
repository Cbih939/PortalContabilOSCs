import React, { useState, useEffect } from 'react';
import * as fileService from '../../services/publicFileService.js';
import { FileIcon, DownloadIcon, EyeIcon } from '../../components/common/Icons.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import styles from './TemplatesPage.module.css';

// Ícone local para evitar erros de exportação no Vite
const InfoIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function TemplatesPage() {
  const [modelos, setModelos] = useState([]);
  const [comunicacao, setComunicacao] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mapeamento das Classificações (1 a 10)
  const classifications = {
    "Estatuto Social": "1- Modelo Base - Completo Básico. Indicado para: constituição e registro.",
    "Ata de Fundação": "2- Modelo Unificado - Fundação Simples. Indicado para: Registro + CNPJ",
    "Regimento Interno": "3- Modelo Básico. Indicado para: Organização inicial da OSC.",
    "Declarações Usuais": "4- Pacote Básico. Indicado para: Bancos e parcerias iniciais.",
    "Estatuto MROSC": "5- Versão MROSC (Lei 13.019). Indicado para: Chamamentos públicos.",
    "Regimento MROSC": "6- Versão MROSC. Indicado para: Parcerias com Poder Público.",
    "Estatuto CEBAS": "7- CEBAS Assistência Social. Indicado para: Certificação e Renovação.",
    "Regimento CEBAS": "8- CEBAS Assistência Social. Indicado para: Concessão e renovação.",
    "Declarações CEBAS": "9- Declarações Específicas CEBAS. Indicado para: Protocolos MDS/CMAS.",
    "Estatuto Profissional": "10- MROSC + CEBAS + Remuneração. Indicado para: Gestão profissionalizada."
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await fileService.getFilesByCategory('');
      
      // Ordenação Alfanumérica
      const sortedData = data.sort((a, b) => 
        (a.title || "").toLowerCase().localeCompare((b.title || "").toLowerCase(), undefined, { numeric: true, sensitivity: 'base' })
      );

      setModelos(sortedData.filter(f => f.category === 'MODELO_DOC'));
      setComunicacao(sortedData.filter(f => f.category === 'MODELO_INSTITUCIONAL'));
    } catch (error) {
      console.error("Erro ao carregar ficheiros:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderFileRow = (file) => {
    const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
    let cleanPath = (file.file_path || "").replace(/\\/g, '/');
    if (cleanPath.includes('uploads/')) {
      cleanPath = 'uploads/' + cleanPath.split('uploads/')[1];
    }
    const fileUrl = `${baseUrl.replace(/\/$/, '')}/${cleanPath}`;

    return (
      <div key={file.id} className={styles.fileItem}>
        <div className={styles.fileInfo}>
          <FileIcon className={styles.fileIcon} />
          <div className={styles.fileText}>
            <span className={styles.fileName}>{file.title}</span>
            {/* TOOLTIP DE CLASSIFICAÇÃO */}
            <div className={styles.classificationWrapper}>
              <InfoIcon className={styles.infoIconSmall} />
              <span className={styles.tooltipText}>
                {classifications[file.title] || "Classificação na Biblioteca: Modelo Orientativo"}
              </span>
            </div>
          </div>
        </div>
        
        <div className={styles.actionGroup}>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className={styles.viewButton} title="Visualizar">
            <EyeIcon className={styles.icon} />
          </a>
          <a href={fileUrl} download className={styles.downloadButton} title="Descarregar">
            <DownloadIcon className={styles.icon} />
          </a>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.loadingFull}>
        <Spinner text="A carregar documentos..." />
      </div>
    );
  }

  return (
    <div className={styles.pageContainer} style={{ width: '90%', maxWidth: 'none', margin: '0 auto', padding: '20px 0' }}>
      
      {/* SEÇÃO INSTITUCIONAL NO TOPO */}
      <section className={styles.headerInfo}>
        <div className={styles.welcomeBox}>
          <h1>BEM-VINDO(A) AO CONTA COMIGO</h1>
          <p>O Conta Comigo apóia e fortalece iniciativas sociais em todo o Brasil. A Biblioteca Digital reúne modelos padronizados para ajudar você a criar sua organização, regularizar documentos e crescer com segurança jurídica.</p>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h3>O QUE É A BIBLIOTECA DIGITAL</h3>
            <p>Um acervo de documentos orientativos (Estatutos, Atas, Regimentos) desenvolvidos a partir da prática real do terceiro setor.</p>
          </div>
          <div className={styles.infoCard}>
            <h3>COMO UTILIZAR (PASSO A PASSO)</h3>
            <p>1. Identifique seu estágio (Início? MROSC? CEBAS?) | 2. Escolha o modelo correto | 3. Preencha e registre em cartório.</p>
          </div>
        </div>

        <div className={styles.legalNotice}>
          <strong>AVISO LEGAL:</strong> Os modelos são orientativos e não substituem análise jurídica especializada. A Rede Papel Solidário democratiza o acesso à informação para fortalecer sua OSC.
        </div>
      </section>

      <h1 className={styles.pageTitle}>Documentos Modelos | Downloads</h1>

      <div className={styles.gridContainer}>
        <div className={styles.listCard}>
          <h2 className={styles.cardHeader}>Modelos de Documentos</h2>
          <div className={styles.fileListContainer}>
            {modelos.length > 0 ? modelos.map(renderFileRow) : <p className={styles.empty}>Sem documentos.</p>}
          </div>
        </div>

        <div className={styles.listCard}>
          <h2 className={styles.cardHeader}>Comunicação Institucional</h2>
          <div className={styles.fileListContainer}>
            {comunicacao.length > 0 ? comunicacao.map(renderFileRow) : <p className={styles.empty}>Sem documentos.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}