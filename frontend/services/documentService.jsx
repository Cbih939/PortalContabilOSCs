// src/services/documentService.js

import api from './api'; // Importa a instância configurada do Axios

/**
 * Helper interno para acionar o download de um ficheiro no navegador.
 * @param {Blob} data - Os dados binários (o ficheiro) da resposta da API.
 * @param {string} fileName - O nome que o ficheiro terá ao ser guardado.
 */
const triggerDownload = (data, fileName) => {
  // Cria um URL temporário no navegador para o ficheiro (blob)
  const url = window.URL.createObjectURL(new Blob([data]));
  
  // Cria um link <a> invisível
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName); // Define o nome do ficheiro
  
  // Adiciona, clica e remove o link
  document.body.appendChild(link);
  link.click();
  link.remove();
  
  // Limpa o URL temporário da memória
  window.URL.revokeObjectURL(url);
};

// --- Funções Usadas por (GET) ---

/**
 * Busca os documentos recebidos pelo Contador.
 * (Usado pelo Contador - Documents.js)
 * @returns {Promise} Resposta da API (axios) com a lista de ficheiros.
 */
export const getReceivedDocuments = () => {
  return api.get('/documents/received');
  // Rota no Backend: GET /api/documents/received
};

/**
 * Busca os documentos (enviados e recebidos) da OSC logada.
 * (Usado pela OSC - Documents.js)
 * @returns {Promise} Resposta da API (axios) com a lista de ficheiros.
 */
export const getMyDocuments = () => {
  return api.get('/documents/my');
  // Rota no Backend: GET /api/documents/my
};

// --- Funções Usadas por (POST) ---

/**
 * Faz o upload de um novo documento.
 * (Usado pela OSC - Documents.js e o hook 'useApi')
 * @param {FormData} formData - O objeto FormData contendo o ficheiro.
 * @returns {Promise} Resposta da API (axios) com o novo objeto de ficheiro.
 */
export const uploadDocument = (formData) => {
  return api.post('/documents/upload', formData, {
    headers: {
      // Informa ao Axios que é um 'multipart/form-data'.
      // O browser definirá o 'boundary' automaticamente.
      'Content-Type': 'multipart/form-data',
    },
  });
  // Rota no Backend: POST /api/documents/upload
};

// --- Funções Usadas Diretamente (sem 'useApi') ---

/**
 * Faz o download de um ficheiro específico e aciona o 'save' no browser.
 * (Usado por Contador e OSC)
 *
 * NOTA: Esta função NÃO deve ser usada com o hook 'useApi',
 * pois ela não retorna JSON, e sim aciona um download.
 * Chame-a diretamente num 'onClick'.
 *
 * @param {string|number} fileId - O ID do ficheiro no banco.
 * @param {string} fileName - O nome que o ficheiro terá ao ser salvo.
 */
export const downloadDocument = async (fileId, fileName) => {
  try {
    const response = await api.get(`/documents/download/${fileId}`, {
      responseType: 'blob', // Informa ao Axios para esperar dados binários
    });
    
    // Aciona o helper de download
    triggerDownload(response.data, fileName);
  } catch (error) {
    console.error('Erro ao fazer o download do ficheiro:', error);
    // Lança o erro para que a 'useNotification' (num 'try/catch'
    // no componente) possa exibi-lo.
    throw new Error('Não foi possível fazer o download do ficheiro.');
  }
};

/**
 * Faz o download de um ficheiro de template (ex: modelo.xlsx).
 * (Usado pela OSC - OSCDashboard.js)
 *
 * @param {string} templateName - O nome do ficheiro (ex: 'modelo_financeiro.xlsx')
 */
export const downloadTemplate = async (templateName) => {
  try {
    // A rota '/templates' deve ser configurada no backend
    // para servir ficheiros estáticos.
    const response = await api.get(`/templates/${templateName}`, {
      responseType: 'blob',
    });
    
    // Aciona o helper de download
    triggerDownload(response.data, templateName);
  } catch (error) {
    console.error('Erro ao fazer o download do template:', error);
    throw new Error('Não foi possível fazer o download do template.');
  }
};