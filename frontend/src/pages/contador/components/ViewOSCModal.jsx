// src/pages/contador/components/ViewOSCModal.jsx

import React from 'react';
// import { clsx } from 'clsx'; // Não mais necessário para badge aqui
import Modal from '../../../components/common/Modal.jsx'; // Usa Modal genérico
import Button from '../../../components/common/Button.jsx'; // Usa Button genérico
import styles from './ViewOSCModal.module.css'; // CSS Module específico

/**
 * Modal para "apenas visualização" dos detalhes de uma OSC (CSS Modules).
 */
export default function ViewOSCModal({ isOpen, onClose, osc }) {
  if (!osc) return null; // Não renderiza se não houver dados

  const modalFooter = (
    <Button variant="secondary" onClick={onClose}>
      Fechar
    </Button>
  );

  // Helper Badge Status (interno ao componente)
  const StatusBadge = ({ status }) => {
    const isActive = status === 'Ativo';
    return (
      <span className={`${styles.statusBadge} ${isActive ? styles.statusBadgeActive : styles.statusBadgeInactive}`}>
        <span className={styles.statusBg}></span> {/* Fundo com opacidade */}
        <span className={styles.statusText}>{status}</span>
      </span>
    );
  };

  // Helper Campo Detalhe (interno ao componente)
  const DetailField = ({ label, value }) => (
    <div>
      <strong className={styles.fieldLabel}>{label}</strong>
      <p className={styles.fieldValue}>{value || 'Não informado'}</p>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalhes da OSC"
      footer={modalFooter}
      size="xl" // Tamanho extra large
    >
      {/* Corpo do Modal com os Detalhes */}
      <div className={styles.detailsGrid}> {/* Usa grid do CSS Module */}
        <DetailField label="Nome da OSC" value={osc.name} />
        <DetailField label="CNPJ" value={osc.cnpj} />
        <DetailField label="Responsável" value={osc.responsible} />
        <DetailField label="Email" value={osc.email} />
        <DetailField label="Telefone" value={osc.phone} />
        <div> {/* Container para o Status Badge */}
          <strong className={styles.fieldLabel}>Status</strong>
          <div style={{ marginTop: '0.25rem' }}> {/* Pequena margem */}
            <StatusBadge status={osc.status} />
          </div>
        </div>
        <div className={styles.span2}> {/* Ocupa 2 colunas */}
          <DetailField label="Endereço" value={osc.address} />
        </div>
      </div>
    </Modal>
  );
}