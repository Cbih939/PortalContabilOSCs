import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'seusecretoseguro123';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Preencha todos os campos.' });
    }

    console.log('[Auth] Tentativa de login:', email);

    // CORREÇÃO: Selecionar a coluna correta 'password_hash'
    const [rows] = await pool.execute(
      'SELECT id, name, email, password_hash, role, status FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const user = rows[0];

    // Verificar status
    if (user.status !== 'Ativo') {
        return res.status(403).json({ message: 'Sua conta está inativa ou pendente.' });
    }

    // CORREÇÃO: Comparar senha enviada com 'password_hash' do banco
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      console.log('[Auth] Senha incorreta para:', email);
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    // Gerar Token
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });

  } catch (error) {
    console.error('ERRO CRÍTICO NO LOGIN:', error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};

// Placeholder para register se necessário
export const register = async (req, res) => {
    res.status(501).json({ message: "Rota de registro não implementada publicamente." });
};