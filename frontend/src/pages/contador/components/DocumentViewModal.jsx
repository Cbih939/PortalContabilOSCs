// src/pages/contador/components/DocumentViewModal.jsx

import React, { useState, useEffect } from 'react';
import Modal from '../../../components/common/Modal.jsx';
import Button from '../../../components/common/Button.jsx';
import { FileIcon } from '../../../components/common/Icons.jsx';
import Spinner from '../../../components/common/Spinner.jsx';
import * as docService from '../../../services/documentService.js';
import styles from './DocumentViewModal.module.css';
import { formatDate } from '../../../utils/formatDate.js';

/**
 * Modal para Visualizar um Documento (com pré-visualização real).
 * (CORRIGIDO para ler file.original_name)
 */
export default function DocumentViewModal({ isOpen, onClose, file }) {
  const [fileUrl, setFileUrl] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState(null);

  useEffect(() => {
    const cleanup = () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
        setFileUrl(null);
      }
      setPreviewError(null);
      setFileType(null);
      setIsLoadingPreview(false);
    };

    if (isOpen && file) {
      cleanup();

      // --- CORREÇÃO AQUI ---
      // O nome do ficheiro vindo da API está em 'original_name'
      // 'file.name' (usado anteriormente) estava indefinido.
      const fileName = file.original_name || file.name || '';
      const extension = fileName.split('.').pop().toLowerCase();
      // --- FIM DA CORREÇÃO ---

      // Define o tipo de ficheiro
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
        setFileType('image');
        loadPreview(file.id); // Inicia busca
      } else if (extension === 'pdf') {
        setFileType('pdf');
        loadPreview(file.id); // Inicia busca
      } else if (['docx', 'xlsx', 'pptx'].includes(extension)) {
        setFileType('office');
        setPreviewError(`Pré-visualização de ficheiros .${extension} não é suportada. Por favor, descarregue o ficheiro.`);
      } else {
        setFileType('other');
        setPreviewError('Pré-visualização não disponível para este tipo de ficheiro.');
      }
    } else {
      cleanup();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, file]); // Roda quando o modal abre

  // Função que busca o blob e cria o URL
  const loadPreview = async (fileId) => {
    setIsLoadingPreview(true);
    try {
      const blob = await docService.getDocumentBlob(fileId);
      const url = URL.createObjectURL(blob);
      setFileUrl(url);
    } catch (err) {
      console.error("Erro ao carregar pré-visualização:", err);
      setPreviewError(err.message || "Falha ao carregar ficheiro.");
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // Limpa o Blob URL quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  // Rodapé (Botão Fechar)
  const modalFooter = (
    <Button variant="secondary" onClick={onClose}>
      Fechar
    </Button>
  );

  // Título (Nome do ficheiro)
  const modalTitle = (
    <span className={styles.modalTitle}>
      <FileIcon className={styles.titleIcon} />
      {file?.original_name || file?.name || 'Documento'} {/* Usa original_name */}
    </span>
  );

  // Função para renderizar o conteúdo
  const renderPreview = () => {
    if (isLoadingPreview) {
      return <Spinner text="A carregar pré-visualização..." />;
    }
    if (previewError) {
      return <p className={styles.previewError}>{previewError}</p>;
    }
    if (fileType === 'image' && fileUrl) {
      return <img src={fileUrl} alt={`Pré-visualização de ${file.original_name}`} className={styles.previewImage} />;
    }
    if (fileType === 'pdf' && fileUrl) {
      return <iframe src={fileUrl} className={styles.previewPdf} title={file.original_name} frameBorder="0" />;
    }
    return <p>(Pré-visualização não disponível)</p>; // Fallback
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      footer={modalFooter}
      size="2xl"
    >
      <div className={styles.modalBody}>
        {renderPreview()}
        <div className={styles.detailsBox}>
          {/* Usa 'from_name' (da API) ou 'from' (fallback) */}
          <p><strong>De:</strong> {file?.from_name || file?.from}</p>
          <p><strong>Data de envio:</strong> {formatDate(file?.created_at || file?.date)}</p>
        </div>
      </div>
    </Modal>
  );
}