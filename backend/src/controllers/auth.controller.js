import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Tenta pegar o segredo do .env, senão usa um fallback para não crashar
const JWT_SECRET = process.env.JWT_SECRET || 'seusecretoseguro123';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validação básica
    if (!email || !password) {
      return res.status(400).json({ message: 'Por favor, informe email e senha.' });
    }

    // 2. Buscar usuário no banco de dados
    // Selecionamos explicitamente os campos para evitar erros se o DB mudou
    const [rows] = await pool.execute(
      'SELECT id, name, email, password, role, status FROM users WHERE email = ?',
      [email]
    );

    // 3. Verifica se encontrou alguém
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const user = rows[0];

    // 4. Verifica status (se a coluna existir e estiver inativo)
    if (user.status && user.status !== 'Ativo') {
        return res.status(403).json({ message: 'Usuário inativo ou pendente.' });
    }

    // 5. Comparar senha (bcrypt)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    // 6. Gerar Token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role, 
        name: user.name 
      },
      JWT_SECRET,
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
    // Log do erro no terminal para podermos ver o que houve sem crashar o server
    console.error('ERRO CRÍTICO NO LOGIN:', error);
    res.status(500).json({ message: 'Erro interno no servidor ao tentar logar.' });
  }
};

// Função auxiliar para verificar token (útil para o frontend validar sessão)
export const verifyToken = async (req, res) => {
    // Se chegou aqui, o middleware 'protect' já validou o token
    res.json({ valid: true, user: req.user });
};