// src/pages/contador/Documents.js

import React, { useState, useEffect } from 'react';
// Importa os dados mockados (no futuro, virá da API)
import { mockFiles } from '../../utils/mockData';
import { ROLES } } from '../../utils/constants';
// Importa o componente de apresentação (a tabela)
import DocumentListView from './components/DocumentListView';
// Importa o Modal de visualização
import DocumentViewModal from './components/DocumentViewModal';
import Spinner from '../../components/common/Spinner';
// import { useApi } from '../../hooks/useApi'; // (Para API real)
// import * as docService from '../../services/documentService'; // (Para API real)

/**
 * Página do Contador para listar e visualizar documentos recebidos.
 *
 * Este é o componente "inteligente" (contêiner) que:
 * 1. Busca os dados (documentos).
 * 2. Gerencia o estado dos modais (ex: 'isViewModalOpen').
 * 3. Passa os dados e handlers para o 'DocumentListView' (apresentação).
 */
export default function DocumentsPage() {
  // --- Estados de Dados ---
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // (Para API real, você usaria o useApi/useQuery aqui)
  // const { data: files, isLoading } = useQuery(docService.getReceivedFiles);

  // --- Estados de UI (Modais) ---
  const [selectedFile, setSelectedFile] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // --- Efeito para Buscar os Dados (Simulação) ---
  useEffect(() => {
    setIsLoading(true);
    // Simula uma chamada de API
    setTimeout(() => {
      // Filtra apenas os arquivos enviados PARA o Contador
      const contadorFiles = mockFiles.filter(
        (f) => f.to === ROLES.CONTADOR
      );
      setFiles(contadorFiles);
      setIsLoading(false);
    }, 500); // 500ms de delay
  }, []); // O array vazio [] garante que rode apenas uma vez

  // --- Handlers de Ação (passados para o ListView) ---

  /** Abre o modal de visualização */
  const handleViewDocument = (file) => {
    setSelectedFile(file);
    setIsViewModalOpen(true);
  };

  /** Fecha o modal de visualização */
  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    // Aguarda a animação de fechar antes de limpar,
    // para o conteúdo não "piscar"
    setTimeout(() => setSelectedFile(null), 300);
  };

  /** Simula a ação de imprimir */
  const handlePrintDocument = (file) => {
    alert(`Simulando impressão do documento: ${file.name}`);
    // No futuro: window.print() ou uma lib de impressão
  };

  // --- Renderização ---

  // Exibe um spinner enquanto os dados carregam
  if (isLoading) {
    return <Spinner fullscreen text="Carregando documentos..." />;
  }

  return (
    <>
      {/* 1. O Componente de Apresentação (Tabela e Filtros) */}
      <DocumentListView
        files={files}
        onView={handleViewDocument}
        onPrint={handlePrintDocument}
      />

      {/* 2. O Modal (controlado por esta página) */}
      {/* O modal só é renderizado se um 'selectedFile' existir,
          o que melhora a performance. */}
      {selectedFile && (
        <DocumentViewModal
          isOpen={isViewModalOpen}
          onClose={handleCloseViewModal}
          file={selectedFile}
        />
      )}
    </>
  );
}