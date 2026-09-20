// backend/src/utils/roles.js
//
// Fonte única de verdade para perfis (roles). Resolve a divergência histórica
// de vocabulário do sistema ('Adm', 'ADMIN', 'Contador', 'CONTADOR', ...).
//
// Hierarquia do produto:
//   ADMIN  >  ADM Contador (CONTADOR com is_office_admin = 1)  >  CONTADOR  >  OSC
//
// O perfil FINANCEIRO foi descontinuado: suas funcionalidades passaram para
// ADMIN (visão global) e ADM Contador (escopo do próprio escritório).

export const ROLE = Object.freeze({
  ADMIN: 'ADMIN',
  CONTADOR: 'CONTADOR',
  OSC: 'OSC',
});

/** Perfil descontinuado. Contas antigas com este valor são bloqueadas. */
export const LEGACY_FINANCEIRO = 'FINANCEIRO';

/** Normaliza qualquer variação gravada no banco ('Adm', 'admin', 'Contador'...). */
export const normalizeRole = (role) => {
  const value = String(role ?? '').toUpperCase().trim();
  if (value === 'ADM') return ROLE.ADMIN;
  return value;
};

export const isAdmin = (user) => normalizeRole(user?.role) === ROLE.ADMIN;
export const isContador = (user) => normalizeRole(user?.role) === ROLE.CONTADOR;
export const isOSC = (user) => normalizeRole(user?.role) === ROLE.OSC;
export const isLegacyFinanceiro = (user) => normalizeRole(user?.role) === LEGACY_FINANCEIRO;

/** ADM Contador = contador dono/administrador de um escritório. */
export const isOfficeAdmin = (user) =>
  isContador(user) && Number(user?.is_office_admin) === 1 && officeIdOf(user) !== null;

/** Contador (comum ou ADM) ou Admin: quem opera a carteira de OSCs. */
export const isStaff = (user) => isAdmin(user) || isContador(user);

/** office_id válido ou null (o sistema grava "0" em alguns fluxos legados). */
export const officeIdOf = (user) => {
  const raw = user?.office_id;
  if (raw === null || raw === undefined || raw === '' || String(raw) === '0') return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
};

/** Perfis que podem ser atribuídos via API de usuários. */
export const ASSIGNABLE_ROLES = Object.freeze([ROLE.ADMIN, ROLE.CONTADOR, ROLE.OSC]);
