// src/services/templateService.js
import api from './api.js';

/**
 * Busca todos os ficheiros de modelo (templates).
 * @returns {Promise<Array>} Lista de todos os templates.
 */
export const getAllTemplates = () => {
  return api.get('/templates');
};

/**
 * Faz o upload de um novo ficheiro de modelo (template).
 * @param {FormData} formData - Deve conter 'templateFile' (o ficheiro) e 'file_name' (o nome de exibição).
 * @returns {Promise<object>} O novo objeto de template criado.
 */
export const uploadTemplate = (formData) => {
  return api.post('/templates', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Apaga um ficheiro de modelo (template).
 * @param {string|number} id - O ID do template a ser apagado.
 * @returns {Promise}
 */
export const deleteTemplate = (id) => {
  return api.delete(`/templates/${id}`);
};

/**
 * Baixa um ficheiro de modelo (template).
 * @param {string|number} id - O ID do template.
 * @param {string} fileName - O nome original do ficheiro (para salvar).
 */
export const downloadTemplate = async (id, fileName) => {
  try {
    const response = await api.get(`/templates/${id}/download`, {
      responseType: 'blob',
    });
    
    // Helper de Download (copiado do documentService)
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Erro ao fazer o download do modelo:', error);
    throw new Error(error.response?.data?.message || 'Não foi possível fazer o download do modelo.');
  }
};