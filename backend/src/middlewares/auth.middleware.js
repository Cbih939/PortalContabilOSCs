import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import config from '../config/index.js';
import {
    ROLE, normalizeRole, isAdmin, isOSC, isLegacyFinanceiro, isOfficeAdmin,
} from '../utils/roles.js';

const JWT_SECRET = config.JWT_SECRET; // sem fallback (ver config/index.js)

// Cache curto para não consultar o banco em cada requisição concorrente.
const USER_CACHE_TTL_MS = 10_000;
const userCache = new Map();

/** Invalida o cache de um usuário (chamar após alterar role/status/office/débito). */
export const invalidateUserCache = (userId) => userCache.delete(Number(userId));

const AUTH_COLUMNS_FULL = 'id, name, email, role, status, is_in_debt, office_id, is_office_admin';
const AUTH_COLUMNS_LEGACY = 'id, name, email, role, status, is_in_debt, office_id';

/** Carrega o usuário atual do banco. Tolera schema ainda sem a coluna is_office_admin. */
export const loadAuthUser = async (userId) => {
    const cached = userCache.get(Number(userId));
    if (cached && cached.expires > Date.now()) return cached.user;

    let rows;
    try {
        [rows] = await pool.execute(`SELECT ${AUTH_COLUMNS_FULL} FROM users WHERE id = ?`, [userId]);
    } catch (error) {
        if (error.code !== 'ER_BAD_FIELD_ERROR') throw error;
        [rows] = await pool.execute(`SELECT ${AUTH_COLUMNS_LEGACY} FROM users WHERE id = ?`, [userId]);
    }
    const user = rows[0] || null;
    userCache.set(Number(userId), { user, expires: Date.now() + USER_CACHE_TTL_MS });
    return user;
};

// 1. Verifica o token e recarrega o usuário (role, status, escritório e débito sempre atuais)
export const verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return res.status(403).json({ message: 'Token inválido ou expirado.' });
    }

    try {
        const fresh = await loadAuthUser(decoded.id);
        if (!fresh) return res.status(401).json({ message: 'Usuário não encontrado.' });
        if (fresh.status !== 'Ativo') return res.status(403).json({ message: 'Conta inativa.' });
        if (isLegacyFinanceiro(fresh)) {
            return res.status(403).json({
                message: 'O perfil Financeiro foi descontinuado. Solicite ao administrador a migração da sua conta.',
            });
        }

        req.user = {
            ...decoded,
            id: fresh.id,
            name: fresh.name,
            email: fresh.email,
            role: normalizeRole(fresh.role), // 'ADMIN' | 'CONTADOR' | 'OSC'
            is_in_debt: fresh.is_in_debt,
            office_id: fresh.office_id,
            is_office_admin: Number(fresh.is_office_admin) || 0,
        };
        next();
    } catch (error) {
        console.error('[Auth] Falha ao validar usuário:', error.message);
        return res.status(500).json({ message: 'Erro ao validar a sessão.' });
    }
};

// 2. Alias para rotas que importam { protect }
export const protect = verifyToken;

// 3. Verifica o papel (Role). Aceita 'admin', 'Adm', 'CONTADOR'... (normalizado).
//    O perfil 'financeiro' não é mais aceito em nenhuma rota.
export const checkRole = (allowedRoles) => {
    const roles = (Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]).map(normalizeRole);
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: 'Acesso proibido. Role não identificado.' });
        }
        if (!roles.includes(normalizeRole(req.user.role))) {
            console.warn(`[Acesso Negado] Usuário ${req.user.id} (${req.user.role}) tentou acessar rota restrita a: ${roles}`);
            return res.status(403).json({
                message: 'Acesso proibido. Você não tem permissão para acessar este recurso.',
            });
        }
        next();
    };
};

/** Somente ADMIN ou ADM Contador (contador dono do escritório). */
export const requireAdminOrOfficeAdmin = (req, res, next) => {
    if (isAdmin(req.user) || isOfficeAdmin(req.user)) return next();
    return res.status(403).json({
        message: 'Acesso restrito ao Administrador ou ao ADM do escritório.',
    });
};

// Bloqueia módulos se a OSC estiver em débito. Usa o valor ATUAL do banco (não o do token).
export const blockIfInDebt = (req, res, next) => {
    if (isOSC(req.user) && Number(req.user.is_in_debt) === 1) {
        return res.status(402).json({
            debt: true,
            message: 'Acesso suspenso. Regularize seu pagamento no módulo Financeiro.',
        });
    }
    next();
};

// Bloqueia acesso se estiver em manutenção (exceto admins)
export const maintenanceGuard = async (req, res, next) => {
    try {
        const [settings] = await pool.execute('SELECT maintenance_mode FROM system_settings WHERE id = 1');
        if (settings[0]?.maintenance_mode && !isAdmin(req.user)) {
            return res.status(503).json({
                maintenance: true,
                message: 'Plataforma em manutenção para atualizações. Voltamos em breve!',
            });
        }
        next();
    } catch (error) {
        next();
    }
};

export { ROLE };
