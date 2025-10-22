// src/pages/contador/ContadorDashboard.js

import React from 'react';
import { Link } from 'react-router-dom';
// Importa os ícones do nosso arquivo centralizado
import {
  BuildingIcon,
  FolderIcon,
  MessageIcon,
  MegaphoneIcon,
  FileIcon,
} from '../../components/common/Icons';

// Importa os dados mockados (no futuro, virá da API)
import { mockNotifications } from '../../utils/mockData';

/**
 * Página principal (Início/Dashboard) do painel do Contador.
 *
 * Exibe cartões de resumo, links rápidos e um feed de
 * atividades recentes das OSCs.
 */
export default function ContadorDashboard() {
  // No futuro, você buscará esses dados da API
  const stats = {
    activeOSCs: 3,
    pendingDocs: 2,
    unreadMessages: 1,
  };

  // Pega as 5 atividades mais recentes do mock
  const recentActivity = [...mockNotifications]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  // Helper para formatar a data
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Dashboard do Contador
      </h2>

      {/* --- Grid de Estatísticas --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Card OSCs Ativas */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <BuildingIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">OSCs Ativas</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.activeOSCs}
            </p>
          </div>
        </div>

        {/* Card Documentos Pendentes */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
          <div className="p-3 bg-yellow-100 rounded-full">
            <FolderIcon className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Docs. Pendentes</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.pendingDocs}
            </p>
          </div>
        </div>
        
        {/* Card Mensagens Não Lidas */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
          <div className="p-3 bg-green-100 rounded-full">
            <MessageIcon className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Mensagens Não Lidas</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.unreadMessages}
            </p>
          </div>
        </div>
      </div>

      {/* --- Grid de Ações Rápidas e Atividades Recentes --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- Coluna de Ações Rápidas --- */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Ações Rápidas
            </h3>
            <div className="space-y-3">
              <Link
                to="/contador/oscs"
                className="flex items-center p-3 rounded-lg text-gray-700 font-medium bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <BuildingIcon className="h-5 w-5 mr-3 text-blue-500" />
                Gerenciar OSCs
              </Link>
              <Link
                to="/contador/documentos"
                className="flex items-center p-3 rounded-lg text-gray-700 font-medium bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <FolderIcon className="h-5 w-5 mr-3 text-yellow-500" />
                Ver Documentos
              </Link>
              <Link
                to="/contador/mensagens"
                className="flex items-center p-3 rounded-lg text-gray-700 font-medium bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <MessageIcon className="h-5 w-5 mr-3 text-green-500" />
                Abrir Mensagens
              </Link>
              <Link
                to="/contador/avisos"
                className="flex items-center p-3 rounded-lg text-gray-700 font-medium bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <MegaphoneIcon className="h-5 w-5 mr-3 text-red-500" />
                Enviar Avisos
              </Link>
            </div>
          </div>
        </div>

        {/* --- Coluna de Atividades Recentes --- */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Atividades Recentes
            </h3>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start p-3 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex-shrink-0 pt-1 text-gray-500">
                      {item.type === 'file' ? (
                        <FileIcon className="h-5 w-5" />
                      ) : (
                        <MessageIcon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm text-gray-800">
                        <span className="font-bold">{item.oscName}</span>
                        {item.type === 'file'
                          ? ' enviou o arquivo '
                          : ' enviou a mensagem '}
                        <span className="italic">"{item.content}"</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimestamp(item.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 pt-4">
                  Nenhuma atividade recente.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}