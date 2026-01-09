import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'seusecretoseguro123';

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Preencha email e senha.' });
        }

        console.log('[Auth] Tentativa de login:', email);

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
            console.log('[Auth] Senha em texto plano detectada. Convertendo para Hash...');
            isMatch = true;
            
            // Opcional: Atualiza o banco para Hash para maior segurança
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, user.id]);
        }

        if (!isMatch) {
            console.log('[Auth] Senha incorreta para:', email);
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status }
        });

    } catch (error) {
        console.error('Erro Login:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};