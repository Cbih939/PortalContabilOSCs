// src/pages/contador/Documents.jsx

import React, { useState, useEffect } from 'react';
// Importa mocks e constantes (ajuste 'from' e 'to' nos mocks se necessário)
import { mockFiles } from '../../utils/mockData.js';
import { ROLES } from '../../utils/constants.js';
// Importa componentes de apresentação
import DocumentListView from './components/DocumentListView.jsx';
import DocumentViewModal from './components/DocumentViewModal.jsx'; // Importa o modal
// Importa hooks e UI
import Spinner from '../../components/common/Spinner.jsx';
// import useApi from '../../hooks/useApi.jsx'; // Para API real
// import * as docService from '../../services/documentService.js'; // Para API real

/**
 * Página de Documentos do Contador (CSS Modules).
 */
export default function DocumentsPage() {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null); // Estado para o modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false); // Estado para o modal

  // Efeito para buscar dados (simulação)
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      // Filtra ficheiros enviados PARA o Contador
      const contadorFiles = mockFiles.filter(f => f.to === ROLES.CONTADOR)
                                   .sort((a,b) => new Date(b.date) - new Date(a.date)); // Ordena
      setFiles(contadorFiles);
      setIsLoading(false);
    }, 500);
  }, []);

  // Handlers para o Modal
  const handleViewDocument = (file) => {
    setSelectedFile(file);
    setIsViewModalOpen(true);
  };
  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setTimeout(() => setSelectedFile(null), 300); // Limpa após animação
  };

  // Handler para Impressão (simulado)
  const handlePrintDocument = (file) => {
    alert(`Simulando impressão do documento: ${file.name}`);
    // No futuro: Chamar API de download (docService.downloadDocument) e/ou window.print()
  };

  // Renderização
  if (isLoading) {
     return ( // Spinner dentro do layout
         <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 100px)' }}>
             <Spinner text="Carregando documentos..." />
         </div>
     );
  }

  return (
    <>
      <DocumentListView
        files={files}
        onView={handleViewDocument} // Passa handler para abrir modal
        onPrint={handlePrintDocument}
      />

      {/* Renderiza o modal apenas quando necessário */}
      <DocumentViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        file={selectedFile}
      />
    </>
  );
}