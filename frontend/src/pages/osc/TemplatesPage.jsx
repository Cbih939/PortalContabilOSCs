import React, { useState, useEffect } from 'react';
import * as fileService from '../../services/publicFileService.js';
import { FileIcon, DownloadIcon, EyeIcon } from '../../components/common/Icons.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import Card, { CardBody, CardHeader } from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import { FiInfo, FiEye, FiDownload } from 'react-icons/fi';
import styles from './TemplatesPage.module.css';

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
          <div className={styles.fileIconWrapper}>
            <FileIcon className={styles.fileIcon} />
          </div>
          <div className={styles.fileText}>
            <span className={styles.fileName}>{file.title}</span>
            <div className="tooltip-container" style={{display: 'inline-flex', marginLeft: '6px'}}>
              <FiInfo className="text-primary cursor-help" size={14} />
              <span className="tooltip-text tooltip-right" style={{whiteSpace: 'pre-wrap'}}>
                {classifications[file.title] || "Classificação na Biblioteca – CONTA COMIGO\nDocumento Orientativo"}
              </span>
            </div>
          </div>
        </div>
        <div className={styles.actionGroup}>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className={styles.linkNoDecoration}>
            <Button variant="secondary" size="sm" icon={<FiEye />} title="Visualizar" />
          </a>
          <a href={fileUrl} download className={styles.linkNoDecoration}>
            <Button variant="primary" size="sm" icon={<FiDownload />} title="Descarregar" />
          </a>
        </div>
      </div>
    );
  };

  const getFilesBySubcategory = (list, keywords) => {
    return list.filter(file => 
      keywords.some(key => file.title.toLowerCase().includes(key.toLowerCase()))
    );
  };

  if (loading) {
    return <div className={styles.loadingFull}><Spinner text="A carregar documentos..." /></div>;
  }

  return (
    <div className={styles.pageContainer}>
      
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Biblioteca Digital</h1>
        <p className={styles.pageSubtitle}>Modelos padronizados e orientações jurídicas e contábeis.</p>
      </div>

      <section className={styles.libraryHeader}>
        <div className={styles.welcomeSection}>
          <h2 className={styles.mainTitle}>BEM-VINDO(A) AO CONTA COMIGO</h2>
          <p>O Conta Comigo é um aplicativo criado para apoiar, organizar e fortalecer organizações da sociedade civil, coletivos e iniciativas sociais em todo o Brasil.</p>
          <p>A Biblioteca Digital reúne modelos padronizados, pensados para ajudar você a:</p>
          <ul className={styles.styledList}>
            <li>Criar sua organização</li>
            <li>Regularizar documentos</li>
            <li>Estruturar a governança</li>
            <li>Participar de editais e parcerias</li>
            <li>Crescer com segurança jurídica</li>
          </ul>
        </div>

        <div className={styles.contentGrid}>
          <Card padding="lg" className={styles.infoCard}>
            <h3 className={styles.subTitle}>O QUE É A BIBLIOTECA</h3>
            <p>Acervo organizado de documentos orientativos desenvolvidos a partir da prática real do terceiro setor:</p>
            <ul className={styles.styledList}>
              <li>Estatutos Sociais e Atas</li>
              <li>Regimentos internos</li>
              <li>Declarações e Checklists</li>
            </ul>
            <div className={styles.highlightText}>
              <strong>Importante:</strong> Os documentos são modelos de referência, que podem e devem ser adaptados.
            </div>
          </Card>

          <Card padding="lg" className={styles.infoCard}>
            <h3 className={styles.subTitle}>COMO UTILIZAR</h3>
            <h4 className={styles.stepTitle}>Identifique o estágio da sua organização</h4>
            <p>Antes de baixar um documento, reflita:</p>
            <ol className={styles.styledList}>
              <li>Minha organização está começando agora?</li>
              <li>Queremos acessar recursos públicos?</li>
              <li>Temos ou pretendemos ter CEBAS?</li>
            </ol>
          </Card>
        </div>

        <Card padding="lg" className={styles.instructionCard}>
          <h3 className={styles.subTitle}>INSTRUÇÕES DE PREENCHIMENTO</h3>
          <div className={styles.instructionFlex}>
            <div className={styles.flexHalf}>
              <p><strong>Escolha o modelo correto:</strong> Use o modelo que atende sua necessidade atual.</p>
              <ul className={styles.miniList}>
                <li>Modelo Base (simples)</li>
                <li>Assistência Social</li>
                <li>MROSC / CEBAS</li>
              </ul>
            </div>
            <div className={styles.flexHalf}>
              <p><strong>Preencha com atenção:</strong> Nome completo, Município, Estado e Datas corretas são essenciais.</p>
              <p><strong>Registre e arquive:</strong> Estatutos e atas devem ser registrados em cartório.</p>
            </div>
          </div>
        </Card>
      </section>

      <div className={styles.gridContainer}>
        {/* COLUNA 1: MODELOS */}
        <Card padding="none" className={styles.listCard}>
          <CardHeader className={styles.cardHeader} title="Modelos de Documentos" />
          <CardBody className={styles.cardBody}>
            <h3 className={styles.groupTitle}>Estatutos Sociais</h3>
            {getFilesBySubcategory(modelos, ['Estatuto']).length > 0 ? 
              getFilesBySubcategory(modelos, ['Estatuto']).map(renderFileRow) : 
              <p className={styles.empty}>Sem estatutos disponíveis.</p>
            }

            <h3 className={styles.groupTitle}>Atas Institucionais</h3>
            {getFilesBySubcategory(modelos, ['Ata']).length > 0 ? 
              getFilesBySubcategory(modelos, ['Ata']).map(renderFileRow) : 
              <p className={styles.empty}>Sem atas disponíveis.</p>
            }

            <h3 className={styles.groupTitle}>Regimentos Internos</h3>
            {getFilesBySubcategory(modelos, ['Regimento']).length > 0 ? 
              getFilesBySubcategory(modelos, ['Regimento']).map(renderFileRow) : 
              <p className={styles.empty}>Sem regimentos disponíveis.</p>
            }

            <h3 className={styles.groupTitle}>Declarações</h3>
            {getFilesBySubcategory(modelos, ['Declaração', 'Declarações']).length > 0 ? 
              getFilesBySubcategory(modelos, ['Declaração', 'Declarações']).map(renderFileRow) : 
              <p className={styles.empty}>Sem declarações disponíveis.</p>
            }
          </CardBody>
        </Card>

        {/* COLUNA 2: COMUNICAÇÃO */}
        <Card padding="none" className={styles.listCard}>
          <CardHeader className={styles.cardHeader} title="Comunicação Institucional" />
          <CardBody className={styles.cardBody}>
            {comunicacao.length > 0 ? comunicacao.map(renderFileRow) : <p className={styles.empty}>Sem documentos nesta categoria.</p>}
          </CardBody>
        </Card>
      </div>

    </div>
  );
}