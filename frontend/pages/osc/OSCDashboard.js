// src/pages/osc/OSCDashboard.js

import React from 'react';
// Importa o hook para pegar os dados do utilizador logado
import { useAuth } from '../../hooks/useAuth';

// Importa o componente de UI modularizado
import UsefulDownloads from './components/UsefulDownloads';
// (Opcional, se precisar de passar um ícone customizado)
// import { ExcelIcon } from '../../components/common/Icons';

/**
 * Página principal (Início/Dashboard) do portal da OSC.
 *
 * Corresponde à 'InicioView' do protótipo.
 */
export default function OSCDashboard() {
  // 1. Pega os dados do utilizador logado (a OSC)
  const { user } = useAuth();

  // 2. Lógica para o download (delegada ao componente)
  const handleDownloadBaseFile = () => {
    // No futuro, isto chamaria um 'fileService' para
    // descarregar o ficheiro estático ou da API.
    alert("Simulando download do ficheiro 'modelo_financeiro.xlsx'.");
    
    // (Exemplo de como forçar um download de um ficheiro estático)
    // const link = document.createElement('a');
    // link.href = '/templates/modelo_financeiro.xlsx'; // (Ficheiro em /public/templates/)
    // link.setAttribute('download', 'modelo_financeiro.xlsx');
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);
  };

  return (
    <div className="p-8">
      {/* Usamos 'max-w-4xl' e 'mx-auto' para centralizar o conteúdo,
          assim como no protótipo. */}
      <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto text-center">
        
        {/* Platzhalter do Logo (do protótipo) */}
        <div className="mx-auto bg-gray-200 h-24 w-64 rounded-lg flex items-center justify-center mb-6">
          <span className="text-gray-500 font-semibold">Logo do Escritório</span>
        </div>

        {/* Mensagem de Boas-vindas */}
        <h2 className="text-3xl font-bold text-gray-800">
          Bem-vindo(a) ao Portal do Cliente, {user?.name || 'Utilizador'}!
        </h2>
        <p className="text-gray-600 mt-2">
          Este é o seu canal direto com a nossa equipa de contabilidade. Use os separadores acima para enviar documentos e trocar mensagens.
        </p>
        
        {/* Seção de Downloads Úteis */}
        <div className="mt-10 pt-6 border-t">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Downloads Úteis
          </h3>
          <div className="max-w-sm mx-auto">
            {/* 3. Renderiza o componente modular
                e passa a lógica de download via 'props' */}
            <UsefulDownloads
              onDownload={handleDownloadBaseFile}
              // (Pode customizar as props se necessário)
              // title="Modelo Balancete 2025"
              // fileName="balancete_2025.xlsx"
              // IconComponent={ExcelIcon}
            />
          </div>
        </div>
      </div>
    </div>
  );
}