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
      // Ordenação numérica baseada no início do título ou classificação
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

  // Funções de filtro para organização em subcategorias
  const getFilesBySubcategory = (list, keywords) => {
    return list.filter(file => 
      keywords.some(key => file.title.toLowerCase().includes(key.toLowerCase()))
    );
  };

  if (loading) {
    return <div className={styles.loadingFull}><Spinner text="A carregar documentos..." /></div>;
  }

  return (
    <div className={styles.pageContainer} style={{ width: '90%', maxWidth: '1200px', margin: '0 auto', padding: '40px 0' }}>
      
      {/* SEÇÃO DE TEXTOS INSTITUCIONAIS - Mantida conforme original */}
      <section className={styles.libraryHeader}>
        <div className={styles.welcomeSection}>
          <h1 className={styles.mainTitle}>BEM-VINDO(A) AO CONTA COMIGO</h1>
          <p>O Conta Comigo é um aplicativo criado para apoiar, organizar e fortalecer organizações da sociedade civil, coletivos e iniciativas sociais em todo o Brasil, especialmente aquelas que não possuem acesso facilitado a assessoria jurídica, contábil, administrativa, marketing e mobilização de recursos.</p>
          <p>A Biblioteca Digital é um dos principais recursos do app. Ela reúne modelos padronizados, claros e acessíveis, pensados para ajudar você a:</p>
          <ul className={styles.styledList}>
            <li>Criar sua organização</li>
            <li>Regularizar documentos</li>
            <li>Estruturar a governança</li>
            <li>Participar de editais e parcerias</li>
            <li>Crescer com segurança jurídica</li>
          </ul>
        </div>

        <div className={styles.contentGrid}>
          <div className={styles.contentCard}>
            <h2 className={styles.subTitle}>O QUE É A BIBLIOTECA DIGITAL</h2>
            <p>A Biblioteca Digital do Conta Comigo é um acervo organizado de documentos orientativos, desenvolvidos a partir da prática real do terceiro setor. Aqui você encontra modelos de:</p>
            <ul className={styles.styledList}>
              <li>Estatutos Sociais</li>
              <li>Atas institucionais</li>
              <li>Regimentos internos</li>
              <li>Declarações usuais</li>
              <li>Checklists de organização e regularidade</li>
            </ul>
            <p className={styles.highlightText}><strong>Importante:</strong> Os documentos são modelos de referência, que podem e devem ser adaptados à realidade da sua organização.</p>
          </div>

          <div className={styles.contentCard}>
            <h2 className={styles.subTitle}>COMO UTILIZAR A BIBLIOTECA</h2>
            <h3 className={styles.stepTitle}>Identifique o estágio da sua organização</h3>
            <p>Antes de baixar um documento, reflita:</p>
            <ol className={styles.styledList}>
              <li>Minha organização está começando agora?</li>
              <li>Já atuamos em alguma política pública?</li>
              <li>Queremos acessar recursos públicos?</li>
              <li>Precisamos nos cadastrar em conselhos?</li>
              <li>Temos ou pretendemos ter CEBAS?</li>
            </ol>
            <p>O app sempre indicará o modelo mais adequado para o seu momento.</p>
          </div>
        </div>

        <div className={styles.instructionCard}>
          <h2 className={styles.subTitle}>INSTRUÇÕES DE PREENCHIMENTO</h2>
          <div className={styles.instructionFlex}>
            <div>
              <p><strong>Escolha o modelo correto:</strong> Use o modelo que atende sua necessidade atual. Modelos mais complexos são para fases avançadas.</p>
              <ul className={styles.miniList}>
                <li>Modelo Base (simples)</li>
                <li>Assistência Social</li>
                <li>MROSC / CEBAS</li>
              </ul>
            </div>
            <div>
              <p><strong>Preencha com atenção:</strong> Nome completo, Município, Estado e Datas corretas são essenciais.</p>
              <p><strong>Registre e arquive:</strong> Estatutos e atas devem ser registrados em cartório. Guarde sempre a versão final assinada e a ata de aprovação.</p>
            </div>
          </div>
        </div>

        <div className={styles.legalSection}>
          <div className={styles.legalNotice}>
            <h2 className={styles.subTitle}>AVISO LEGAL (TRANSPARÊNCIA)</h2>
            <p>Os modelos disponibilizados no Conta Comigo são orientativos e não substituem a análise jurídica ou contábil especializada, quando exigida por lei, edital ou órgão público.</p>
            <p>A Rede Papel Solidário possui um corpo de profissionais técnicos e que praticam bons descontos para serviços extras, para membros do CONTA COMIGO.</p>
          </div>
          
          <div className={styles.purposeBox}>
            <h2 className={styles.subTitle}>PROPÓSITO DA REDE PAPEL SOLIDÁRIO</h2>
            <p>A Biblioteca Digital do Conta Comigo foi criada pela Rede Papel Solidário com o compromisso de:</p>
            <ul className={styles.styledList}>
              <li>Democratizar o acesso à informação</li>
              <li>Reduzir barreiras burocráticas</li>
              <li>Fortalecer pequenas organizações</li>
              <li>Promover transparência e boa governança</li>
            </ul>
          </div>
        </div>
      </section>

      <div className={styles.downloadHeader}>
        <h1 className={styles.pageTitle}>DOCUMENTOS MODELOS | DOWNLOADS</h1>
      </div>

      <div className={styles.gridContainer}>
        {/* COLUNA 1: MODELOS DE DOCUMENTOS ORGANIZADOS POR CATEGORIA */}
        <div className={styles.listCard}>
          <h2 className={styles.cardHeader}>Modelos de Documentos</h2>
          
          <div className={styles.fileListContainer}>
            {/* SUB-CATEGORIA: ESTATUTOS */}
            <h3 className={styles.groupTitle} style={{ padding: '10px 15px', background: '#f8f9fa', fontSize: '0.9rem', color: '#f27405', borderLeft: '4px solid #f27405', margin: '10px 0' }}>
              Estatutos Sociais
            </h3>
            {getFilesBySubcategory(modelos, ['Estatuto']).length > 0 ? 
              getFilesBySubcategory(modelos, ['Estatuto']).map(renderFileRow) : 
              <p className={styles.empty}>Sem estatutos disponíveis.</p>
            }

            {/* SUB-CATEGORIA: ATAS */}
            <h3 className={styles.groupTitle} style={{ padding: '10px 15px', background: '#f8f9fa', fontSize: '0.9rem', color: '#f27405', borderLeft: '4px solid #f27405', margin: '20px 0 10px' }}>
              Atas Institucionais
            </h3>
            {getFilesBySubcategory(modelos, ['Ata']).length > 0 ? 
              getFilesBySubcategory(modelos, ['Ata']).map(renderFileRow) : 
              <p className={styles.empty}>Sem atas disponíveis.</p>
            }

            {/* SUB-CATEGORIA: REGIMENTOS */}
            <h3 className={styles.groupTitle} style={{ padding: '10px 15px', background: '#f8f9fa', fontSize: '0.9rem', color: '#f27405', borderLeft: '4px solid #f27405', margin: '20px 0 10px' }}>
              Regimentos Internos
            </h3>
            {getFilesBySubcategory(modelos, ['Regimento']).length > 0 ? 
              getFilesBySubcategory(modelos, ['Regimento']).map(renderFileRow) : 
              <p className={styles.empty}>Sem regimentos disponíveis.</p>
            }

            {/* SUB-CATEGORIA: DECLARAÇÕES */}
            <h3 className={styles.groupTitle} style={{ padding: '10px 15px', background: '#f8f9fa', fontSize: '0.9rem', color: '#f27405', borderLeft: '4px solid #f27405', margin: '20px 0 10px' }}>
              Declarações
            </h3>
            {getFilesBySubcategory(modelos, ['Declaração', 'Declarações']).length > 0 ? 
              getFilesBySubcategory(modelos, ['Declaração', 'Declarações']).map(renderFileRow) : 
              <p className={styles.empty}>Sem declarações disponíveis.</p>
            }
          </div>
        </div>

        {/* COLUNA 2: COMUNICAÇÃO INSTITUCIONAL */}
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