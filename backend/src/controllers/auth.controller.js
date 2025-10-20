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

    // 1. Validação básica de entrada
    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    // 2. Encontra o utilizador pelo email no banco
    const user = await UserModel.findUserByEmail(email);
    if (!user) {
      // Mensagem genérica por segurança (não informa se foi o email ou a senha)
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }
    
    // (Poderia adicionar verificação de 'user.status === "Inativo"' aqui)

    // 3. Compara a senha enviada com a senha hashada no banco
    const isPasswordMatch = await comparePassword(password, user.password_hash);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    // 4. Senha correta! Gerar um token JWT.
    //    Preparamos o 'payload' (carga útil) do token.
    //    NUNCA coloque a senha no token.
    const tokenPayload = {
      id: user.id,
      role: user.role,
      name: user.name,
    };
    
    const token = generateToken(tokenPayload);

    // 5. Prepara os dados do utilizador para enviar de volta (sem a senha!)
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      // Adiciona campos extra dependendo do perfil (baseado no protótipo)
      ...(user.role === 'OSC' && { cnpj: user.cnpj }),
    };

    // 6. Envia a resposta
    res.status(200).json({
      message: 'Login bem-sucedido!',
      user: userResponse,
      token: token,
    });

  } catch (error) {
    console.error('Erro no controlador de login:', error);
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
    // O 'req.user' é injetado pelo middleware 'auth.middleware.js'
    // que decodifica o token JWT.
    // Ele contém o 'payload' que definimos no login (id, role, name).
    const userId = req.user.id;

    // 1. Busca os dados *mais recentes* do utilizador no banco
    //    (Isso garante que o frontend receba dados atualizados,
    //    caso o 'role' ou 'name' tenham mudado desde o login)
    const user = await UserModel.findUserById(userId);

    if (!user) {
      // O token era válido, mas o utilizador foi apagado do banco?
      return res.status(404).json({ message: 'Utilizador não encontrado.' });
    }

    // 2. Prepara a resposta (sem dados sensíveis como 'password_hash')
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      ...(user.role === 'OSC' && { cnpj: user.cnpj }),
      ...(user.role === 'Contador' && { email: user.email }),
    };

    res.status(200).json(userResponse);

  } catch (error) {
    console.error('Erro no controlador getMe:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};