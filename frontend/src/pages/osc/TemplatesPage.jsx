import React, { useState, useEffect } from 'react';
import * as fileService from '../../services/publicFileService.js';
import { FileIcon, DownloadIcon, EyeIcon } from '../../components/common/Icons.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import styles from './TemplatesPage.module.css';

// Ícone local para garantir o sucesso do Build
const InfoIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function TemplatesPage() {
  const [modelos, setModelos] = useState([]);
  const [comunicacao, setComunicacao] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mapeamento das 10 Classificações para o Tooltip
  const classifications = {
    "Estatuto Social": "1- CLASSIFICAÇÃO NA BIBLIOTECA – CONTA COMIGO\nDocumento: Estatuto Social\nVersão: Modelo Base – Completo Básico\nIndicado para: constituição e registro em cartório\nEvolução futura: Assistência Social | MROSC | CEBAS",
    "Ata de Fundação": "2- CLASSIFICAÇÃO NA BIBLIOTECA – CONTA COMIGO\nDocumento: Ata de Fundação, Eleição e Posse\nVersão: Modelo Unificado – Fundação Simples\nDocumento relacionado: Estatuto Social – Modelo Base\nIndicado para: Registro em cartório + CNPJ",
    "Regimento Interno": "3- CLASSIFICAÇÃO NA BIBLIOTECA – CONTA COMIGO\nDocumento: Regimento Interno\nVersão: Modelo Básico\nDocumentos relacionados:\nEstatuto Social – Modelo Base\nAta de Fundação, Eleição e Posse\nIndicado para: Organização inicial da OSC",
    "Declarações Usuais": "4- CLASSIFICAÇÃO NA BIBLIOTECA – CONTA COMIGO\nDocumento: Declarações Usuais\nVersão: Pacote Básico\nIndicado para: Bancos, Parcerias iniciais, Cadastros simples, Organização documental",
    "Estatuto MROSC": "5- CLASSIFICAÇÃO NA BIBLIOTECA – CONTA COMIGO\nDocumento: Estatuto Social\nVersão: MROSC\nBase Legal: Lei nº 13.019/2014\nIndicado para: Chamamentos públicos, Termos de Fomento, Termos de Colaboração, Acordos de Cooperação",
    "Regimento MROSC": "6- CLASSIFICAÇÃO NA BIBLIOTECA – CONTA COMIGO\nDocumento: Regimento Interno\nVersão: MROSC\nBase Legal: Lei nº 13.019/2014\nDocumento relacionado: Estatuto Social – Versão MROSC\nIndicado para: Parcerias com o Poder Público, Chamamentos públicos, Prestação de contas MROSC",
    "Estatuto CEBAS": "7- CLASSIFICAÇÃO NA BIBLIOTECA – CONTA COMIGO\nDocumento: Estatuto Social\nVersão: CEBAS – Assistência Social\nBase Legal: Lei nº 8.742/1993 (LOAS), Lei nº 12.101/2009, Decreto nº 11.791/2023, Lei 13.019/2014 MROSC\nIndicado para: Certificação CEBAS, Renovação do CEBAS, Fiscalizações e auditorias, Renúncia fiscal previdenciária",
    "Regimento CEBAS": "8- CLASSIFICAÇÃO NA BIBLIOTECA – CONTA COMIGO\nDocumento: Regimento Interno\nVersão: CEBAS – Assistência Social\nBase Legal: LOAS – Lei nº 8.742/1993, Lei nº 12.101/2009, Decreto nº 11.791/2023\nDocumento relacionado: Estatuto Social – Versão CEBAS\nIndicado para: Concessão e renovação do CEBAS, Fiscalizações, Auditorias, Prestação de contas socioassistencial",
    "Declarações CEBAS": "9- CLASSIFICAÇÃO NA BIBLIOTECA – CONTA COMIGO\nDocumento: Declarações Específicas\nVersão: CEBAS – Assistência Social\nBase Legal: LOAS – Lei nº 8.742/1993, Lei nº 12.101/2009, Decreto nº 11.791/2023\nDocumentos relacionados: Estatuto Social – Versão CEBAS, Regimento Interno – Versão CEBAS\nIndicado para: Concessão e renovação do CEBAS, Fiscalizações, Auditorias, Protocolos no MDS/CMAS",
    "Estatuto Profissional": "10- CLASSIFICAÇÃO NA BIBLIOTECA – CONTA COMIGO\nDocumento: Estatuto Social\nVersão: MROSC + CEBAS + Remuneração\nBase Legal: Lei nº 13.019/2014 (MROSC), Lei nº 8.742/1993 (LOAS), Lei nº 12.101/2009, Decreto nº 11.791/2023\nIndicado para: Parcerias com o Poder Público, Concessão e renovação do CEBAS, Gestão profissionalizada, Auditorias e fiscalizações"
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await fileService.getFilesByCategory('');
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
            <div className={styles.classificationWrapper}>
              <InfoIcon className={styles.infoIconSmall} />
              <span className={styles.tooltipText}>
                {classifications[file.title] || "Classificação na Biblioteca – CONTA COMIGO\nDocumento Orientativo"}
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
    return <div className={styles.loadingFull}><Spinner text="A carregar documentos..." /></div>;
  }

  return (
    <div className={styles.pageContainer} style={{ width: '90%', maxWidth: 'none', margin: '0 auto', padding: '20px 0' }}>
      
      {/* SEÇÃO DE TEXTOS INSTITUCIONAIS - EXATAMENTE CONFORME SOLICITADO */}
      <section className={styles.libraryHeader}>
        <div className={styles.textSection}>
          <h1>BEM-VINDO(A) AO CONTA COMIGO</h1>
          <p>O Conta Comigo é um aplicativo criado para apoiar, organizar e fortalecer organizações da sociedade civil, coletivos e iniciativas sociais em todo o Brasil, especialmente aquelas que não possuem acesso facilitado a assessoria jurídica, contábil, administrativa, marketing e mobilização de recursos.</p>
          <p>A Biblioteca Digital é um dos principais recursos do app. Ela reúne modelos padronizados, claros e acessíveis, pensados para ajudar você a:
            <br/>• Criar sua organização | • Regularizar documentos | • Estruturar a governança | • Participar de editais e parcerias | • Crescer com segurança jurídica
          </p>
        </div>

        <div className={styles.textSection}>
          <h2>O QUE É A BIBLIOTECA DIGITAL</h2>
          <p>A Biblioteca Digital do Conta Comigo é um acervo organizado de documentos orientativos, desenvolvidos a partir da prática real do terceiro setor. Aqui você encontra modelos de: Estatutos Sociais, Atas institucionais, Regimentos internos, Declarações usuais, Checklists de organização e regularidade.</p>
          <p><strong>Importante:</strong> Os documentos são modelos de referência, que podem e devem ser adaptados à realidade da sua organização.</p>
        </div>

        <div className={styles.stepByStepGrid}>
          <div className={styles.stepItem}>
            <h3>COMO UTILIZAR A BIBLIOTECA (PASSO A PASSO)</h3>
            <p><strong>Identifique o estágio da sua organização:</strong> Antes de baixar, reflita: 1. Início? 2. Atuamos em políticas públicas? 3. Recursos públicos? 4. Conselhos? 5. CEBAS? O app sempre indicará o modelo mais adequado.</p>
            <p><strong>Escolha o modelo correto:</strong> Na Biblioteca, você encontrará variações (Base, Assistência Social, MROSC, CEBAS, etc). Regra de ouro: Use o modelo que atende sua necessidade atual.</p>
          </div>
          <div className={styles.stepItem}>
            <p><strong>Preencha com atenção:</strong> Todos os modelos possuem campos editáveis e linguagem clara. Preencha sempre: Nome completo da organização, Município e Estado, Datas corretas, Mandatos e cargos.</p>
            <p><strong>Registre e arquive:</strong> Estatutos e atas devem ser registrados em cartório. Guarde sempre: Versão final assinada, Cópia digital, Ata de aprovação. O app ajuda você a organizar esses arquivos.</p>
            <p><strong>Atualize conforme sua organização evolui:</strong> É normal começar com Estatuto Base, depois MROSC e mais adiante CEBAS. A Biblioteca acompanha esse crescimento.</p>
          </div>
        </div>

        <div className={styles.legalNotice}>
          <strong>AVISO LEGAL (TRANSPARÊNCIA):</strong> Os modelos disponibilizados no Conta Comigo são orientativos e não substituem a análise jurídica ou contábil especializada, quando exigida por lei, edital ou órgão público. A Rede Papel Solidário possui um corpo de profissionais técnicos e que praticam bons descontos para serviços extras, para membros do CONTA COMIGO.
        </div>

        <div className={styles.purposeBox}>
          <strong>PROPÓSITO DA REDE PAPEL SOLIDÁRIO:</strong> A Biblioteca Digital do Conta Comigo foi criada pela Rede Papel Solidário com o compromisso de: Democratizar o acesso à informação, Reduzir barreiras burocráticas, Fortalecer pequenas organizações e Promover transparência e boa governança.
        </div>
      </section>

      <h1 className={styles.pageTitle}>Documentos Modelos | Downloads</h1>

      <div className={styles.gridContainer}>
        <div className={styles.listCard}>
          <h2 className={styles.cardHeader}>Modelos de Documentos</h2>
          <div className={styles.fileListContainer}>
            {modelos.length > 0 ? modelos.map(renderFileRow) : <p className={styles.empty}>Sem documentos nesta categoria.</p>}
          </div>
        </div>

        <div className={styles.listCard}>
          <h2 className={styles.cardHeader}>Comunicação Institucional</h2>
          <div className={styles.fileListContainer}>
            {comunicacao.length > 0 ? comunicacao.map(renderFileRow) : <p className={styles.empty}>Sem documentos nesta categoria.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}