import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Usa variável de ambiente ou fallback para desenvolvimento
const JWT_SECRET = process.env.JWT_SECRET || 'seusecretoseguro123';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validação básica
    if (!email || !password) {
      return res.status(400).json({ message: 'Por favor, preencha email e senha.' });
    }

    console.log('[Auth Login] Tentativa de Login:', email);

    // 1. Buscar usuário no banco
    // CORREÇÃO: Alterado de 'password' para 'password_hash' para bater com o banco de dados
    const [rows] = await pool.execute(
      'SELECT id, name, email, password_hash, role, status FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const user = rows[0];

    // 2. Verificar se a conta está ativa
    if (user.status !== 'Ativo') {
        return res.status(403).json({ message: 'Sua conta está inativa ou pendente de aprovação.' });
    }

    // 3. Comparar a senha (usando password_hash)
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      console.log('[Auth Login] Senha incorreta para:', email);
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    // 4. Gerar Token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        name: user.name 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('[Auth Login] Sucesso:', email);

    // Retorna dados do usuário e token
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
    res.status(500).json({ message: 'Erro interno ao realizar login.' });
  }
};

// Função opcional de registro (caso exista neste arquivo)
// Mantida genérica para evitar erros de importação se for usada nas rotas
export const register = async (req, res) => {
    res.status(501).json({ message: "Registro deve ser feito pelo Admin." });
};