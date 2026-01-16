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
      // Verificação de segurança para garantir que response.data existe
      const docs = Array.isArray(response.data) ? response.data : [];
      
      const sortedData = docs.sort((a, b) => {
        const nameA = (a.name || a.original_name || "").toLowerCase();
        const nameB = (b.name || b.original_name || "").toLowerCase();
        return nameA.localeCompare(nameB);
      });
      setMyFiles(sortedData);
    } catch (err) {
      console.error("Erro ao buscar documentos:", err);
      setErrorLoading("Não foi possível carregar os documentos.");
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
      await uploadFile(formData);
      addNotification('Ficheiro enviado com sucesso!', 'success');
      await fetchDocuments();
    } catch (err) {
      addNotification(`Falha no upload: ${err.message}`, 'error');
    }
  };

  const handleDownload = async (file) => {
    try {
      // Usamos o service que já lida com o token e a URL correta
      await docService.downloadDocument(file.id, file.original_name || file.name);
    } catch (err) {
      addNotification('Erro ao descarregar ficheiro.', 'error');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.grid}>
        <div className={styles.uploadColumn}>
          <div className={styles.infoCard}>
            <p className={styles.welcomeText}>
              Caro usuário, este é o espaço para compartilhamento dos seus documentos oficiais. 
              Baixe-os na aba <Link to="/osc/modelos" className={styles.orangeLink}>"Docs | Modelos"</Link> e envie-os abaixo:
            </p>
            <p className={styles.infoText}><strong>Nome:</strong> {user?.name}</p>
            <p className={styles.infoText}><strong>CNPJ:</strong> {user?.cnpj || 'Não informado'}</p>
          </div>
          <div style={{ marginTop: '1.5rem' }}>
            <DocumentUpload onUpload={handleFileUpload} isLoading={isUploading} />
          </div>
        </div>

        <div className={styles.listCard}>
          <h2 className={styles.cardTitle}>Meus Documentos</h2>

          {isLoadingList ? (
            <div className={styles.loadingContainer}><Spinner text="A carregar..." /></div>
          ) : errorLoading ? (
            <div className={styles.emptyContainer} style={{color: 'red'}}>{errorLoading}</div>
          ) : myFiles.length === 0 ? (
            <div className={styles.emptyContainer}><p>Nenhum documento encontrado.</p></div>
          ) : (
            <div className={styles.fileListContainer}>
              {myFiles.map((file) => (
                <div key={file.id} className={styles.fileItem}>
                  <div className={styles.fileInfo}>
                    <FileIcon className={styles.fileIcon} />
                    <div className={styles.fileText}>
                      <span className={styles.fileName}>
                        {file.name || file.original_name}
                      </span>
                      <span className={styles.fileDate}>
                        Postado em {formatDate(file.date || file.created_at)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(file)}
                    className={styles.downloadButton}
                  >
                    <DownloadIcon className={styles.icon} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}