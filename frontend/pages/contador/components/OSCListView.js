// src/pages/contador/components/OSCListView.js

import React, { useState } from 'react';
import { clsx } from 'clsx';
import {
  ViewIcon,
  EditIcon,
  AlertTriangleIcon,
  SearchIcon,
  BuildingIcon,
} from '../../../components/common/Icons';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';

/**
 * Componente "burro" que renderiza a tabela de OSCs do Contador.
 *
 * Gerencia seus próprios filtros internos, mas delega as
 * ações (abrir modais) para o componente pai.
 *
 * Props:
 * - oscs (array): Array de objetos de OSC para exibir.
 * - onView (function): Chamada com (osc) ao clicar em 'Visualizar'.
 * - onEdit (function): Chamada com (osc) ao clicar em 'Editar'.
 * - onSendAlert (function): Chamada com (osc) ao clicar em 'Enviar Alerta'.
 * - onCreate (function): (Opcional) Chamada ao clicar em 'Cadastrar Nova OSC'.
 */
export default function OSCListView({
  oscs,
  onView,
  onEdit,
  onSendAlert,
  onCreate,
}) {
  // --- Estado dos Filtros ---
  const [filterName, setFilterName] = useState('');
  const [filterCnpj, setFilterCnpj] = useState('');
  const [filterResponsible, setFilterResponsible] = useState('');

  // Filtra a lista de OSCs com base nos estados de filtro
  const filteredOSCs = oscs.filter(
    (osc) =>
      osc.name.toLowerCase().includes(filterName.toLowerCase()) &&
      osc.cnpj.replace(/[^\d]/g, '').includes(filterCnpj.replace(/[^\d]/g, '')) &&
      osc.responsible.toLowerCase().includes(filterResponsible.toLowerCase())
  );

  return (
    <div className="p-8">
      {/* --- Cabeçalho da Página --- */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          Organizações Cadastradas
        </h2>
        {/* O botão de "Criar" só aparece se a função 'onCreate' for passada */}
        {onCreate && (
          <Button variant="primary" onClick={onCreate}>
            <BuildingIcon className="w-5 h-5 mr-2" />
            Cadastrar Nova OSC
          </Button>
        )}
      </div>

      {/* --- Filtros --- */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            icon={SearchIcon}
            placeholder="Buscar por Nome da OSC..."
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
          />
          <Input
            icon={SearchIcon}
            placeholder="Buscar por CNPJ..."
            value={filterCnpj}
            onChange={(e) => setFilterCnpj(e.target.value)}
          />
          <Input
            icon={SearchIcon}
            placeholder="Buscar por Responsável..."
            value={filterResponsible}
            onChange={(e) => setFilterResponsible(e.target.value)}
          />
        </div>
      </div>

      {/* --- Tabela de OSCs --- */}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">
                Nome da OSC
              </th>
              <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">
                CNPJ
              </th>
              <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">
                Responsável
              </th>
              <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">
                Status
              </th>
              <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredOSCs.length > 0 ? (
              filteredOSCs.map((osc) => (
                <tr key={osc.id} className="hover:bg-gray-50">
                  <td className="px-5 py-5 border-b border-gray-200 text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{osc.name}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{osc.cnpj}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {osc.responsible}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 text-sm">
                    <span
                      className={clsx(
                        'relative inline-block px-3 py-1 font-semibold leading-tight rounded-full text-xs',
                        osc.status === 'Ativo'
                          ? 'text-green-900'
                          : 'text-red-900'
                      )}
                    >
                      <span
                        aria-hidden
                        className={clsx(
                          'absolute inset-0 opacity-50 rounded-full',
                          osc.status === 'Ativo'
                            ? 'bg-green-200'
                            : 'bg-red-200'
                        )}
                      ></span>
                      <span className="relative">{osc.status}</span>
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 text-sm">
                    {/* Botões de Ação delegam para o pai */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onView(osc)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100"
                        title="Visualizar"
                      >
                        <ViewIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEdit(osc)}
                        className="text-yellow-600 hover:text-yellow-900 p-1 rounded-full hover:bg-yellow-100"
                        title="Editar"
                      >
                        <EditIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onSendAlert(osc)}
                        className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100"
                        title="Enviar Alerta"
                      >
                        <AlertTriangleIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              // --- Mensagem de "Nenhum resultado" ---
              <tr>
                <td
                  colSpan="5"
                  className="px-5 py-10 border-b border-gray-200 text-sm text-center text-gray-500"
                >
                  Nenhuma OSC encontrada com os filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}