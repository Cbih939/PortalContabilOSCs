// src/utils/constants.js
//
// Perfis do sistema (mesmos valores normalizados devolvidos pela API).
// Hierarquia: ADMIN > ADM Contador (CONTADOR com is_office_admin) > CONTADOR > OSC.
// O perfil FINANCEIRO foi descontinuado.
export const ROLES = {
  ADMIN: 'ADMIN',
  CONTADOR: 'CONTADOR',
  OSC: 'OSC',
};

export const normalizeRole = (role) => {
  const value = String(role ?? '').toUpperCase().trim();
  return value === 'ADM' ? ROLES.ADMIN : value;
};

/** ADM Contador: contador dono/administrador de um escritório. */
export const isOfficeAdmin = (user) =>
  normalizeRole(user?.role) === ROLES.CONTADOR && Number(user?.is_office_admin) === 1;

/** Rota inicial de cada perfil. */
export const homePathFor = (user) => {
  const role = normalizeRole(user?.role);
  if (role === ROLES.ADMIN) return '/admin/dashboard';
  if (role === ROLES.CONTADOR) return '/contador/dashboard';
  if (role === ROLES.OSC) return Number(user?.is_in_debt) === 1 ? '/osc/financeiro' : '/osc/inicio';
  return '/login';
};

/** Referência operacional (≈ 20 lançamentos/mês). NÃO é um limite rígido. */
export const MONTHLY_REFERENCE_FALLBACK = 20;

/** Formatos aceitos no envio de documentos (espelha o filtro do servidor). */
export const UPLOAD_ACCEPT = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.ppt', '.pptx', '.png', '.jpg', '.jpeg', '.webp', '.txt'];
export const UPLOAD_MAX_MB = 50;
