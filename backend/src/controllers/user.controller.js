// backend/src/controllers/user.controller.js

// Importa os modelos e utilitários
import * as UserModel from '../models/user.model.js';
import { ROLES } from '../utils/constants.js';
import { hashPassword } from '../utils/bcrypt.utils.js';

/**
 * @desc    Busca todos os utilizadores do sistema (para o Admin).
 * @route   GET /api/users
 * @access  Privado (Admin)
 */
export const getAllUsers = async (req, res) => {
  try {
    // (A rota que chama este controlador deve ser protegida para ROLES.ADMIN)
    
    // Opcional: Receber filtros da query string (ex: /api/users?role=Contador)
    const filters = req.query; // ex: { role: 'Contador', name: 'Carlos' }

    const users = await UserModel.findAll(filters);
    
    // Remove dados sensíveis antes de enviar
    const safeUsers = users.map(user => {
      // eslint-disable-next-line no-unused-vars
      const { password_hash, ...safeUser } = user;
      return safeUser;
    });

    res.status(200).json(safeUsers);
  } catch (error) {
    console.error('Erro no controlador getAllUsers:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * @desc    Busca um utilizador específico pelo ID (para o Admin).
 * @route   GET /api/users/:id
 * @access  Privado (Admin)
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findUserById(id);

    if (!user) {
      return res.status(404).json({ message: 'Utilizador não encontrado.' });
    }

    // Remove a senha antes de enviar
    // eslint-disable-next-line no-unused-vars
    const { password_hash, ...safeUser } = user;
    res.status(200).json(safeUser);
  } catch (error) {
    console.error('Erro no controlador getUserById:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * @desc    Cria um novo utilizador (Admin ou Contador).
 * @route   POST /api/users
 * @access  Privado (Admin)
 * @body    { name: string, email: string, password: string, role: 'Adm' | 'Contador' }
 */
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Validação
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Nome, email, senha e perfil (role) são obrigatórios.' });
    }

    // 2. Validação do Perfil (Role)
    //    (Este endpoint não deve criar OSCs, use o /api/oscs para isso)
    if (role === ROLES.OSC) {
      return res.status(400).json({ 
        message: 'Para criar uma OSC, utilize a rota POST /api/oscs.' 
      });
    }
    if (role !== ROLES.ADMIN && role !== ROLES.CONTADOR) {
      return res.status(400).json({ message: 'Perfil (role) inválido.' });
    }

    // 3. Verifica duplicados
    const existingUser = await UserModel.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'Este email já está em uso.' });
    }

    // 4. Hash da senha
    const passwordHash = await hashPassword(password);

    // 5. Prepara os dados
    const userData = {
      name,
      email,
      password_hash: passwordHash,
      role: role,
    };

    // 6. Cria o utilizador no banco
    const newUser = await UserModel.createUser(userData);

    // 7. Retorna o utilizador criado (sem a senha)
    // eslint-disable-next-line no-unused-vars
    const { password_hash, ...safeUser } = newUser;
    res.status(201).json(safeUser);

  } catch (error) {
    console.error('Erro no controlador createUser:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email já existe.' });
    }
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * @desc    Atualiza um utilizador (Admin).
 * @route   PUT /api/users/:id
 * @access  Privado (Admin)
 * @body    { name: string, email: string, role: string, status: 'Ativo' | 'Inativo' }
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, status } = req.body;
    
    // (O Admin não deve poder editar a sua própria 'role' ou 'status'
    //  para evitar auto-lockout. O modelo deve tratar disso.)
    if (Number(id) === req.user.id) {
        if (req.body.role !== req.user.role || req.body.status === 'Inativo') {
             return res.status(403).json({ message: 'Não pode alterar o seu próprio perfil (role) ou status.' });
        }
    }

    // (Não permitimos alterar a senha por aqui,
    //  isso deve ser feito numa rota separada 'PATCH /api/users/:id/password')

    const updateData = { name, email, role, status };

    const updatedUser = await UserModel.updateUser(id, updateData);

    if (!updatedUser) {
      return res.status(404).json({ message: 'Utilizador não encontrado.' });
    }

    // eslint-disable-next-line no-unused-vars
    const { password_hash, ...safeUser } = updatedUser;
    res.status(200).json(safeUser);
    
  } catch (error) {
    console.error('Erro no controlador updateUser:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email já existe.' });
    }
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * @desc    Apaga um utilizador (Admin).
 * @route   DELETE /api/users/:id
 * @access  Privado (Admin)
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Medida de segurança: Não permitir que o Admin se apague a si mesmo
    if (Number(id) === req.user.id) {
      return res.status(403).json({ message: 'Não pode apagar a sua própria conta.' });
    }

    // O modelo deve verificar se o utilizador existe
    const success = await UserModel.deleteUser(id);

    if (!success) {
      return res.status(404).json({ message: 'Utilizador não encontrado.' });
    }
    
    // NOTA: O modelo 'deleteUser' deve usar uma TRANSAÇÃO
    // se precisar de apagar entidades associadas (ex: se apagar
    // um utilizador OSC, deve apagar a OSC na tabela 'oscs' também).

    res.status(204).send(); // 204 No Content (sucesso, sem corpo)
  } catch (error) {
    console.error('Erro no controlador deleteUser:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};