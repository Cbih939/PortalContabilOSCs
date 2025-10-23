// src/pages/contador/components/DocumentViewModal.jsx

import React from 'react';
import Modal from '../../../components/common/Modal.jsx';
import Button from '../../../components/common/Button.jsx';
import { FileIcon } from '../../../components/common/Icons.jsx';
import styles from './DocumentViewModal.module.css'; // Importa CSS
import { formatDate } from '../../../utils/formatDate.js';

/**
 * Modal para Visualizar um Documento (Simulação - CSS Modules).
 */
export default function DocumentViewModal({ isOpen, onClose, file }) {
  if (!file) return null;

  const modalFooter = (
    <Button variant="secondary" onClick={onClose}>
      Fechar
    </Button>
  );

  // Título com ícone
  const modalTitle = (
    <span className={styles.modalTitle}>
      <FileIcon className={styles.titleIcon} />
      {file.name}
    </span>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      footer={modalFooter}
      size="2xl" // Tamanho grande
    >
      {/* Corpo do Modal - Simulação */}
      <div className={styles.modalBody}>
        <p>Visualização do documento.</p>
        <p>(Isto é uma simulação)</p>

        <div className={styles.detailsBox}>
          <p><strong>De:</strong> {file.from}</p>
          <p><strong>Data de envio:</strong> {formatDate(file.date)}</p>
          {/* Adicionar mais detalhes se necessário */}
        </div>
      </div>
    </Modal>
  );
}