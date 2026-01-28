import React, { useEffect, useState } from 'react';
import * as fileService from '../../services/publicFileService.js';
import PdfThumbnail from '../osc/components/PdfThumbnail.jsx'; 
import styles from './Downloads.module.css';

// Ícone de Informação (Tooltip) declarado localmente
const InfoIcon = () => (
  <svg 
    style={{ width: '18px', height: '18px', color: '#EC6D12', cursor: 'help', marginLeft: '10px' }} 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

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
        const filtered = data.filter(f => f.category === 'BIBLIOTECA');
        const sorted = filtered.sort((a, b) => {
          const titleA = a.title || "";
          const titleB = b.title || "";
          return titleA.localeCompare(titleB, undefined, { 
            numeric: true, 
            sensitivity: 'base' 
          });
        });
        setEbooks(sorted);
      })
      .catch(err => console.error("Erro ao carregar biblioteca:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleDownload = (path) => {
    const cleanPath = path.replace(/\\/g, '/');
    window.open(`https://contacomigo.org.br/${cleanPath}`, '_blank');
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerWithInfo}>
        <h1 className={styles.title}>Biblioteca | Downloads</h1>
        <div className={styles.tooltipContainer}>
          <InfoIcon />
          <span className={styles.tooltipText}>
            A Biblioteca Digital contém E-books, Manuais e Guias orientativos para fortalecer a gestão da sua OSC. Diferente dos "Modelos", estes arquivos são para leitura e consulta técnica.
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loading}>Carregando biblioteca...</div>
      ) : ebooks.length === 0 ? (
        <div className={styles.empty}>Nenhum documento disponível no momento.</div>
      ) : (
        <div className={styles.libraryGrid}>
          {ebooks.map((file) => (
            <div 
              key={file.id} 
              className={styles.bookCard} 
              onClick={() => handleDownload(file.file_path)}
            >
              <div className={styles.thumbnailWrapper}>
                {file.cover_path ? (
                  <img 
                    src={`https://contacomigo.org.br/${file.cover_path.replace(/\\/g, '/')}`} 
                    alt={file.title} 
                    className={styles.bookCoverImage}
                  />
                ) : (
                  <PdfThumbnail fileUrl={`https://contacomigo.org.br/${file.file_path.replace(/\\/g, '/')}`} />
                )}
                
                <div className={styles.overlay}>
                  <DownloadIcon className={styles.dlIconLarge} />
                  <span className={styles.overlayText}>Baixar PDF</span>
                </div>
              </div>
              
              <div className={styles.bookInfo}>
                <h3 className={styles.bookTitle} title={file.title}>
                  {file.title}
                </h3>
                
                <div className={styles.bookMeta}>
                   <BookIcon className={styles.metaIcon} />
                   <span>
                     {file.ebook_category ? file.ebook_category : "Documento"}
                   </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}