// src/components/common/Input.jsx

import React from 'react';
import { clsx } from 'clsx';
// Assume que Icons.jsx existirá em './Icons.jsx'
// import { SearchIcon } from './Icons.jsx'; // Exemplo de importação

/**
 * Componente de Input reutilizável com suporte a label, ícone e erro.
 */
export default function Input({
  label,
  id,
  name,
  icon: IconComponent,
  error,
  className,
  inputClassName,
  ...props
}) {
  const baseInputStyles =
    'block w-full p-3 border rounded-lg shadow-sm text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed';

  const errorStyles = error
    ? 'border-red-500 focus:ring-red-500'
    : 'border-gray-300 focus:ring-blue-500';

  const iconPaddingStyles = IconComponent ? 'pl-10' : 'pl-3';

  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <label
          htmlFor={id || name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {IconComponent && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <IconComponent className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          id={id}
          name={name}
          className={clsx(
            baseInputStyles,
            errorStyles,
            iconPaddingStyles,
            inputClassName
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600" id={`${id || name}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}