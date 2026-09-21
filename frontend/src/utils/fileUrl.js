// URL de arquivos PÚBLICOS (logotipos, biblioteca e modelos institucionais).
// Documentos contábeis NÃO usam isto: são baixados pela API autenticada (documentService.saveDocument).

const API_BASE = import.meta.env.VITE_API_URL || 'https://contacomigo.org.br/api';

/** Origem do servidor (a base da API sem o sufixo /api). */
export const serverOrigin = () => API_BASE.replace(/\/api\/?$/, '').replace(/\/$/, '');

/** Converte o caminho salvo no banco (pode vir com barras invertidas) em URL absoluta. */
export const publicFileUrl = (storedPath = '') => {
  let clean = String(storedPath).replace(/\\/g, '/');
  if (clean.includes('uploads/')) clean = `uploads/${clean.split('uploads/').pop()}`;
  return `${serverOrigin()}/${clean.replace(/^\//, '')}`;
};

/** Link direto de um item da biblioteca/modelos (kind: "file" | "cover"). Serve arquivos antigos e novos. */
export const libraryFileUrl = (id, kind = 'file', { download = false } = {}) =>
  `${API_BASE.replace(/\/$/, '')}/public-files/${id}/${kind}${download ? '?download=1' : ''}`;
