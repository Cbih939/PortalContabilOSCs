// src/pages/admin/AdminDashboard.js

import React from 'react';
import { Link } from 'react-router-dom';
// Importa os ícones do nosso arquivo centralizado
import { UsersIcon, BuildingIcon } from '../../components/common/Icons';

/**
 * Página principal (Início/Dashboard) do painel do Administrador.
 *
 * Exibe cartões de resumo e links rápidos para as principais
 * seções de gerenciamento.
 */
export default function AdminDashboard() {
  // No futuro, você buscará esses dados da API
  const stats = {
    totalUsers: 50, // mock
    totalOSCs: 3,   // mock
    totalContadores: 5, // mock
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Dashboard do Administrador
      </h2>

      {/* --- Grid de Estatísticas --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Card Total de Usuários */}
        <Link
          to="/admin/usuarios" // Rota que definiremos no AppRoutes
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center space-x-4"
        >
          <div className="p-3 bg-blue-100 rounded-full">
            <UsersIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total de Usuários</Gep>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalUsers}
            </p>
          </div>
        </Link>

        {/* Card Total de OSCs */}
        <Link
          to="/admin/oscs" // Rota que definiremos no AppRoutes
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center space-x-4"
        >
          <div className="p-3 bg-green-100 rounded-full">
            <BuildingIcon className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">OSCs Cadastradas</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalOSCs}
            </p>
          </div>
        </Link>
        
        {/* Card Total de Contadores */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
          <div className="p-3 bg-yellow-100 rounded-full">
            {/* Reutilizando o ícone de usuário */}
            <UsersIcon className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Contadores Ativos</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalContadores}
            </p>
          </div>
        </div>
      </div>

      {/* --- Links Rápidos --- */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Ações Rápidas
        </h3>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/admin/usuarios"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-5 rounded-lg transition-colors flex items-center"
          >
            <UsersIcon className="h-5 w-5 mr-2" />
            Gerenciar Usuários
          </Link>
          <Link
            to="/admin/oscs"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-5 rounded-lg transition-colors flex items-center"
          >
            <BuildingIcon className="h-5 w-5 mr-2" />
            Gerenciar OSCs
          </Link>
        </div>
      </div>
    </div>
  );
}