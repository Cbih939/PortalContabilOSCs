import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import * as docService from '../../services/documentService.js';
import PdfThumbnail from '../osc/components/PdfThumbnail.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { DownloadIcon } from '../../components/common/Icons.jsx';
import { formatDate } from '../../utils/formatDate.js';
import styles from './Documents.module.css';

export default function ContadorDocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReceivedDocs = async () => {
    setIsLoading(true);
    try {
      // Tenta chamar a rota correta. Certifique-se que o service usa /documents/received
      const data = await docService.getReceivedDocuments(); 
      
      // Ordenação Alfanumérica pelo nome do remetente ou título
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
      <h1 className={styles.title}>Documentos Recebidos das OSCs</h1>

      {isLoading ? (
        <Spinner text="Carregando documentos..." />
      ) : documents.length === 0 ? (
        <div className={styles.empty}>Nenhum documento recebido até o momento.</div>
      ) : (
        /* Grelha de 5 colunas idêntica à da OSC */
        <div className={styles.pdfGrid}>
          {documents.map((doc) => (
            <div 
              key={doc.id} 
              className={styles.pdfCard} 
              onClick={() => handleDownload(doc)}
            >
              <div className={styles.pdfThumbnail}>
                {/* Miniatura da capa do PDF */}
                <PdfThumbnail fileUrl={`${import.meta.env.VITE_API_URL}/${doc.file_path}`} />
                
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
          ))}
        </div>
      )}
    </div>
  );
}