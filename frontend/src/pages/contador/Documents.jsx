import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import * as docService from '../../services/documentService.js';
import PdfThumbnail from '../osc/components/PdfThumbnail.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { formatDate } from '../../utils/formatDate.js';
import styles from './Documents.module.css';
import { FiInfo, FiDownload } from 'react-icons/fi';

export default function ContadorDocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const isImage = (fileName) => {
    return /\.(jpg|jpeg|png|webp|gif)$/i.test(fileName);
  };

  const fetchReceivedDocs = async () => {
    setIsLoading(true);
    try {
      const data = await docService.getReceivedDocuments(); 
      const sorted = data.sort((a, b) => 
        (a.title || a.original_name).localeCompare(b.title || b.original_name)
      );
      setDocuments(sorted);
    } catch (error) {
      console.error("Erro ao carregar documentos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReceivedDocs();
  }, []);

  const handleDownload = async (doc) => {
    try {
      await docService.downloadDocument(doc.id, doc.original_name || doc.title);
    } catch (error) {
      alert("Erro ao descarregar arquivo.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerWithInfo}>
        <h1 className={styles.title}>Documentos Recebidos das OSCs</h1>
        <div className={styles.tooltipContainer}>
          <FiInfo className={styles.infoIcon} />
          <span className={styles.tooltipText}>
            Esta central reúne todos os documentos enviados pelas suas OSCs. Ao clicar em um arquivo, você pode descarregá-lo para realizar a conferência.
          </span>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Spinner text="Carregando documentos..." /></div>
      ) : documents.length === 0 ? (
        <div className={styles.empty}>Nenhum documento recebido até o momento.</div>
      ) : (
        <div className={styles.pdfGrid}>
          {documents.map((doc) => {
            const fileUrl = `${import.meta.env.VITE_API_URL}/uploads/${doc.file_path}`;
            const fileName = doc.file_path || doc.original_name || "";

            return (
              <div 
                key={doc.id} 
                className={styles.pdfCard} 
                onClick={() => handleDownload(doc)}
              >
                <div className={styles.pdfThumbnail}>
                  {isImage(fileName) ? (
                    <img 
                      src={fileUrl} 
                      alt="Preview" 
                      className={styles.imagePreview}
                      onError={(e) => { e.target.src = '/placeholder-file.png'; }} 
                    />
                  ) : (
                    <PdfThumbnail fileUrl={fileUrl} />
                  )}
                  
                  <div className={styles.downloadOverlay}>
                    <FiDownload className={styles.downloadIcon} />
                  </div>
                </div>
                
                <div className={styles.pdfInfo}>
                  <span className={styles.pdfName} title={doc.title || doc.original_name}>
                    {doc.title || doc.original_name}
                  </span>
                  <span className={styles.senderBadge}>{doc.sender_name}</span>
                  <span className={styles.pdfDate}>{formatDate(doc.created_at)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}