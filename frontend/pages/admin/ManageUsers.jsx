// src/pages/admin/ManageUsers.js

import React, { useState, useMemo } from 'react';
import { clsx } from 'clsx';
// Importa os dados mockados (no futuro, virá da API)
import { mockUsers } from '../../utils/mockData';
// Importa as constantes de Roles (ex: 'Adm', 'Contador', 'OSC')
import { ROLES } from '../../utils/constants';
import { EditIcon, UsersIcon, SearchIcon } from '../../components/common/Icons';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

/**
 * Página de Gerenciamento de Usuários para o Administrador.
 *
 * Permite ao admin visualizar, filtrar, criar e editar
 * todas as contas de usuário do sistema (Admins, Contadores, OSCs).
 */
export default function ManageUsers() {
  const [filterName, setFilterName] = useState('');
  const [filterRole, setFilterRole] = useState(''); // 'all', 'Adm', 'Contador', 'OSC'

  // Prepara os dados (apenas converte o objeto mock em array)
  const allUsers = useMemo(() => Object.values(mockUsers), []);

  // Filtra os usuários
  const filteredUsers = allUsers.filter(
    (user) =>
      // Filtro de Nome (checa nome e email)
      (user.name.toLowerCase().includes(filterName.toLowerCase()) ||
        (user.email &&
          user.email.toLowerCase().includes(filterName.toLowerCase()))) &&
      // Filtro de Role
      (filterRole === '' || user.role === filterRole)
  );

  const handleEdit = (user) => {
    alert(`(Admin) Abrindo modal para editar usuário: ${user.name}`);
    // No futuro: Abre um Modal de 'EditUserModal'
  };

  const handleCreate = () => {
    alert(`(Admin) Abrindo modal para criar novo usuário...`);
    // No futuro: Abre um Modal de 'CreateUserModal'
  };

  // Define a cor da "tag" de role
  const getRoleClass = (role)T => {
    switch (role) {
      case ROLES.ADMIN:
        return 'bg-red-200 text-red-900';
      case ROLES.CONTADOR:
        return 'bg-blue-200 text-blue-900';
      case ROLES.OSC:
        return 'bg-green-200 text-green-900';
      default:
        return 'bg-gray-200 text-gray-900';
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          Gerenciamento de Usuários
        </h2>
        <Button variant="primary" onClick={handleCreate}>
          <UsersIcon className="w-5 h-5 mr-2" />
          Criar Novo Usuário
        </Button>
      </div>

      {/* --- Filtros --- */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            icon={SearchIcon}
            placeholder="Buscar por Nome ou Email..."
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
          />
          {/* Filtro de Dropdown para Role */}
          <div>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="">Todos os Perfis</option>
              <option value={ROLES.ADMIN}>Administrador</option>
              <option value={ROLES.CONTADOR}>Contador</option>
              <option value={ROLES.OSC}>OSC</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- Tabela de Usuários --- */}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">
                Nome
              </th>
              <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">
                Email / Identificador
              </th>
              <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">
                Perfil (Role)
              </th>
              <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-5 py-5 border-b border-gray-200 text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{user.name}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 text-sm">
                  {/* Mostra Email para Contador ou CNPJ para OSC */}
                  <p className="text-gray-900 whitespace-no-wrap">
                    {user.email || user.cnpj || 'N/A'}
                  </p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 text-sm">
                  <span
                    className={clsx(
                      'relative inline-block px-3 py-1 font-semibold leading-tight rounded-full text-xs',
                      getRoleClass(user.role)
                    )}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 text-sm">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-yellow-600 hover:text-yellow-900 p-1 rounded-full hover:bg-yellow-100"
                      title="Editar Usuário"
                    >
                      <EditIcon className="h-4 w-4" />
                    </button>
                    {/* Aqui você pode adicionar um botão de "Desativar" */}
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