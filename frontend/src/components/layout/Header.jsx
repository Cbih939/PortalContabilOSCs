// src/components/layout/Header.jsx

import React from 'react';

/**
 * Um 'molde' de cabeçalho genérico e reutilizável.
 */
export default function Header({ leftContent, rightContent }) {
  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center z-10">
      {/* --- Lado Esquerdo --- */}
      <div className="flex items-center">
        {leftContent}
      </div>

      {/* --- Lado Direito --- */}
      <div className="flex items-center space-x-4">
        {rightContent}
      </div>
    </header>
  );
}