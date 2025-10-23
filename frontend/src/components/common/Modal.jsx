// src/components/common/Modal.jsx

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
// import { clsx } from 'clsx'; // Não mais necessário
import { XIcon } from './Icons.jsx';
// import Button from './Button.jsx'; // Button será usado no footer passado via props
import styles from './Modal.module.css'; // Importa o CSS Module

/**
 * Componente de Modal genérico (usando CSS Modules).
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'lg', // sm, md, lg, xl, 2xl
}) {
  // Estado para controlar a animação de entrada/saída
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timeoutId;
    if (isOpen) {
      // Pequeno delay para permitir a montagem do DOM antes da animação
      timeoutId = setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false); // Inicia animação de saída
      // A limpeza real do DOM será feita no portal após a transição CSS
    }
    return () => clearTimeout(timeoutId);
  }, [isOpen]);


  // Efeito para fechar com 'Escape'
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Não renderiza o portal se não for para estar aberto
  if (!isOpen) return null;

  // Mapeamento de tamanhos para classes CSS Module
  // Usa _2xl porque '2xl' não é nome de classe válido
  const sizeClassMap = { sm: styles.sm, md: styles.md, lg: styles.lg, xl: styles.xl, '2xl': styles._2xl };
  const sizeClass = sizeClassMap[size] || styles.lg; // Usa lg como padrão

  return ReactDOM.createPortal(
    <div
      className={`${styles.overlay} ${isVisible ? styles.overlayOpen : ''}`} // Controla opacidade do overlay
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        // Combina classes do modal panel, tamanho e animação
        className={`
          ${styles.modalPanel}
          ${sizeClass}
          ${isVisible ? styles.modalPanelOpen : ''}
        `}
      >
        {/* Cabeçalho */}
        <div className={styles.modalHeader}>
          <h3 id="modal-title" className={styles.modalTitle}>
            {title}
          </h3>
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Fechar modal"
          >
            <XIcon /> {/* O CSS Module estiliza o SVG interno */}
          </button>
        </div>

        {/* Corpo */}
        <div className={styles.modalBody}>{children}</div>

        {/* Rodapé (Opcional) */}
        {footer && (
          <div className={styles.modalFooter}>{footer}</div>
        )}
      </div>
    </div>,
    document.body
  );
}