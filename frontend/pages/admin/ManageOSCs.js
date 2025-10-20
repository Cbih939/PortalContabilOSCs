// src/pages/admin/ManageOSCs.js

import React, { useState, useMemo } from 'react';
import { clsx } from 'clsx';
// Importa os dados mockados (no futuro, virá da API)
import { mockOSCs, mockUsers } from '../../utils/mockData';
import { ViewIcon, EditIcon, UsersIcon } from '../../components/common/Icons';
import Input from '../../components/common/Input';
import { SearchIcon } from '../../components/common/Icons';
import Button from '../../components/common/Button';
import { ROLES } from '../../utils/constants'; // Assume que ROLES.CONTADOR = 'Contador'

// Mock extra: simula a qual contador cada OSC pertence
const mockOSCAssignments = {
  3: 2, // OSC Esperança (id 3) -> Carlos Contador (id 2)
  4: 2, // Instituto Novo Amanhã (id 4) -> Carlos Contador (id 2)
  5: null, // Associação Bem Viver (id 5) -> Nenhum contador
};

/**
 * Página de Gerenciamento de OSCs para o Administrador.
 *
 * Permite ao admin visualizar todas as OSCs do sistema,
 * seus status, e a qual contador elas estão associadas.
 */
export default function ManageOSCs() {
  const [filterName, setFilterName] = useState('');
  const [filterContador, setFilterContador] = useState('');

  // Prepara os dados combinando mocks
  // useMemo garante que isso só rode uma vez, e não a cada re-render
  const oscs = useMemo(() => {
    return mockOSCs.map((osc) => {
      const contadorId = mockOSCAssignments[osc.id];
      const contador = contadorId
        ? Object.values(mockUsers).find((u) => u.id === contadorId)
        : null;
      return {
        ...osc,
        contadorName: contador ? contador.name : 'Nenhum',
      };
    });
  }, []); // Array de dependência vazio

  // Filtra as OSCs
  const filteredOSCs = oscs.filter(
    (osc) =>
      osc.name.toLowerCase().includes(filterName.toLowerCase()) &&
      osc.contadorName.toLowerCase().includes(filterContador.toLowerCase())
  );

  const handleView = (osc) => {
    alert(`(Admin) Visualizando detalhes de: ${osc.name}`);
    // No futuro: Abre um Modal de 'ViewOSCModal'
  };

  const handleAssign = (osc) => {
    alert(
      `(Admin) Abrindo modal para (re)associar contador para: ${osc.name}`
    );
    // No futuro: Abre um Modal para selecionar um 'Contador'
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          Gerenciamento de OSCs
        </h2>
        {/* Futuro botão de "Criar OSC" (se o Admin puder fazer isso) */}
        <Button variant="primary">
          <UsersIcon className="w-5 h-5 mr-2" />
          Associar OSC a um Contador
        </Button>
      </div>

      {/* --- Filtros --- */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            icon={SearchIcon}
            placeholder="Buscar por Nome da OSC..."
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
          />
          <Input
            icon={SearchIcon}
            placeholder="Buscar por Contador..."
            value={filterContador}
            onChange={(e) => setFilterContador(e.target.value)}
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
                Contador Associado
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
            {filteredOSCs.map((osc) => (
              <tr key={osc.id} className="hover:bg-gray-50">
                <td className="px-5 py-5 border-b border-gray-200 text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{osc.name}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{osc.cnpj}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 text-sm">
                  <p
                    className={clsx('text-gray-900 whitespace-no-wrap', {
                      'text-gray-500 italic': osc.contadorName === 'Nenhum',
                    })}
                  >
                    {osc.contadorName}
                  </p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 text-sm">
                  <span
                    className={`relative inline-block px-3 py-1 font-semibold ${
                      osc.status === 'Ativo'
                        ? 'text-green-900'
                        : 'text-red-900'
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`absolute inset-0 ${
                        osc.status === 'Ativo'
                          ? 'bg-green-200'
                          : 'bg-red-200'
                      } opacity-50 rounded-full`}
                    ></span>
                    <span className="relative">{osc.status}</span>
                  </span>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 text-sm">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleView(osc)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100"
                      title="Visualizar Detalhes"
                    >
                      <ViewIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleAssign(osc)}
                      className="text-yellow-600 hover:text-yellow-900 p-1 rounded-full hover:bg-yellow-100"
                      title="Associar / Trocar Contador"
                    >
                      <EditIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}