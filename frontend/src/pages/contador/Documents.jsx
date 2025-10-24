// src/pages/contador/Documents.jsx

import React, { useState, useEffect } from 'react';
// REMOVE import { mockFiles } from '../../utils/mockData.js';
// REMOVE import { ROLES } from '../../utils/constants.js';
import * as docService from '../../services/documentService.js'; // Importa serviço real
// Componentes
import DocumentListView from './components/DocumentListView.jsx';
import DocumentViewModal from './components/DocumentViewModal.jsx';
// Hooks e UI
import Spinner from '../../components/common/Spinner.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx'; // Para erros

/**
 * Página de Documentos do Contador (Conectada à API).
 */
export default function DocumentsPage() {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorLoading, setErrorLoading] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const addNotification = useNotification();

  // --- Efeito para Buscar Dados da API ---
  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      setErrorLoading(null);
      try {
        const response = await docService.getReceivedDocuments(); // Chama API real
        // Ordena por data (opcional, backend pode já fazer isso)
        const sortedFiles = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setFiles(sortedFiles);
      } catch (err) {
        console.error("Erro ao buscar documentos:", err);
        setErrorLoading("Não foi possível carregar os documentos. Tente novamente.");
        addNotification("Erro ao carregar documentos.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDocuments();
  }, [addNotification]); // Adiciona addNotification como dependência

  // --- Handlers Modal (sem alterações) ---
  const handleViewDocument = (file) => {
    setSelectedFile(file);
    setIsViewModalOpen(true);
  };
  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setTimeout(() => setSelectedFile(null), 300);
  };

  // --- Handler Download (Atualizado) ---
  const handleDownloadDocument = async (file) => {
    // Renomeado de handlePrintDocument
    addNotification(`A iniciar download de: ${file.name}`, 'info'); // Feedback inicial
    try {
      // Chama a função do serviço que faz a chamada API e aciona o download
      await docService.downloadDocument(file.id, file.original_name || file.name); // Passa ID e nome original
    } catch (err) {
      console.error("Erro no download:", err);
      addNotification(err.message || 'Falha no download.', 'error');
    }
  };

  // --- Renderização ---
  if (isLoading) {
     return (
       <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 100px)' }}>
          <Spinner text="Carregando documentos..." />
       </div>
     );
  }
  if (errorLoading) {
      return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{errorLoading}</div>;
  }

  return (
    <>
      <DocumentListView
        files={files} // Passa ficheiros da API
        onView={handleViewDocument}
        onPrint={handleDownloadDocument} // Passa handler de DOWNLOAD para a prop 'onPrint'
      />
      <DocumentViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        file={selectedFile}
      />
    </>
  );
}