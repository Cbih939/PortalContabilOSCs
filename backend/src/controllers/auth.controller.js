import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config/index.js'; // Garanta que config exporta JWT_SECRET

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validação básica
    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    // 2. Buscar usuário no banco
    const [rows] = await pool.execute(
      'SELECT id, name, email, password, role, status FROM users WHERE email = ?',
      [email]
    );

    // 3. Usuário não encontrado
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const user = rows[0];

    // 4. Verificar se está ativo
    if (user.status && user.status !== 'Ativo') {
        return res.status(403).json({ message: 'Usuário inativo.' });
    }

    // 5. Comparar senha (bcrypt)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    // 6. Gerar Token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      config.JWT_SECRET || 'secret_temp_key', // Fallback se config falhar
      { expiresIn: '24h' }
    );

    // 7. Retornar sucesso
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Erro no Login:', error);
    res.status(500).json({ message: 'Erro interno no servidor ao logar.' });
  }
};

// Função para validar token (opcional, usado em rota de check)
export const verifyToken = async (req, res) => {
    res.json({ valid: true, user: req.user });
};