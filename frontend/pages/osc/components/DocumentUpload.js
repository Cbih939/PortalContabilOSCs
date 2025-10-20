// src/pages/osc/components/DocumentUpload.js

import React, { useState, useRef } from 'react';
import { clsx } from 'clsx';
// Importa os ícones do nosso arquivo centralizado
import { UploadIcon } from '../../../components/common/Icons';
// Importa os componentes de UI
import Button from '../../../components/common/Button';
import Spinner from '../../../components/common/Spinner';

/**
 * Componente para o "card" de upload de documento na página da OSC.
 *
 * Gerencia o estado do arquivo selecionado, mas delega a
 * lógica de upload (a chamada de API) para o componente pai.
 *
 * Props:
 * - onUpload (function): Função *assíncrona* (async) chamada com (file)
 * quando o botão "Enviar" é clicado.
 * - isLoading (boolean): Indica se o upload está em progresso.
 * - className (string): (Opcional) Classes CSS para o contêiner principal.
 */
export default function DocumentUpload({ onUpload, isLoading, className }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null); // Para erros locais (ex: 'nenhum arquivo')
  const fileInputRef = useRef(null); // Ref para o <input>

  // Handler quando um arquivo é selecionado no <input>
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null); // Limpa erros anteriores
    } else {
      setSelectedFile(null);
    }
  };

  // Handler para o clique no botão "Enviar Arquivo"
  const handleUploadClick = async () => {
    if (!selectedFile) {
      setError('Por favor, selecione um arquivo primeiro.');
      return;
    }
    if (isLoading) return; // Previne duplo clique

    setError(null);

    try {
      // 1. Chama a função 'onUpload' (passada pelo pai)
      //    que contém a lógica do 'useApi'
      await onUpload(selectedFile);

      // 2. Sucesso! Limpa o arquivo selecionado
      setSelectedFile(null);

      // 3. Limpa o <input> (essencial para permitir
      //    o re-envio do *mesmo* arquivo)
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
      // (O 'useNotification' no pai mostrará a msg de sucesso)
    } catch (err) {
      // Erro! O 'useApi' no pai já mostrou a notificação.
      // Não limpamos o 'selectedFile', permitindo ao
      // usuário tentar novamente.
      console.error('Falha no upload (visto pelo DocumentUpload):', err);
    }
  };

  const hasError = !!error;

  return (
    <div className={clsx('bg-white p-6 rounded-lg shadow-md', className)}>
      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        Enviar Documento
      </h2>

      {/* --- Área de Seleção de Arquivo --- */}
      <div
        className={clsx(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          hasError ? 'border-red-500' : 'border-gray-300' // Borda vermelha em erro
        )}
      >
        <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
        <label
          htmlFor="file-upload"
          className="cursor-pointer mt-2 text-blue-600 hover:text-blue-800 font-semibold"
        >
          Selecione um arquivo
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            ref={fileInputRef} // Anexa a ref
            className="sr-only"
            onChange={handleFileChange}
            accept=".pdf,.docx,.xlsx,.xls,.png,.jpg,.jpeg" // Tipos de arquivo permitidos
          />
        </label>
        <p className="text-xs text-gray-500 mt-1">
          PDF, DOCX, XLSX, XLS, JPG, PNG
        </p>

        {/* Exibe o nome do arquivo selecionado */}
        {selectedFile && (
          <p className="text-sm text-gray-600 mt-2 font-medium">
            {selectedFile.name}
          </p>
        )}

        {/* Exibe o erro local */}
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>

      {/* --- Botão de Envio --- */}
      <Button
        onClick={handleUploadClick}
        className="w-full mt-4"
        disabled={isLoading || !selectedFile} // Desabilita se estiver carregando OU se não houver arquivo
      >
        {isLoading ? (
          <Spinner size="sm" className="mr-2" />
        ) : (
          <UploadIcon className="h-5 w-5 mr-2" />
        )}
        {isLoading ? 'Enviando...' : 'Enviar Arquivo'}
      </Button>
    </div>
  );
}

/**
 * --- Como Usar (na página 'Documents.js' da OSC) ---
 *
 * import { useApi } from '../../hooks/useApi';
 * import { useNotification } from '../../contexts/NotificationContext';
 * import * as docService from '../../services/documentService';
 * import DocumentUpload from './components/DocumentUpload';
 *
 * function OSCDocumentsPage() {
 * const addNotification = useNotification();
 *
 * // Hook para a API de upload
 * const { request: uploadFile, isLoading } = useApi(docService.uploadFile);
 *
 * const handleFileUpload = async (file) => {
 * try {
 * // 1. Prepara o FormData (necessário para arquivos)
 * const formData = new FormData();
 * formData.append('file', file);
 * // formData.append('documentType', 'balancete'); // (Exemplo de outro dado)
 *
 * // 2. Chama a API (o hook 'useApi' cuida do try/catch)
 * await uploadFile(formData);
 *
 * // 3. Sucesso
 * addNotification('Arquivo enviado com sucesso!', 'success');
 * // (Aqui, você também recarregaria a lista de "Meus Documentos")
 * // ex: refetchDocumentList();
 *
 * } catch (err) {
 * // O 'useApi' já mostrou a notificação de erro.
 * // O 'catch' é necessário aqui para que o 'DocumentUpload'
 * // saiba que o upload falhou e *não* limpe o 'selectedFile'.
 * console.error("Erro pego pela página:", err);
 * throw err; // Re-lança o erro
 * }
 * };
 *
 * return (
 * <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
 * <div className="md:col-span-1">
 * <DocumentUpload
 * onUpload={handleFileUpload}
 * isLoading={isLoading}
 * />
 * </div>
 * <div className="md:col-span-2">
 * {/* ... (Lista de "Meus Documentos") ... */}
 * </div>
 * </div>
 * );
 * }
 */