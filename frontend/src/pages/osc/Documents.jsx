// src/pages/osc/Documents.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import useApi from '../../hooks/useApi.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { mockFiles } from '../../utils/mockData.js';
import { ROLES } from '../../utils/constants.js';
import DocumentUpload from './components/DocumentUpload.jsx'; // Componente refatorado
import Spinner from '../../components/common/Spinner.jsx';
import { FileIcon, DownloadIcon } from '../../components/common/Icons.jsx';
import styles from './Documents.module.css'; // Importa CSS Module da página
// import * as docService from '../../services/documentService.js'; // API real

// --- Mock API ---
const mockUploadApi = (formData) => new Promise(resolve => { /* ... (como antes) ... */ });
// ---

/**
 * Página de Documentos da OSC (CSS Modules).
 */
export default function OSCDocumentsPage() {
  const { user } = useAuth();
  const addNotification = useNotification();
  const [myFiles, setMyFiles] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const { request: uploadFile, isLoading: isUploading } = useApi(mockUploadApi);

  useEffect(() => {
    setIsLoadingList(true);
    setTimeout(() => {
      const filesForThisOSC = mockFiles.filter(
        f => (f.from === user.name && f.to === ROLES.CONTADOR) || (f.from === ROLES.CONTADOR && f.to === user.name)
      ).sort((a, b) => new Date(b.date) - new Date(a.date));
      setMyFiles(filesForThisOSC);
      setIsLoadingList(false);
    }, 500);
  }, [user.name]);

  const handleFileUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const newFile = await uploadFile(formData);
      addNotification('Arquivo enviado com sucesso!', 'success');
      setMyFiles((prevFiles) => [{ ...newFile, from: user.name, type: 'sent' }, ...prevFiles]);
    } catch (err) {
      console.error("Erro pego pela página:", err);
      throw err;
    }
  };

  const handleDownload = (fileName) => {
    alert(`Simulando download do ficheiro: ${fileName}`);
    // No futuro: Chamar docService.downloadDocument(fileId, fileName);
  };

  return (
    <div className={styles.pageContainer}>
      {/* Layout em Grid */}
      <div className={styles.grid}>

        {/* Coluna 1: Info e Upload */}
        <div className={styles.uploadColumn}>
          {/* Card de Informações */}
          <div className={`${styles.infoCard} mb-8`}> {/* Adiciona margem inferior */}
            <h2 className={styles.cardTitle}>Minhas Informações</h2>
            <p className={styles.infoText}>
              <strong>Nome:</strong> {user.name}
            </p>
            <p className={styles.infoText}>
              <strong>CNPJ:</strong> {user.cnpj || 'Não informado'}
            </p>
          </div>
          {/* Card de Upload */}
          <DocumentUpload onUpload={handleFileUpload} isLoading={isUploading} />
        </div>

        {/* Coluna 2: Lista de Documentos */}
        <div className={`${styles.listCard} ${styles.listColumn}`}>
          <h2 className={styles.cardTitle}>Meus Documentos</h2>
          {isLoadingList ? (
            <div className={styles.loadingContainer}>
              <Spinner text="Carregando documentos..." />
            </div>
          ) : myFiles.length === 0 ? (
            <div className={styles.emptyContainer}>
              <p>Nenhum documento encontrado.</p>
            </div>
          ) : (
            <div className={styles.fileListContainer}>
              {myFiles.map((file) => (
                <div key={file.id} className={styles.fileItem}>
                  <div className={styles.fileInfo}>
                    <FileIcon className={styles.fileIcon} />
                    <div className={styles.fileText}>
                      <span className={styles.fileName}>{file.name}</span>
                      <span className={styles.fileDate}>
                        {file.type === 'sent' ? 'Enviado' : 'Recebido'} em {file.date}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(file.name)}
                    className={styles.downloadButton}
                    aria-label={`Baixar ${file.name}`}
                  >
                    <DownloadIcon />
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