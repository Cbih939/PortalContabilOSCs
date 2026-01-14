import React, { useEffect, useState } from 'react';
import * as fileService from '../../services/publicFileService.js';
import PdfThumbnail from '../osc/components/PdfThumbnail.jsx'; // Reaproveitando o componente
import styles from './Downloads.module.css';

const BookIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const DownloadIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

export default function LibraryPage() {
  const [ebooks, setEbooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fileService.getFilesByCategory('BIBLIOTECA')
      .then(data => {
        // Ordenação Alfanumérica pelo título
        const sorted = data.sort((a, b) => 
          a.title.toLowerCase().localeCompare(b.title.toLowerCase())
        );
        setEbooks(sorted);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleDownload = (path) => {
    window.open(`https://contacomigo.org.br/${path}`, '_blank');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Biblioteca | Downloads</h1>

      {isLoading ? (
        <div className={styles.loading}>Carregando biblioteca...</div>
      ) : (
        <div className={styles.libraryGrid}>
          {ebooks.map((file) => (
            <div 
              key={file.id} 
              className={styles.bookCard} 
              onClick={() => handleDownload(file.file_path)}
            >
              <div className={styles.thumbnailWrapper}>
                {/* Renderiza a capa real do PDF */}
                <PdfThumbnail fileUrl={`https://contacomigo.org.br/${file.file_path}`} />
                
                <div className={styles.overlay}>
                  <DownloadIcon className={styles.dlIconLarge} />
                </div>
              </div>
              
              <div className={styles.bookInfo}>
                <h3 className={styles.bookTitle} title={file.title}>
                  {file.title}
                </h3>
                <div className={styles.bookMeta}>
                   <BookIcon className={styles.metaIcon} />
                   <span>E-book / PDF</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}