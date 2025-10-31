// src/services/documentService.js

import api from './api.js';

/**
 * Helper interno para acionar o download de um ficheiro no navegador.
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
      throw new Error("Falha ao preparar o ficheiro para download.");
  }
};

/**
 * Busca os documentos recebidos pelo Contador logado.
 * (Função que estava em falta e causava TypeError)
 */
export const getReceivedDocuments = () => {
  return api.get('/documents/received');
};

/**
 * Busca os documentos (enviados e recebidos) da OSC logada.
 */
export const getMyDocuments = () => {
  return api.get('/documents/my');
};

/**
 * Faz o upload de um novo documento.
 */
export const uploadDocument = (formData) => {
  return api.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Faz o download de um ficheiro específico.
 */
export const downloadDocument = async (fileId, fileName) => {
  if (!fileId || !fileName) {
      throw new Error("ID do ficheiro ou nome do ficheiro em falta para o download.");
  }
  try {
    const response = await api.get(`/documents/download/${fileId}`, {
      responseType: 'blob',
    });
    triggerDownload(response.data, fileName);
  } catch (error) {
    console.error('Erro ao fazer o download do ficheiro (API):', error);
    if (error.response?.data?.constructor === Blob) {
        try {
            const errText = await error.response.data.text();
            const errJson = JSON.parse(errText);
            throw new Error(errJson.message || 'Não foi possível fazer o download do ficheiro.');
        } catch(e) {
             throw new Error('Não foi possível fazer o download do ficheiro.');
        }
    }
    throw new Error(error.response?.data?.message || 'Não foi possível fazer o download do ficheiro.');
  }
};

/**
 * Faz o download de um ficheiro de template.
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