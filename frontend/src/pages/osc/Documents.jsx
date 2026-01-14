import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import useApi from '../../hooks/useApi.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { Link } from 'react-router-dom';
import * as docService from '../../services/documentService.js';
import DocumentUpload from './components/DocumentUpload.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { FileIcon, DownloadIcon } from '../../components/common/Icons.jsx';
import { formatDate } from '../../utils/formatDate.js';
import styles from './Documents.module.css';

export default function OSCDocumentsPage() {
  const { user } = useAuth();
  const addNotification = useNotification();

  const [myFiles, setMyFiles] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [errorLoading, setErrorLoading] = useState(null);

  const { request: uploadFile, isLoading: isUploading } = useApi(docService.uploadDocument);

  const fetchDocuments = async () => {
    setIsLoadingList(true);
    setErrorLoading(null);
    try {
      const response = await docService.getMyDocuments();
      // Ordenação Alfanumérica pelo nome do ficheiro
      const sortedData = response.data.sort((a, b) => {
        const nameA = (a.name || a.original_name).toLowerCase();
        const nameB = (b.name || b.original_name).toLowerCase();
        return nameA.localeCompare(nameB);
      });
      setMyFiles(sortedData);
    } catch (err) {
      console.error("Erro ao buscar documentos:", err);
      setErrorLoading("Não foi possível carregar os documentos.");
      addNotification("Erro ao carregar documentos.", "error");
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    if(user?.id) fetchDocuments();
  }, [user?.id]);

  const handleFileUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const newFile = await uploadFile(formData);
      addNotification('Ficheiro enviado com sucesso!', 'success');
      await fetchDocuments(); // Recarrega para manter a ordem alfanumérica
    } catch (err) {
      addNotification(`Falha no upload: ${err.response?.data?.message || err.message}`, 'error');
      throw err;
    }
  };

  const handleDownload = async (file) => {
    addNotification(`A iniciar download: ${file.name || file.original_name}`, 'info');
    try {
      await docService.downloadDocument(file.id, file.original_name || file.name);
    } catch (err) {
      addNotification(err.message || 'Falha no download.', 'error');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.grid}>
        {/* Coluna 1: Info e Upload */}
        <div className={styles.uploadColumn}>
          <div className={`${styles.infoCard} mb-8`}>
            <p className={styles.welcomeText}>
              Caro usuário, este é o espaço para compartilhamento dos seus documentos oficiais. 
              Baixe-os na aba{" "}
              <Link to="/osc/modelos" className={styles.orangeLink}>
                "Docs | Modelos"
              </Link>
              , realize o registro em cartório (ou assine virtualmente) e os encaminhe para o nosso aplicativo abaixo:
            </p>
            <p className={styles.infoText}><strong>Nome:</strong> {user.name}</p>
            <p className={styles.infoText}><strong>CNPJ:</strong> {user.cnpj || 'Não informado'}</p>
          </div>
          <DocumentUpload onUpload={handleFileUpload} isLoading={isUploading} />
        </div>

        {/* Coluna 2: Lista de Documentos em Grelha (Miniaturas) */}
        <div className={`${styles.listCard} ${styles.listColumn}`}>
          <h2 className={styles.cardTitle}>Meus Documentos</h2>

          {isLoadingList ? (
            <div className={styles.loadingContainer}><Spinner text="A carregar..." /></div>
          ) : errorLoading ? (
            <div className={styles.emptyContainer} style={{color: 'red'}}>{errorLoading}</div>
          ) : myFiles.length === 0 ? (
            <div className={styles.emptyContainer}><p>Nenhum documento encontrado.</p></div>
          ) : (
            <div className={styles.pdfGrid}>
              {myFiles.map((file) => (
                <div 
                  key={file.id} 
                  className={styles.pdfCard} 
                  onClick={() => handleDownload(file)}
                >
                  <div className={styles.pdfThumbnail}>
                    <FileIcon className={styles.pdfIconLarge} />
                    <div className={styles.downloadOverlay}>
                      <DownloadIcon />
                    </div>
                  </div>
                  <div className={styles.pdfInfo}>
                    <span className={styles.pdfName} title={file.name || file.original_name}>
                      {file.name || file.original_name}
                    </span>
                    <span className={styles.pdfDate}>{formatDate(file.date || file.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}