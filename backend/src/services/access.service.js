// backend/src/services/access.service.js
//
// Regras centralizadas de "quem pode ver/alterar o quê" sobre OSCs, documentos e usuários.
// Evita repetir (e errar) esses filtros em cada controller.

import pool from '../config/db.js';
import { isAdmin, isContador, isOSC, isOfficeAdmin, officeIdOf } from '../utils/roles.js';

/** Busca os campos de vínculo de uma OSC. */
export const findOscLinks = async (oscId) => {
    const [rows] = await pool.execute(
        'SELECT id, user_id, office_id, assigned_contador_id, razao_social FROM oscs WHERE id = ?',
        [oscId]
    );
    return rows[0] || null;
};

/**
 * A OSC é acessível pelo usuário?
 *  - ADMIN: todas
 *  - CONTADOR / ADM Contador: OSCs do próprio escritório OU atribuídas a ele
 *  - OSC: somente a própria
 */
export const canAccessOsc = (user, osc) => {
    if (!user || !osc) return false;
    if (isAdmin(user)) return true;
    if (isContador(user)) {
        const office = officeIdOf(user);
        if (office !== null && Number(osc.office_id) === office) return true;
        return Number(osc.assigned_contador_id) === Number(user.id);
    }
    if (isOSC(user)) return Number(osc.user_id) === Number(user.id);
    return false;
};

/** Retorna a OSC se o usuário tiver acesso; caso contrário null. */
export const getAccessibleOsc = async (user, oscId) => {
    if (oscId === undefined || oscId === null || oscId === '') return null;
    const osc = await findOscLinks(oscId);
    return canAccessOsc(user, osc) ? osc : null;
};

/** Pode gerenciar (excluir/reatribuir/editar dados cadastrais) a OSC? Somente ADMIN e ADM Contador do escritório. */
export const canManageOsc = (user, osc) => {
    if (!user || !osc) return false;
    if (isAdmin(user)) return true;
    return isOfficeAdmin(user) && Number(osc.office_id) === officeIdOf(user);
};

/**
 * Fragmento SQL + parâmetros para filtrar OSCs visíveis ao usuário.
 * @param {object} user  req.user
 * @param {string} alias alias da tabela oscs na query (padrão 'o')
 */
export const oscScope = (user, alias = 'o') => {
    if (isAdmin(user)) return { sql: '1=1', params: [] };
    if (isContador(user)) {
        const office = officeIdOf(user);
        if (office !== null) {
            return {
                sql: `(${alias}.office_id = ? OR ${alias}.assigned_contador_id = ?)`,
                params: [office, user.id],
            };
        }
        return { sql: `${alias}.assigned_contador_id = ?`, params: [user.id] };
    }
    if (isOSC(user)) return { sql: `${alias}.user_id = ?`, params: [user.id] };
    return { sql: '1=0', params: [] };
};

/** Resolve a OSC (linha em `oscs`) do usuário OSC logado. */
export const findOscOfUser = async (userId) => {
    const [rows] = await pool.execute(
        'SELECT id, user_id, office_id, assigned_contador_id, razao_social FROM oscs WHERE user_id = ?',
        [userId]
    );
    return rows[0] || null;
};
