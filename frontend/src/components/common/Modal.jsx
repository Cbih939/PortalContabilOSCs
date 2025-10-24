// src/components/common/Modal.jsx

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
// Garanta que XIcon está a ser exportado corretamente de Icons.jsx
import { XIcon } from './Icons.jsx';
import styles from './Modal.module.css'; // Importa o CSS Module

/**
 * Componente de Modal genérico (usando CSS Modules).
 */
export default function Modal({
  isOpen,
  onClose, // Função para fechar (passada pelo pai)
  title,
  children,
  footer,
  size = 'lg', // sm, md, lg, xl, 2xl
}) {
  const [isVisible, setIsVisible] = useState(false);

  // Controla animação de entrada/saída
  useEffect(() => {
    let timeoutId;
    if (isOpen) {
      timeoutId = setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      // O portal será desmontado quando isOpen se tornar false
    }
    return () => clearTimeout(timeoutId);
  }, [isOpen]);


  // Efeito para fechar com 'Escape'
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      // Verifica se onClose é uma função antes de chamar
      if (e.key === 'Escape' && typeof onClose === 'function') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]); // Inclui onClose nas dependências

  // Handler para fechar ao clicar no overlay
  const handleOverlayClick = () => {
      if (typeof onClose === 'function') {
          onClose();
      }
  };

  // Não renderiza nada se não estiver aberto
  // (Embora o portal controle isso, é uma segurança extra)
  if (!isOpen) return null;

  // Mapeamento de tamanhos
  const sizeClassMap = { sm: styles.sm, md: styles.md, lg: styles.lg, xl: styles.xl, '2xl': styles._2xl };
  const sizeClass = sizeClassMap[size] || styles.lg;

  return ReactDOM.createPortal(
    <div
      // Aplica classes de overlay e controla visibilidade para animação
      className={`${styles.overlay} ${isVisible ? styles.overlayOpen : ''}`}
      onClick={handleOverlayClick} // <-- CORRIGIDO: Usa handler para verificar onClose
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        onClick={(e) => e.stopPropagation()} // Impede fechar ao clicar dentro do painel
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
          {/* Botão de Fechar ('X') */}
          <button
            onClick={onClose} // <-- CORRIGIDO: Garante que chama a prop onClose
            className={styles.closeButton}
            aria-label="Fechar modal"
            type="button" // Garante que não submete formulários
          >
            <XIcon /> {/* Garanta que XIcon é importado corretamente */}
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