import React from 'react';
import { clsx } from 'clsx';

/**
 * Um componente de botão reutilizável com variantes de estilo.
 *
 * Props:
 * - children: O conteúdo do botão (texto, ícone, etc.).
 * - onClick: A função a ser chamada quando o botão é clicado.
 * - variant: 'primary', 'secondary', 'danger' (default: 'primary').
 * - size: 'sm', 'md', 'lg' (default: 'md').
 * - className: Classes CSS adicionais para customização.
 * - Outras props (ex: type="submit", disabled) serão passadas diretamente
 * para o elemento <button>.
 */
export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props // Pega todas as outras props (ex: type, disabled)
}) {
  // --- Estilos Base ---
  // Estilos que se aplicam a todos os botões
  const baseStyles =
    'flex items-center justify-center font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100';

  // --- Estilos por Variante ---
  // Define as classes de cor para cada tipo de botão
  const variantStyles = {
    primary:
      'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary:
      'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400',
    danger:
      'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500',
    ghost: // Um botão transparente, bom para ícones
      'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-400',
  };

  // --- Estilos por Tamanho ---
  // Define o padding e o tamanho da fonte
  const sizeStyles = {
    sm: 'py-1 px-3 text-sm',
    md: 'py-2 px-4', // Padrão
    lg: 'py-3 px-6 text-lg',
  };

  return (
    <button
      onClick={onClick}
      // clsx() junta todas as classes de forma inteligente
      className={clsx(
        baseStyles,
        variantStyles[variant], // Pega o estilo da variante correta
        sizeStyles[size],         // Pega o estilo do tamanho correto
        className                 // Adiciona qualquer classe extra passada via props
      )}
      {...props} // Aplica props como 'disabled' ou 'type="submit"'
    >
      {children}
    </button>
  );
}

/**
 * --- Como Usar ---
 *
 * import Button from './Button';
 *
 * // Botão primário (padrão)
 * <Button onClick={() => alert('Clique!')}>Enviar Arquivo</Button>
 *
 * // Botão de perigo, grande, para submeter um formulário
 * <Button variant="danger" size="lg" type="submit">Excluir OSC</Button>
 *
 * // Botão secundário, pequeno e desabilitado
 * <Button variant="secondary" size="sm" disabled={true}>Cancelar</Button>
 *
 */