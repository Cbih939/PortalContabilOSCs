// src/services/documentService.js

import api from './api.js';

/**
 * Helper interno para acionar o download de um ficheiro no navegador.
 * @param {Blob} data - Os dados binários (o ficheiro) da resposta da API.
 * @param {string} fileName - O nome que o ficheiro terá ao ser guardado.
 */
const triggerDownload = (data, fileName) => {
  try {
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
      console.error("Erro no helper triggerDownload:", error);
      // Lança um erro que pode ser pego pelo 'catch' da função chamadora
      throw new Error("Falha ao preparar o ficheiro para download.");
  }
};

/**
 * Busca os documentos recebidos pelo Contador logado.
 * (Usado pelo Contador - Documents.js)
 * @returns {Promise} Resposta da API (axios) com a lista de ficheiros.
 */
export const getReceivedDocuments = () => {
  return api.get('/documents/received');
};

/**
 * Busca os documentos (enviados e recebidos) da OSC logada.
 * (Usado pela OSC - Documents.js)
 * @returns {Promise} Resposta da API (axios) com a lista de ficheiros.
 */
export const getMyDocuments = () => {
  return api.get('/documents/my');
};

/**
 * Faz o upload de um novo documento.
 * (Usado pela OSC - Documents.js)
 * @param {FormData} formData - O objeto FormData contendo o ficheiro.
 * @returns {Promise} Resposta da API (axios) com o novo objeto de ficheiro.
 */
export const uploadDocument = (formData) => {
  return api.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Faz o download de um ficheiro específico e aciona o 'save' no browser.
 * @param {string|number} fileId - O ID do ficheiro no banco.
 * @param {string} fileName - O nome que o ficheiro terá ao ser salvo.
 */
export const downloadDocument = async (fileId, fileName) => {
  if (!fileId || !fileName) {
      throw new Error("ID do ficheiro ou nome do ficheiro em falta para o download.");
  }
  try {
    const response = await api.get(`/documents/download/${fileId}`, {
      responseType: 'blob', // Informa ao Axios para esperar dados binários
    });
    
    // Aciona o helper de download
    triggerDownload(response.data, fileName);
  } catch (error) {
    console.error('Erro ao fazer o download do ficheiro (API):', error);
    // Tenta ler o erro (caso a API tenha retornado JSON em vez de blob)
    if (error.response?.data?.constructor === Blob) {
        const errText = await error.response.data.text();
        const errJson = JSON.parse(errText);
        throw new Error(errJson.message || 'Não foi possível fazer o download do ficheiro.');
    }
    throw new Error(error.response?.data?.message || 'Não foi possível fazer o download do ficheiro.');
  }
};

/**
 * Faz o download de um ficheiro de template (ex: modelo.xlsx).
 * (Usado pela OSC - OSCDashboard.jsx)
 */
export const downloadTemplate = async (templateName) => {
  try {
    const response = await api.get(`/templates/${templateName}`, {
      responseType: 'blob',
    });
    triggerDownload(response.data, templateName);
  } catch (error) {
    console.error('Erro ao fazer o download do template:', error);
    throw new Error('Não foi possível fazer o download do template.');
  }
};

/**
 * Busca os dados brutos (blob) de um ficheiro.
 * (Usado pelo DocumentViewModal para pré-visualização)
 * @param {string|number} fileId - O ID do ficheiro.
 * @returns {Promise<Blob>} Os dados do ficheiro como um Blob.
 */
export const getDocumentBlob = async (fileId) => {
  try {
    const response = await api.get(`/documents/download/${fileId}`, {
      responseType: 'blob', // Pede dados binários
    });
    return response.data; // Retorna o blob
  } catch (error) {
    console.error('Erro ao buscar blob do documento:', error);
    // Tenta ler o erro se a API tiver retornado JSON em vez de blob
    if (error.response?.data?.constructor === Blob) {
        try {
            const errText = await error.response.data.text();
            const errJson = JSON.parse(errText);
            throw new Error(errJson.message || 'Não foi possível carregar o ficheiro.');
        } catch(e) {
             throw new Error('Não foi possível carregar o ficheiro.');
        }
    }
    throw new Error(error.response?.data?.message || 'Não foi possível carregar o ficheiro.');
  }
};