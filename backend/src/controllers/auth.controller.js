// backend/src/controllers/auth.controller.js
import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'seusecretoseguro123jwt';

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Token não fornecido.' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Token inválido.' });
    }
};

export const protect = verifyToken;

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Preencha todos os campos.' });

        // CORREÇÃO 1: Adicionado 'is_in_debt' na consulta SQL
        const [rows] = await pool.execute(
            'SELECT id, name, email, password_hash, role, status, is_in_debt FROM users WHERE email = ?',
            [email]
        );

        if (rows.length === 0) return res.status(401).json({ message: 'Credenciais inválidas.' });

        const user = rows[0];
        if (user.status !== 'Ativo') return res.status(403).json({ message: 'Conta inativa.' });

        let isMatch = false;
        try {
            isMatch = await bcrypt.compare(password, user.password_hash);
        } catch (e) { isMatch = false; }

        if (!isMatch && password === user.password_hash) {
            isMatch = true;
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, user.id]);
        }

        if (!isMatch) return res.status(401).json({ message: 'Senha incorreta.' });

        // CORREÇÃO 2: Adicionado 'is_in_debt' dentro do Token JWT
        // Isso garante que o status de débito viaje com o usuário em cada requisição
        const token = jwt.sign(
            { 
                id: user.id, 
                role: user.role, 
                name: user.name, 
                is_in_debt: user.is_in_debt // <--- Importante para as rotas protegidas
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // CORREÇÃO 3: Enviando 'is_in_debt' na resposta para o Frontend
        return res.json({
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                is_in_debt: user.is_in_debt // Agora o Frontend receberá 0 ou 1
            }
        });

    } catch (error) {
        console.error('[Auth Error]:', error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};