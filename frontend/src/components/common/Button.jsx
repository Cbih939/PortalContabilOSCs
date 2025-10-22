// src/components/common/Button.jsx

import React from 'react';
import { clsx } from 'clsx';

/**
 * Um componente de botão reutilizável com variantes de estilo.
 */
export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  as: Component = 'button', // Permite usar como Link (ex: as={Link})
  ...props
}) {
  const baseStyles =
    'flex items-center justify-center font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100';

  const variantStyles = {
    primary:
      'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary:
      'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400',
    danger:
      'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500',
    ghost:
      'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-400',
  };

  const sizeStyles = {
    sm: 'py-1 px-3 text-sm',
    md: 'py-2 px-4',
    lg: 'py-3 px-6 text-lg',
  };

  return (
    <Component // Usa 'button' ou o componente passado em 'as'
      onClick={onClick}
      className={clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}