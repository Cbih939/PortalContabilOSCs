// src/components/layout/Sidebar.jsx

import React from 'react';
import { clsx } from 'clsx';

/**
 * Um 'molde' de Sidebar genérico e reutilizável.
 */
export default function Sidebar({
  isOpen,
  logo,
  children,
  footer,
  className = 'bg-gray-800', // Padrão cinza escuro
}) {
  return (
    <aside
      className={clsx(
        'text-white flex flex-col transition-all duration-300 ease-in-out flex-shrink-0 overflow-hidden', // Adicionado overflow-hidden aqui
        isOpen ? 'w-64' : 'w-0',
        className
      )}
    >
      {/* Container interno para evitar que o conteúdo vaze durante a transição */}
      <div className="flex flex-col h-full">
        {/* --- Logo --- */}
        <div className="p-6 border-b border-gray-700 whitespace-nowrap">
          {logo}
        </div>

        {/* --- Links de Navegação --- */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {children}
        </nav>

        {/* --- Rodapé --- */}
        <div className="p-4 border-t border-gray-700 whitespace-nowrap">
          {footer}
        </div>
      </div>
    </aside>
  );
}