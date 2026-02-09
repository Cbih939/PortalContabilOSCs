import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import * as docService from '../../services/documentService.js';
import PdfThumbnail from '../osc/components/PdfThumbnail.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { DownloadIcon } from '../../components/common/Icons.jsx';
import { formatDate } from '../../utils/formatDate.js';
import styles from './Documents.module.css';

// Ícone de Informação (Tooltip)
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

export default function ContadorDocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Função para verificar se é imagem
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
          <InfoIcon />
          <span className={styles.tooltipText}>
            Esta central reúne todos os documentos enviados pelas suas OSCs. Ao clicar em um arquivo, você pode descarregá-lo para realizar a conferência.
          </span>
        </div>
      </div>

      {isLoading ? (
        <Spinner text="Carregando documentos..." />
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
                  {/* LÓGICA DE TRATAMENTO DE IMAGEM VS PDF */}
                  {isImage(fileName) ? (
                    <img 
                      src={fileUrl} 
                      alt="Preview" 
                      className={styles.imagePreview}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = '/placeholder-file.png'; }} // Caso dê 404
                    />
                  ) : (
                    <PdfThumbnail fileUrl={fileUrl} />
                  )}
                  
                  <div className={styles.downloadOverlay}>
                    <DownloadIcon />
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