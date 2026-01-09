import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'seusecretoseguro123';

// --- MIDDLEWARE DE VERIFICAÇÃO ---
export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Contém id, role e name
        next();
    } catch (error) {
        console.error('[Auth] Erro na verificação do token:', error.message);
        return res.status(403).json({ message: 'Token inválido ou expirado.' });
    }
};

// Alias para compatibilidade com outras rotas
export const protect = verifyToken;

// --- LÓGICA DE LOGIN ---
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Preencha email e senha.' });
        }

        console.log('[Auth] Tentativa de login:', email);

        // Busca pelo campo password_hash
        const [rows] = await pool.execute(
            'SELECT id, name, email, password_hash, role, status FROM users WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const user = rows[0];

        if (user.status !== 'Ativo') {
            return res.status(403).json({ message: 'Conta inativa.' });
        }

        // --- VERIFICAÇÃO HÍBRIDA ---
        let isMatch = false;
        try {
            // Tenta comparar como Bcrypt
            isMatch = await bcrypt.compare(password, user.password_hash);
        } catch (e) {
            isMatch = false;
        }

        // Fallback: Se não casou, tenta comparar texto simples diretamente
        if (!isMatch && password === user.password_hash) {
            console.log('[Auth] Senha em texto plano detectada para:', email);
            isMatch = true;
            
            // Atualização automática para Hash para segurança (Background)
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, user.id])
                .catch(err => console.error('[Auth] Erro ao atualizar hash:', err));
        }

        if (!isMatch) {
            console.log('[Auth] Senha incorreta para:', email);
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        // Gera o token com as informações necessárias
        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // RESPOSTA CORRIGIDA: Garante que o objeto 'user' existe
        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status
        };

        console.log('[Auth] Login bem-sucedido:', userData.email);

        return res.json({
            token,
            user: userData
        });

    } catch (error) {
        console.error('[Auth Error]:', error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};