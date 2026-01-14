import React, { useState, useEffect } from 'react';
import * as fileService from '../../services/publicFileService.js';
import { FileIcon, DownloadIcon, EyeIcon } from '../../components/common/Icons.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import styles from './TemplatesPage.module.css';

export default function TemplatesPage() {
  const [modelos, setModelos] = useState([]);
  const [comunicacao, setComunicacao] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await fileService.getFilesByCategory('');
      // Filtra por categoria conforme o banco de dados
      setModelos(data.filter(f => f.category === 'MODELO_DOC'));
      setComunicacao(data.filter(f => f.category === 'MODELO_INSTITUCIONAL'));
    } catch (error) {
      console.error("Erro ao carregar ficheiros:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderFileRow = (file) => {
    // Formata a URL: Remove o caminho absoluto do sistema e deixa apenas o caminho web
    const relativePath = file.file_path.includes('uploads') 
      ? file.file_path.split('backend/')[1] || file.file_path 
      : file.file_path;
    
    const fileUrl = `https://contacomigo.org.br/${relativePath}`;

    return (
      <div key={file.id} className={styles.fileRow}>
        <div className={styles.fileMain}>
          <FileIcon className={styles.typeIcon} />
          <span className={styles.fileName}>{file.title}</span>
        </div>
        <div className={styles.fileActions}>
          {/* Visualizar PDF em nova aba */}
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className={styles.iconBtn} title="Ler online">
            <EyeIcon />
          </a>
          {/* Download direto */}
          <a href={fileUrl} download={file.title} className={styles.iconBtn} title="Descarregar">
            <DownloadIcon />
          </a>
        </div>
      </div>
    );
  };

  if (loading) return <Spinner text="A carregar documentos..." />;

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Docs Modelos | Downloads</h1>

      <div className={styles.gridContainer}>
        {/* Card Modelos de Documentos */}
        <div className={styles.card}>
          <h2 className={styles.cardHeader}>Modelos de Documentos</h2>
          <div className={styles.list}>
            {modelos.length > 0 ? modelos.map(renderFileRow) : <p className={styles.empty}>Sem documentos nesta categoria.</p>}
          </div>
        </div>

        {/* Card Comunicação Institucional */}
        <div className={styles.card}>
          <h2 className={styles.cardHeader}>Modelos de Comunicação Institucional</h2>
          <div className={styles.list}>
            {comunicacao.length > 0 ? comunicacao.map(renderFileRow) : <p className={styles.empty}>Sem documentos nesta categoria.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}