// src/pages/osc/components/UsefulDownloads.js

import React from 'react';
import { clsx } from 'clsx';
// Importa os ícones do nosso arquivo centralizado
import { DownloadIcon, ExcelIcon } from '../../../components/common/Icons';
import Button from '../../../components/common/Button'; // Importa nosso Botão genérico

/**
 * Componente "card" para a seção de "Downloads Úteis" na dashboard da OSC.
 *
 * Props:
 * - title (string): O título do card (ex: "Modelo de Controle Financeiro").
 * - fileName (string): O nome do arquivo (ex: "modelo.xlsx").
 * - IconComponent (React.Component): O ícone a ser exibido (ex: ExcelIcon).
 * - onDownload (function): Função chamada ao clicar no botão de download.
 * - className (string): Classes CSS adicionais para o contêiner.
 */
export default function UsefulDownloads({
  title = 'Modelo de Controle Financeiro', // Default do protótipo
  fileName = 'modelo_financeiro.xlsx', // Default do protótipo
  IconComponent = ExcelIcon, // Default do protótipo
  onDownload,
  className,
}) {
  return (
    <div
      className={clsx(
        'bg-gray-50 p-4 rounded-lg border flex items-center justify-between',
        className
      )}
    >
      {/* --- Lado Esquerdo: Ícone e Info --- */}
      <div className="flex items-center">
        {/* O ícone FaFileExcel (react-icons) não aceita 'fill'
            como o SVG original, então usamos 'text' para a cor */}
        <IconComponent className="h-10 w-10 text-green-700 flex-shrink-0" />

        <div className="text-left ml-4">
          <p className="font-semibold text-gray-800">{title}</p>
          <p className="text-sm text-gray-500">{fileName}</p>
        </div>
      </div>

      {/* --- Lado Direito: Botão de Download --- */}
      <Button
        variant="ghost" // Usa a variante 'ghost' do nosso botão
        onClick={onDownload}
        // Adiciona classes extras para estilizar como no protótipo
        className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full"
        aria-label={`Baixar ${title}`}
      >
        <DownloadIcon className="h-5 w-5" />
      </Button>
    </div>
  );
}

/**
 * --- Como Usar (na página 'OSCDashboard.js') ---
 *
 * import UsefulDownloads from './components/UsefulDownloads';
 * // import * as fileService from '../../services/fileService';
 *
 * function OSCDashboard() {
 *
 * const handleDownloadTemplate = () => {
 * // Lógica de download
 * // ex: fileService.downloadTemplate('modelo_financeiro.xlsx');
 * alert("Simulando download do arquivo 'modelo_financeiro.xlsx'.");
 * };
 *
 * return (
 * <div className="mt-10 pt-6 border-t">
 * <h3 className="text-xl font-semibold text-gray-700 mb-4">Downloads Úteis</h3>
 * <div className="max-w-sm mx-auto">
 * <UsefulDownloads onDownload={handleDownloadTemplate} />
 * </div>
 * </div>
 * );
 * }
 */