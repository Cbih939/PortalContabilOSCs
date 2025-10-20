// src/pages/osc/Documents.js

import React, { useState, useEffect } from 'react';
// Importa os hooks
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../contexts/NotificationContext';

// Importa os dados mockados (no futuro, virá da API)
import { mockFiles } from '../../utils/mockData';
import { ROLES } from '../../utils/constants';

// Importa os componentes de UI
import DocumentUpload from './components/DocumentUpload';
import Spinner from '../../components/common/Spinner';
import { FileIcon, DownloadIcon } from '../../components/common/Icons';

// (Import real da API no futuro)
// import * as docService from '../../services/documentService';

// --- Função de API Simulada (Mock) ---
// Simula a API de upload de ficheiro
const mockUploadApi = (formData) =>
  new Promise((resolve) => {
    // O 'formData.get('file')' nos daria o objeto do ficheiro
    const file = formData.get('file');
    setTimeout(() => {
      console.log('API MOCK: Ficheiro recebido', file.name);
      // A API real retornaria o novo objeto de ficheiro criado no banco
      const newFile = {
        id: Math.floor(Math.random() * 1000) + 10,
        name: file.name,
        from: ROLES.OSC, // (O 'from' seria definido pelo 'user.name' do backend)
        to: ROLES.CONTADOR,
        date: new Date().toISOString().split('T')[0],
        type: 'sent',
      };
      resolve({ data: newFile });
    }, 1500); // 1.5 segundos de delay para simular upload
  });
// --- Fim da Função de API Simulada ---

/**
 * Página de Documentos da OSC.
 *
 * Este é o componente "inteligente" (contêiner) que:
 * 1. Lida com a lógica de upload de ficheiros.
 * 2. Busca e exibe a lista de "Meus Documentos".
 * 3. Renderiza os componentes de apresentação.
 */
export default function OSCDocumentsPage() {
  // 1. Pega os dados do usuário logado (a OSC)
  const { user } = useAuth();
  const addNotification = useNotification();

  // 2. Estados de Dados
  const [myFiles, setMyFiles] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);

  // 3. Conecta o hook 'useApi' com a função de upload
  const {
    request: uploadFile,
    isLoading: isUploading, // Renomeia para 'isUploading' para clareza
  } = useApi(mockUploadApi);

  // 4. Efeito para Buscar a Lista de Ficheiros (Simulação)
  useEffect(() => {
    setIsLoadingList(true);
    // Simula uma chamada de API
    setTimeout(() => {
      const filesForThisOSC = mockFiles.filter(
        (f) =>
          (f.from === user.name && f.to === ROLES.CONTADOR) ||
          (f.from === ROLES.CONTADOR && f.to === user.name)
      );
      setMyFiles(
        filesForThisOSC.sort((a, b) => new Date(b.date) - new Date(a.date))
      );
      setIsLoadingList(false);
    }, 500); // 500ms de delay
  }, [user.name]); // Depende do 'user.name'

  // 5. Handlers
  /**
   * Chamado pelo DocumentUpload quando o utilizador clica em "Enviar".
   * @param {File} file - O objeto File do input.
   */
  const handleFileUpload = async (file) => {
    try {
      // 1. Prepara o FormData (necessário para enviar ficheiros)
      const formData = new FormData();
      formData.append('file', file);
      // (Pode adicionar outros dados, ex: formData.append('type', 'balancete'))

      // 2. Chama a API (o hook 'useApi' cuida do try/catch principal)
      const newFile = await uploadFile(formData);

      // 3. Sucesso!
      addNotification('Ficheiro enviado com sucesso!', 'success');

      // 4. Atualiza a lista "Meus Documentos"
      //    (Adiciona o novo ficheiro no topo da lista)
      setMyFiles((prevFiles) => [
        { ...newFile, from: user.name }, // Garante que o 'from' está correto
        ...prevFiles,
      ]);
    } catch (err) {
      // O 'useApi' já mostrou a notificação de erro.
      // O 'catch' é necessário aqui para que o 'DocumentUpload'
      // saiba que o upload falhou e *não* limpe o 'selectedFile'.
      console.error('Erro pego pela página:', err);
      throw err; // Re-lança o erro para o componente filho
    }
  };

  /** Simula a ação de download */
  const handleDownload = (fileName) => {
    alert(`Simulando download do ficheiro: ${fileName}`);
  };

  return (
    <div className="p-8">
      {/* Layout em grelha (Upload à esquerda, Lista à direita) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* --- Coluna 1: Informações e Upload --- */}
        <div className="md:col-span-1 space-y-8">
          {/* Card de Informações */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Minhas Informações
            </h2>
            <p>
              <strong>Nome:</strong> {user.name}
            </p>
            <p>
              <strong>CNPJ:</strong> {user.cnpj || 'Não informado'}
            </p>
          </div>

          {/* Card de Upload */}
          <DocumentUpload
            onUpload={handleFileUpload}
            isLoading={isUploading}
          />
        </div>

        {/* --- Coluna 2: Lista de "Meus Documentos" --- */}
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Meus Documentos
          </h2>

          {isLoadingList ? (
            <div className="flex justify-center items-center h-48">
              <Spinner text="A carregar documentos..." />
            </div>
          ) : myFiles.length === 0 ? (
            <p className="text-center text-gray-500 pt-8">
              Nenhum documento encontrado.
            </p>
          ) : (
            // Lista de ficheiros
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {myFiles.map((file) => (
                <div
                  key={file.id}
                  className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <FileIcon className="h-5 w-5 mr-3 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-800">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {file.type === 'sent'
                          ? `Enviado em ${file.date}`
                          : `Recebido em ${file.date}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(file.name)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold p-2 rounded-full ml-4"
                    aria-label={`Baixar ${file.name}`}
                  >
                    <DownloadIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}