import React, { useEffect, useState } from 'react';
import * as fileService from '../../services/publicFileService.js';
import styles from './Downloads.module.css'; // Usaremos um CSS compartilhado

const DocIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
);

const DownloadIcon = () => (
  <svg width="20" height="20" fill="none" stroke="#22c55e" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
);

export default function TemplatesPage() {
  const [docs, setDocs] = useState([]);
  const [inst, setInst] = useState([]);

  useEffect(() => {
    // Busca e separa os arquivos
    fileService.getFilesByCategory('').then(allFiles => {
      setDocs(allFiles.filter(f => f.category === 'MODELO_DOC'));
      setInst(allFiles.filter(f => f.category === 'MODELO_INSTITUCIONAL'));
    });
  }, []);

  const handleDownload = (path) => {
      // Ajuste a URL base conforme seu servidor
      window.open(`https://contacomigo.org.br/${path}`, '_blank');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Docs Modelos | Downloads</h1>
      
      <div className={styles.grid}>
        {/* Card Esquerda: Modelos de Documentos */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Modelos de Documentos</h3>
          <div className={styles.list}>
            {docs.map(file => (
              <div key={file.id} className={styles.item}>
                <div className={styles.fileInfo}>
                  <DocIcon />
                  <span>{file.title}</span>
                </div>
                <button onClick={() => handleDownload(file.file_path)} className={styles.dlBtn}>
                  <DownloadIcon />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Card Direita: Comunicação Institucional */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Modelos de Comunicação Institucional</h3>
          <div className={styles.list}>
            {inst.map(file => (
              <div key={file.id} className={styles.item}>
                <div className={styles.fileInfo}>
                  <DocIcon />
                  <span>{file.title}</span>
                </div>
                <button onClick={() => handleDownload(file.file_path)} className={styles.dlBtn}>
                  <DownloadIcon />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}