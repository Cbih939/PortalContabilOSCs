// backend/src/controllers/auth.controller.js

// (Assumindo que estes ficheiros existirão em '../models/' e '../utils/')
import * as UserModel from '../models/user.model.js';
import { comparePassword } from '../utils/bcrypt.utils.js';
import { generateToken } from '../utils/jwt.utils.js';

/**
 * @desc    Autentica um utilizador (login) e retorna um token JWT.
 * @route   POST /api/auth/login
 * @access  Público
 * @body    { email: string, password: string }
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // --- LOG DE DEBUG ---
    console.log('[Auth Login] Tentativa de Login Recebida:', { email: email, password: password ? '******' : undefined }); // Não logue a senha em produção

    // 1. Validação básica de entrada
    if (!email || !password) {
      console.log('[Auth Login] Erro: Email ou senha em falta.');
      return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    // 2. Encontra o utilizador pelo email no banco
    const user = await UserModel.findUserByEmail(email);

    // --- LOG DE DEBUG ---
    // Logue o user encontrado, mas omita o hash em produção real se não for necessário
    console.log('[Auth Login] Utilizador encontrado no DB:', user ? { id: user.id, email: user.email, role: user.role, status: user.status } : null);

    if (!user) {
      console.log('[Auth Login] Erro: Utilizador não encontrado para o email:', email);
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    // (Poderia adicionar verificação de 'user.status === "Inativo"' aqui)
    if (user.status === 'Inativo') {
        console.log('[Auth Login] Erro: Utilizador está inativo:', email);
        return res.status(403).json({ message: 'Conta inativa.' }); // 403 Forbidden
    }

    // --- LOG DE DEBUG ---
    console.log('[Auth Login] Comparando Senha fornecida com Hash do DB:', user.password_hash);

    // 3. Compara a senha enviada com a senha hashada no banco
    const isPasswordMatch = await comparePassword(password, user.password_hash);

    // --- LOG DE DEBUG ---
    console.log('[Auth Login] Resultado da Comparação de Senha:', isPasswordMatch);

    if (!isPasswordMatch) {
      console.log('[Auth Login] Erro: Senha não corresponde para o email:', email);
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    // 4. Senha correta! Gerar um token JWT.
    const tokenPayload = {
      id: user.id,
      role: user.role,
      name: user.name,
    };
    const token = generateToken(tokenPayload);

    // 5. Prepara os dados do utilizador para enviar de volta
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      ...(user.role === 'OSC' && { cnpj: user.cnpj }), // Note: user pode não ter cnpj aqui, buscaria da tabela oscs
    };

    // --- LOG DE DEBUG ---
    console.log('[Auth Login] Login bem-sucedido para:', email);

    // 6. Envia a resposta
    res.status(200).json({
      message: 'Login bem-sucedido!',
      user: userResponse,
      token: token,
    });

  } catch (error) {
    // --- LOG DE DEBUG ---
    console.error('[Auth Login] Erro INESPERADO no controlador de login:', error); // Log do erro completo
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * @desc    Busca os dados do utilizador logado (baseado no token).
 * @route   GET /api/auth/me
 * @access  Privado (requer token)
 */
export const getMe = async (req, res) => {
  try {
    const userId = req.user?.id; // Usa optional chaining por segurança

    // --- LOG DE DEBUG ---
    console.log('[Auth GetMe] Requisição recebida para utilizador ID:', userId);

    if (!userId) {
        console.log('[Auth GetMe] Erro: ID do utilizador não encontrado no req.user (middleware falhou?).');
        return res.status(401).json({ message: 'Não autorizado.' });
    }

    // 1. Busca os dados mais recentes do utilizador
    const user = await UserModel.findUserById(userId);

    // --- LOG DE DEBUG ---
    console.log('[Auth GetMe] Utilizador encontrado no DB:', user ? { id: user.id, email: user.email, role: user.role, status: user.status } : null);

    if (!user) {
      console.log('[Auth GetMe] Erro: Utilizador com ID', userId, 'não encontrado no DB (token pode ser de user apagado).');
      return res.status(404).json({ message: 'Utilizador não encontrado.' });
    }

    // 2. Prepara a resposta
    // Para a OSC, buscaria o CNPJ da tabela 'oscs' aqui
    let cnpj = null;
    if (user.role === 'OSC') {
        const oscDetails = await OscModel.findById(user.id); // Assume que OscModel existe
        cnpj = oscDetails?.cnpj;
    }

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      ...(user.role === 'OSC' && { cnpj: cnpj }),
      // ...(user.role === 'Contador' && { email: user.email }), // Email já está incluído
    };

    // --- LOG DE DEBUG ---
    console.log('[Auth GetMe] Retornando dados para utilizador ID:', userId);

    res.status(200).json(userResponse);

  } catch (error) {
    // --- LOG DE DEBUG ---
    console.error('[Auth GetMe] Erro INESPERADO no controlador getMe:', error); // Log do erro completo
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Certifique-se de importar OscModel se o usar em getMe
import * as OscModel from '../models/osc.model.js'; // Adicione esta linha se necessário