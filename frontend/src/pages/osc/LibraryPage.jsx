import React, { useEffect, useState } from 'react';
import * as fileService from '../../services/publicFileService.js';
import styles from './Downloads.module.css';

const BookIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
);

const DownloadIcon = () => (
  <svg width="20" height="20" fill="none" stroke="#22c55e" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
);

export default function LibraryPage() {
  const [ebooks, setEbooks] = useState([]);

  useEffect(() => {
    fileService.getFilesByCategory('BIBLIOTECA').then(setEbooks);
  }, []);

  const handleDownload = (path) => {
      window.open(`https://contacomigo.org.br/${path}`, '_blank');
  };

  // Divide em duas colunas para o layout visual
  const midIndex = Math.ceil(ebooks.length / 2);
  const col1 = ebooks.slice(0, midIndex);
  const col2 = ebooks.slice(midIndex);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Biblioteca | Downloads</h1>
      
      <div className={styles.grid}>
        {/* Coluna 1 */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Biblioteca</h3>
          <div className={styles.list}>
            {col1.map(file => (
              <div key={file.id} className={styles.item}>
                <div className={styles.fileInfo}>
                  <BookIcon />
                  <span>{file.title}</span>
                </div>
                <button onClick={() => handleDownload(file.file_path)} className={styles.dlBtn}>
                  <DownloadIcon />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Coluna 2 */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Biblioteca</h3>
          <div className={styles.list}>
            {col2.map(file => (
              <div key={file.id} className={styles.item}>
                <div className={styles.fileInfo}>
                  <BookIcon />
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