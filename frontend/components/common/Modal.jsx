// src/components/common/Modal.js

import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { clsx } from 'clsx';
import { XIcon } from './Icons';
import Button from './Button';

/**
 * Um componente de Modal genérico e acessível, renderizado em um portal.
 *
 * Props:
 * - isOpen (boolean): Controla a visibilidade do modal.
 * - onClose (function): Função chamada ao clicar no 'X', no overlay ou ao pressionar 'Esc'.
 * - title (string | ReactNode): O título exibido no cabeçalho do modal.
 * - children (ReactNode): O conteúdo principal do modal (o "corpo").
 * - footer (ReactNode): (Opcional) Conteúdo para o rodapé, geralmente botões de ação.
 * - size (string): 'sm', 'md', 'lg', 'xl' (default: 'lg'). Controla o max-width.
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'lg',
}) {
  // Efeito para fechar o modal ao pressionar a tecla "Escape"
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Função de limpeza: remove o listener quando o componente é desmontado
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]); // Depende de isOpen e onClose

  // Não renderiza nada se o modal não estiver aberto
  if (!isOpen) return null;

  // --- Mapeamento de Tamanhos ---
  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl', // Padrão
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
  };

  // Usamos ReactDOM.createPortal para renderizar o modal
  // diretamente no <body>, evitando problemas de z-index e overflow.
  return ReactDOM.createPortal(
    <div
      // --- Overlay ---
      // Cobre a tela inteira, centraliza o conteúdo, e tem um z-index alto.
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300"
      onClick={onClose} // Fecha o modal ao clicar no fundo (overlay)
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        // --- Painel do Modal ---
        // 'onClick' com 'stopPropagation' impede que o clique *dentro*
        // do modal feche o modal (já que o clique se propagaria para o overlay).
        onClick={(e) => e.stopPropagation()}
        className={clsx(
          'bg-white rounded-lg shadow-xl w-full flex flex-col',
          'max-h-[90vh]', // Altura máxima para permitir scroll em telas pequenas
          sizeStyles[size] // Aplica a classe de tamanho
        )}
      >
        {/* --- Cabeçalho --- */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h3 id="modal-title" className="text-xl font-semibold text-gray-800">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1 rounded-full"
            aria-label="Fechar modal"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        {/* --- Conteúdo (Corpo) --- */}
        <div className="overflow-y-auto p-6 flex-1">{children}</div>

        {/* --- Rodapé (Opcional) --- */}
        {footer && (
          <div className="p-4 border-t border-gray-200 flex justify-end space-x-3 bg-gray-50 rounded-b-lg">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body // Onde o portal será renderizado
  );
}

/**
 * --- Como Usar ---
 *
 * import Modal from './Modal';
 * import Button from './Button';
 * import { useState } from 'react';
 *
 * function MyComponent() {
 * const [isModalOpen, setIsModalOpen] = useState(false);
 *
 * const handleSave = () => {
 * console.log('Salvando...');
 * setIsModalOpen(false);
 * };
 *
 * return (
 * <>
 * <Button onClick={() => setIsModalOpen(true)}>Abrir Modal</Button>
 *
 * <Modal
 * isOpen={isModalOpen}
 * onClose={() => setIsModalOpen(false)}
 * title="Título do Meu Modal"
 * footer={
 * <>
 * <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
 * Cancelar
 * </Button>
 * <Button variant="primary" onClick={handleSave}>
 * Salvar Alterações
 * </Button>
 * </>
 * }
 * >
 * <p>Este é o conteúdo do modal.</p>
 * <p>Você pode colocar formulários, textos, ou qualquer JSX aqui.</p>
 * </Modal>
 * </>
 * );
 * }
 */