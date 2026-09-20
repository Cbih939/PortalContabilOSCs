import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { verifyToken, protect, loadAuthUser, invalidateUserCache } from '../middlewares/auth.middleware.js';
import { normalizeRole, isLegacyFinanceiro, isOfficeAdmin } from '../utils/roles.js';

const JWT_SECRET = config.JWT_SECRET; // sem fallback

// Compatibilidade: outras rotas importam { verifyToken } deste módulo.
export { verifyToken, protect };

/** Dados do usuário expostos ao frontend (nunca inclui password_hash). */
const toPublicUser = (u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: normalizeRole(u.role),
    status: u.status,
    is_in_debt: u.is_in_debt,
    office_id: u.office_id,
    is_office_admin: Number(u.is_office_admin) || 0,
    is_office_owner: isOfficeAdmin({ ...u, role: normalizeRole(u.role), is_office_admin: u.is_office_admin }),
    onboarding_completed_at: u.onboarding_completed_at || null,
});

const findUserForLogin = async (email) => {
    try {
        const [rows] = await pool.execute(
            'SELECT id, name, email, password_hash, role, status, is_in_debt, office_id, is_office_admin, onboarding_completed_at FROM users WHERE email = ?',
            [email]
        );
        return rows[0] || null;
    } catch (error) {
        if (error.code !== 'ER_BAD_FIELD_ERROR') throw error;
        // Banco ainda sem as colunas do redesign (migração pendente): login segue funcionando.
        const [rows] = await pool.execute(
            'SELECT id, name, email, password_hash, role, status, is_in_debt, office_id FROM users WHERE email = ?',
            [email]
        );
        return rows[0] || null;
    }
};

// --- FUNÇÃO DE LOGIN ---
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Preencha todos os campos.' });

        const user = await findUserForLogin(email);
        if (!user) return res.status(401).json({ message: 'Credenciais inválidas.' });
        if (user.status !== 'Ativo') return res.status(403).json({ message: 'Conta inativa.' });

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ message: 'Credenciais inválidas.' });

        // O perfil Financeiro foi descontinuado: não emitimos token para contas antigas.
        if (isLegacyFinanceiro(user)) {
            return res.status(403).json({
                message: 'O perfil Financeiro foi descontinuado. Procure o administrador para migrar a sua conta.',
            });
        }

        const publicUser = toPublicUser(user);
        const token = jwt.sign(
            {
                id: user.id,
                role: publicUser.role,
                name: user.name,
                is_in_debt: user.is_in_debt,
                office_id: user.office_id,
                is_office_admin: publicUser.is_office_admin,
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.json({ token, user: publicUser });
    } catch (error) {
        console.error('[Auth Error]:', error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// --- SESSÃO ATUAL (dados sempre frescos: débito, escritório, ADM, onboarding) ---
export const me = async (req, res) => {
    try {
        invalidateUserCache(req.user.id);
        const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [req.user.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Usuário não encontrado.' });
        return res.json({ user: toPublicUser(rows[0]) });
    } catch (error) {
        console.error('[Auth me]:', error);
        return res.status(500).json({ message: 'Erro ao carregar a sessão.' });
    }
};

// --- ONBOARDING: registra que o usuário concluiu (ou pulou) o tour ---
export const completeOnboarding = async (req, res) => {
    try {
        await pool.execute('UPDATE users SET onboarding_completed_at = NOW() WHERE id = ?', [req.user.id]);
        invalidateUserCache(req.user.id);
        return res.json({ success: true, onboarding_completed_at: new Date().toISOString() });
    } catch (error) {
        if (error.code === 'ER_BAD_FIELD_ERROR') {
            return res.status(503).json({ message: 'Migração do banco pendente (onboarding_completed_at).' });
        }
        console.error('[Onboarding]:', error);
        return res.status(500).json({ message: 'Erro ao registrar o onboarding.' });
    }
};

// --- FUNÇÃO DE REGISTRO ---
// --- FUNÇÃO DE REGISTRO ---
export const registerOSC = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const data = req.body;
        const files = req.files || {}; // Prevenção de erro de ficheiros

        const [existing] = await connection.execute('SELECT id FROM users WHERE email = ?', [data.coordEmail]);
        if (existing.length > 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'E-mail já cadastrado.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.coordSenha, salt);
        
        const [userResult] = await connection.execute(
            'INSERT INTO users (name, email, password_hash, role, status, is_in_debt) VALUES (?, ?, ?, "OSC", "Ativo", 1)',
            [data.coordNome, data.coordEmail, hashedPassword]
        );
        const userId = userResult.insertId;

        const logoPath = files['logotipo'] ? `uploads/public/${files['logotipo'][0].filename}` : null;
        const ataPath = files['ata'] ? `uploads/public/${files['ata'][0].filename}` : null;
        const estatutoPath = files['estatuto'] ? `uploads/public/${files['estatuto'][0].filename}` : null;

        // --- ATUALIZAÇÃO AQUI: Adicionamos as duas novas datas no SQL ---
        const sqlOSC = `
            INSERT INTO oscs (
                user_id, name, razao_social, cnpj, data_fundacao, email_contato, telefone, 
                cep, endereco, numero, bairro, cidade, estado, logo_path, ata_path, estatuto_path, assigned_contador_id,
                data_origem_estatuto, data_contrato_conta_comigo
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`;

        await connection.execute(sqlOSC, [
            userId, 
            data.nomeFantasia, 
            data.razaoSocial, 
            data.cnpj, 
            data.dataFundacao || null,
            data.emailContato, 
            data.telefone, 
            data.cep, 
            data.endereco, 
            data.numero,
            data.bairro, 
            data.cidade, 
            data.estado, 
            logoPath, 
            ataPath, 
            estatutoPath,
            // --- ATUALIZAÇÃO AQUI: Os valores das datas vindos do frontend ---
            data.dataOrigemEstatuto || null,
            data.data_contrato_conta_comigo || null
        ]);

        await connection.commit();

        // Gerar token de login automático
        const token = jwt.sign(
            { id: userId, role: 'OSC', name: data.coordNome, is_in_debt: 1 },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({ token, message: "Cadastro realizado com sucesso." });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('[Register OSC Error]:', error);
        res.status(500).json({ message: 'Erro ao processar o cadastro.' });
    } finally {
        if (connection) connection.release();
    }
};