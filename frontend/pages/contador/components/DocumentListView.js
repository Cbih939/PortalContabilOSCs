// src/pages/contador/components/DocumentListView.js

import React, { useState } from 'react';
// Importa os ícones do nosso arquivo centralizado
import { ViewIcon, PrintIcon, SearchIcon } from '../../../components/common/Icons';
import Input from '../../../components/common/Input';

/**
 * Componente "burro" que renderiza a tabela de documentos do Contador.
 *
 * Ele gerencia seus próprios filtros internos, mas delega
 * as ações (como visualizar ou imprimir) para o componente pai.
 *
 * Props:
 * - files (array): Array de objetos de arquivo para exibir.
 * - onView (function): Função chamada com (file) quando o ícone 'Ver' é clicado.
 * - onPrint (function): Função chamada com (file) quando o ícone 'Imprimir' é clicado.
 */
export default function DocumentListView({ files, onView, onPrint }) {
  const [filterOsc, setFilterOsc] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Filtra os arquivos com base nos estados de filtro
  const filteredFiles = files.filter(
    (file) =>
      // Filtro de data
      (!filterDate || file.date === filterDate) &&
      // Filtro de nome da OSC
      (!filterOsc ||
        file.from.toLowerCase().includes(filterOsc.toLowerCase()))
  );

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Documentos Recebidos
      </h2>

      {/* --- Filtros --- */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            icon={SearchIcon}
            placeholder="Filtrar por nome da OSC..."
            className="w-full"
            value={filterOsc}
            onChange={(e) => setFilterOsc(e.target.value)}
          />
          <Input
            type="date"
            placeholder="Filtrar por data..."
            className="w-full"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            // 'inputClassName' é a prop customizada do nosso componente Input
            // para garantir que o <input> tipo 'date' tenha o padding correto.
            inputClassName="p-3"
          />
        </div>
      </div>

      {/* --- Tabela de Documentos --- */}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">
                OSC Origem
              </th>
              <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">
                Nome do Arquivo
              </th>
              <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">
                Data de Envio
              </th>
              <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredFiles.length > 0 ? (
              filteredFiles.map((file) => (
                <tr key={file.id} className="hover:bg-gray-50">
                  <td className="px-5 py-5 border-b border-gray-200 text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {file.from}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {file.name}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {new Date(file.date).toLocaleDateString('pt-BR')}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 text-sm">
                    {/* Botões de Ação delegam para o pai */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onView(file)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100"
                        title="Visualizar"
                      >
                        <ViewIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onPrint(file)}
                        className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100"
                        title="Imprimir"
                      >
                        <PrintIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              // --- Mensagem de "Nenhum resultado" ---
              <tr>
                <td
                  colSpan="4"
                  className="px-5 py-10 border-b border-gray-200 text-sm text-center text-gray-500"
                >
                  Nenhum documento encontrado com os filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}