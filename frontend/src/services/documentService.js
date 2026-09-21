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
 * (Usado pelo Contador - DocumentsPage.jsx)
 */
export const getReceivedDocuments = async () => {
  const response = await api.get('/documents/received');
  return response.data;
};

/**
 * Busca os documentos (enviados e recebidos) da OSC logada.
 * (Usado pela OSC - OSCDocumentsPage.jsx)
 */
export const getMyDocuments = () => api.get('/documents/my');

/**
 * Faz o upload de um novo documento.
 * (Usado pela OSC - OSCDocumentsPage.jsx)
 */
/**
 * Envia um documento. `onProgress(percent)` recebe 0–100 durante o upload.
 */
export const uploadDocument = (formData, onProgress) => {
  return api.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (event) => {
      if (onProgress && event.total) onProgress(Math.round((event.loaded * 100) / event.total));
    },
  });
};

/**
 * Faz o download de um ficheiro específico e aciona o 'save' no browser.
 */
// Descarregar / Ler documento com segurança (Adicione no final)
export const downloadDocument = async (id) => {
  const response = await api.get(`/documents/download/${id}`, { 
    responseType: 'blob' 
  });
  return response.data;
};

/**
 * Faz o download de todos os documentos do mês em formato ZIP.
 */
export const downloadMonthZip = async (oscId, month, year) => {
  try {
    const response = await api.get(`/documents/download-month-zip?oscId=${oscId}&month=${month}&year=${year}`, {
      responseType: 'blob',
    });
    triggerDownload(response.data, `documentos_${year}_${month}.zip`);
  } catch (error) {
    console.error('Erro ao fazer o download do ZIP:', error);
    throw new Error('Não foi possível fazer o download do ZIP. Verifique se existem documentos neste mês.');
  }
};

/**
 * Faz o download de um ficheiro de template (ex: modelo.xlsx).
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

// --- FUNÇÃO QUE FALTAVA ---
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
    // Tenta ler o erro (caso a API tenha retornado JSON em vez de blob)
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

export const markAsConcluded = async (data) => {
  // data deve ser { oscId: 123 }
  return await api.post('/documents/conclude', data); 
};

// Marca como Concluso TEC (Mensal ou Anual)
export const markConclusoTec = async (data) => {
  const response = await api.post('/documents/mark-tec', data);
  return response.data;
};

// Marcar mês como Pendente
export const markAsPending = async (data) => {
  const response = await api.post('/documents/pending', data);
  return response.data;
};

// Excluir um documento
export const deleteDocument = async (id) => {
  const response = await api.delete(`/documents/${id}`);
  return response.data;
};

// Gerar link público de um documento
export const generatePublicLink = async (id) => {
  const response = await api.post(`/documents/share/${id}`);
  return response.data;
};

/** Baixa um documento pela API autenticada (a pasta /uploads deixou de ser pública). */
export const saveDocument = async (id, fileName = 'documento') => {
  const blob = await getDocumentBlob(id);
  triggerDownload(blob, fileName);
};

/** Abre um documento em nova aba, a partir de um blob autenticado. */
export const openDocument = async (id, mimeType) => {
  const blob = await getDocumentBlob(id);
  const typed = mimeType ? new Blob([blob], { type: mimeType }) : blob;
  const url = window.URL.createObjectURL(typed);
  window.open(url, '_blank', 'noopener');
  setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
};

/** Documentos recebidos agrupados por OSC, com os meses ainda sem envio. */
export const getReceivedByOsc = async () => {
  const response = await api.get('/documents/received-by-osc');
  return response.data;
};
