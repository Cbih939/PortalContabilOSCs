import React, { useEffect, useState } from 'react';
import * as fileService from '../../services/publicFileService.js';
import PdfThumbnail from '../osc/components/PdfThumbnail.jsx'; 
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
    // Busca arquivos da categoria BIBLIOTECA
    fileService.getFilesByCategory('BIBLIOTECA')
      .then(data => {
        // Filtro de segurança
        const filtered = data.filter(f => f.category === 'BIBLIOTECA');
        
        // Ordenação Alfanumérica
        const sorted = filtered.sort((a, b) => 
          (a.title || "").toLowerCase().localeCompare((b.title || "").toLowerCase())
        );
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
      <h1 className={styles.title}>Biblioteca | Downloads</h1>

      {isLoading ? (
        <div className={styles.loading}>Carregando biblioteca...</div>
      ) : ebooks.length === 0 ? (
        <div className={styles.empty}>Nenhum e-book disponível no momento.</div>
      ) : (
        <div className={styles.libraryGrid}>
          {ebooks.map((file) => (
            <div 
              key={file.id} 
              className={styles.bookCard} 
              onClick={() => handleDownload(file.file_path)}
            >
              <div className={styles.thumbnailWrapper}>
                {/* Lógica da Capa */}
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
                
                {/* --- AQUI ESTÁ A ALTERAÇÃO --- */}
                <div className={styles.bookMeta}>
                   <BookIcon className={styles.metaIcon} />
                   <span>
                     {/* Se existir 'ebook_category' no banco, usa ela. 
                         Se não, usa o padrão 'E-book / PDF' */}
                     {file.ebook_category}
                   </span>
                </div>
                {/* ----------------------------- */}

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}