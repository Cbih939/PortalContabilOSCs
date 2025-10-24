// src/pages/osc/Documents.jsx

import React, { useState, useEffect } from 'react';
// Hooks
import { useAuth } from '../../hooks/useAuth.jsx';
import useApi from '../../hooks/useApi.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
// Serviços API
import * as docService from '../../services/documentService.js'; // Importa serviço real
// REMOVE import { mockFiles } from '../../utils/mockData.js';
// REMOVE import { ROLES } from '../../utils/constants.js';
// Componentes
import DocumentUpload from './components/DocumentUpload.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { FileIcon, DownloadIcon } from '../../components/common/Icons.jsx';
// Estilos
import styles from './Documents.module.css';

/**
 * Página de Documentos da OSC (Conectada à API).
 */
export default function OSCDocumentsPage() {
  const { user } = useAuth();
  const addNotification = useNotification();

  // --- Estados ---
  const [myFiles, setMyFiles] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [errorLoading, setErrorLoading] = useState(null);

  // Hook para a API de *upload*
  const { request: uploadFile, isLoading: isUploading } = useApi(docService.uploadDocument);

  // --- Efeito para Buscar Lista de Ficheiros ---
  const fetchDocuments = async () => { // Função separada para re-fetch
    setIsLoadingList(true);
    setErrorLoading(null);
    try {
      const response = await docService.getMyDocuments(); // Chama API real
      setMyFiles(response.data.sort((a, b) => new Date(b.date) - new Date(a.date)) || []);
    } catch (err) {
      console.error("Erro ao buscar meus documentos:", err);
      setErrorLoading("Não foi possível carregar os documentos.");
      addNotification("Erro ao carregar documentos.", "error");
    } finally {
      setIsLoadingList(false);
    }
  };

  // Busca dados na montagem
  useEffect(() => {
    if(user?.id) { // Garante que o user existe antes de buscar
        fetchDocuments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Depende apenas do user.id

  // --- Handlers ---
  const handleFileUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      // O 'to_contador_id' e 'from_osc_id' são definidos no backend (controller)
      
      const newFile = await uploadFile(formData); // Chama API real via useApi
      addNotification('Ficheiro enviado com sucesso!', 'success');

      // Atualiza a lista local (ou chama fetchDocuments() novamente)
      setMyFiles((prevFiles) => [
          {...newFile, date: newFile.created_at || newFile.date, name: newFile.original_name || newFile.name, type: 'sent'}, // Formata para corresponder à lista
          ...prevFiles
      ]);
      // Alternativa: await fetchDocuments(); // Busca a lista atualizada
    } catch (err) {
      console.error("Erro pego pela página (upload):", err);
      addNotification(`Falha no upload: ${err.response?.data?.message || err.message}`, 'error');
      throw err; // Re-lança para o componente DocumentUpload saber que falhou
    }
  };

  const handleDownload = async (file) => {
    addNotification(`A iniciar download de: ${file.name}`, 'info');
    try {
      // Usa o nome original (do DB) ou o nome (do mock/fallback)
      await docService.downloadDocument(file.id, file.original_name || file.name);
    } catch (err) {
      console.error("Erro no download:", err);
      addNotification(err.message || 'Falha no download.', 'error');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.grid}>
        {/* Coluna 1: Info e Upload */}
        <div className={styles.uploadColumn}>
          <div className={`${styles.infoCard} mb-8`}>
            <h2 className={styles.cardTitle}>Minhas Informações</h2>
            <p className={styles.infoText}><strong>Nome:</strong> {user.name}</p>
            <p className={styles.infoText}><strong>CNPJ:</strong> {user.cnpj || 'Não informado'}</p>
          </div>
          <DocumentUpload
            onUpload={handleFileUpload}
            isLoading={isUploading}
          />
        </div>

        {/* Coluna 2: Lista de Documentos */}
        <div className={`${styles.listCard} ${styles.listColumn}`}>
          <h2 className={styles.cardTitle}>Meus Documentos</h2>

          {isLoadingList ? (
            <div className={styles.loadingContainer}>
              <Spinner text="Carregando documentos..." />
            </div>
          ) : errorLoading ? (
            <div className={styles.emptyContainer} style={{color: 'red'}}>
                {errorLoading}
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
                      <span className={styles.fileName}>{file.name || file.original_name}</span>
                      <span className={styles.fileDate}>
                        {file.type === 'sent' ? 'Enviado' : 'Recebido'} em {formatDate(file.date)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(file)}
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

// Garante que formatDate está importado (se ainda não estiver no utils/formatDate.js)
import { formatDate } from '../../utils/formatDate.js';