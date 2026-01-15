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
      
      // Ordenação Alfanumérica por título
      const sortedData = data.sort((a, b) => 
        a.title.toLowerCase().localeCompare(b.title.toLowerCase())
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
    // CORREÇÃO DA URL: Garante que não apareça 'undefined'
    const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;

    // Limpeza do path para garantir que aponte para /uploads/arquivo.pdf
    let cleanPath = file.file_path.replace(/\\/g, '/');
    if (cleanPath.includes('uploads/')) {
      cleanPath = 'uploads/' + cleanPath.split('uploads/')[1];
    }

    // Monta a URL final removendo barras duplicadas
    const fileUrl = `${baseUrl.replace(/\/$/, '')}/${cleanPath}`;

    return (
      <div key={file.id} className={styles.fileItem}>
        <div className={styles.fileInfo}>
          <FileIcon className={styles.fileIcon} />
          <div className={styles.fileText}>
            <span className={styles.fileName}>{file.title}</span>
            <span className={styles.fileDate}>Modelo Disponível</span>
          </div>
        </div>
        
        <div className={styles.actionGroup}>
          <a 
            href={fileUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={styles.viewButton} 
            title="Visualizar"
          >
            <EyeIcon className={styles.icon} />
          </a>
          <a 
            href={fileUrl} 
            download={file.title} 
            className={styles.downloadButton} 
            title="Descarregar"
          >
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
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Docs Modelos | Downloads</h1>

      <div className={styles.gridContainer}>
        {/* Card à Esquerda: Modelos de Documentos */}
        <div className={styles.listCard}>
          <h2 className={styles.cardHeader}>Modelos de Documentos</h2>
          <div className={styles.fileListContainer}>
            {modelos.length > 0 ? (
              modelos.map(renderFileRow)
            ) : (
              <p className={styles.empty}>Sem documentos nesta categoria.</p>
            )}
          </div>
        </div>

        {/* Card à Direita: Comunicação Institucional */}
        <div className={styles.listCard}>
          <h2 className={styles.cardHeader}>Comunicação Institucional</h2>
          <div className={styles.fileListContainer}>
            {comunicacao.length > 0 ? (
              comunicacao.map(renderFileRow)
            ) : (
              <p className={styles.empty}>Sem documentos nesta categoria.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}