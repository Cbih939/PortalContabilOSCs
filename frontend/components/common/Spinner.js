// src/components/common/Spinner.js

import React from 'react';
import { clsx } from 'clsx';

/**
 * Componente de Spinner (indicador de carregamento) reutilizável.
 *
 * Props:
 * - size: 'sm', 'md', 'lg' (default: 'md'). Controla o tamanho do spinner.
 * - className: Classes CSS adicionais para o contêiner do spinner.
 * - text: (Opcional) Texto para exibir abaixo do spinner (ex: "Carregando...").
 * - fullscreen (boolean): (Opcional) Se true, centraliza o spinner na tela inteira com um overlay.
 */
export default function Spinner({
  size = 'md',
  className,
  text,
  fullscreen = false,
}) {
  // --- Mapeamento de Tamanhos ---
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', // Padrão
    lg: 'w-16 h-16',
  };

  // --- Estilos Base ---
  const spinnerStyles = clsx(
    'animate-spin rounded-full border-solid border-blue-600 border-t-transparent',
    sizeStyles[size],
    {
      'border-2': size === 'sm',
      'border-4': size === 'md',
      'border-4': size === 'lg',
    }
  );

  const spinnerComponent = (
    <div
      className={clsx(
        'flex flex-col items-center justify-center',
        className
      )}
    >
      <div className={spinnerStyles} role="status" aria-label="Carregando"></div>
      {text && (
        <span className="mt-2 text-sm font-medium text-gray-700">{text}</span>
      )}
    </div>
  );

  // Se 'fullscreen' for true, renderiza em um overlay
  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 z-50 flex justify-center items-center">
        {spinnerComponent}
      </div>
    );
  }

  return spinnerComponent;
}

/**
 * --- Como Usar ---
 *
 * import Spinner from './Spinner';
 *
 * // Spinner padrão (tamanho 'md')
 * <Spinner />
 *
 * // Spinner pequeno (bom para botões)
 * <Button disabled>
 * <Spinner size="sm" className="mr-2" />
 * Enviando...
 * </Button>
 *
 * // Spinner grande com texto
 * <Spinner size="lg" text="Carregando dados..." />
 *
 * // Spinner em tela cheia (para carregar a página inteira)
 * <Spinner fullscreen text="Aguarde..." />
 *
 */