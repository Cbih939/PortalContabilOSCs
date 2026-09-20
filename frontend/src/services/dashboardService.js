import api from './api.js';

/**
 * Estatísticas reais de documentos (escopo definido pelo servidor conforme o perfil).
 * @param {{months?: 6|12, from?: string, to?: string, basis?: 'upload'|'competencia', oscId?: number, officeId?: number}} params
 */
export const getDocumentStats = async (params = {}) => {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''));
  const { data } = await api.get('/documents/stats', { params: clean });
  return data;
};
