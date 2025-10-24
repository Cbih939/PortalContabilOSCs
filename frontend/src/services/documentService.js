// src/services/documentService.js
import api from './api.js';

// Helper Download (como definido antes)
const triggerDownload = (data, fileName) => { /* ... */ };

/** Busca docs recebidos pelo Contador */
export const getReceivedDocuments = () => {
  return api.get('/documents/received');
};

/** Faz download de um ficheiro */
export const downloadDocument = async (fileId, fileName) => {
  try {
    const response = await api.get(`/documents/download/${fileId}`, {
      responseType: 'blob',
    });
    triggerDownload(response.data, fileName);
  } catch (error) {
    console.error('Erro ao fazer o download do ficheiro:', error);
    throw new Error('Não foi possível fazer o download do ficheiro.');
  }
};

// (getMyDocuments, uploadDocument, downloadTemplate - podem continuar aqui)