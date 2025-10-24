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
    // A verificação de Admin já é feita pelo middleware na rota

    // Opcional: Receber filtros da query string
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
    // A verificação de Admin já é feita pelo middleware na rota
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
    // A verificação de Admin já é feita pelo middleware na rota
    const { name, email, password, role } = req.body;

    // 1. Validação
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Nome, email, senha e perfil (role) são obrigatórios.' });
    }

    // 2. Validação do Perfil (Role)
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
      status: 'Ativo' // Utilizadores criados pelo Admin começam Ativos
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
 * @desc    Atualiza um utilizador.
 * @route   PUT /api/users/:id
 * @access  Privado (Admin OU o próprio utilizador)
 * @body    { name?: string, email?: string, role?: string, status?: 'Ativo' | 'Inativo' }
 */
export const updateUser = async (req, res) => {
  try {
    const { id: userIdToUpdate } = req.params; // ID do utilizador a ser atualizado (da URL)
    const { id: loggedInUserId, role: loggedInUserRole } = req.user; // Quem está a pedir (do token)
    
    // --- Verificação de Permissão ---
    const isSelf = Number(userIdToUpdate) === Number(loggedInUserId);
    const isAdmin = loggedInUserRole === ROLES.ADMIN;

    // Se não for o próprio utilizador E não for um Admin
    if (!isSelf && !isAdmin) { 
      console.log(`[UpdateUser] Falha: Utilizador ${loggedInUserId} tentou editar ${userIdToUpdate}.`);
      return res.status(403).json({ message: 'Acesso negado. Não pode editar este utilizador.' });
    }
    
    const updateData = req.body;
    
    // --- Regras de Negócio ---
    // O utilizador não pode mudar o seu próprio 'role' ou 'status'
    if (isSelf) {
        delete updateData.role;
        delete updateData.status;
        // Medida de segurança extra: não permitir que Admin se desative/mude perfil por esta rota
        if (isAdmin && (updateData.role !== ROLES.ADMIN || updateData.status === 'Inativo')) {
            delete updateData.role;
            delete updateData.status;
            console.warn(`[UpdateUser] Admin (ID: ${loggedInUserId}) tentou modificar o próprio role/status via API geral.`);
        }
    }
    
    // Não permitir atualização de senha por esta rota (deve ter rota própria)
    delete updateData.password;
    delete updateData.password_hash;

    // O modelo 'updateUser' lida com a atualização no DB
    const updatedUser = await UserModel.updateUser(userIdToUpdate, updateData);

    if (!updatedUser) {
      return res.status(404).json({ message: 'Utilizador não encontrado.' });
    }

    // Retorna o utilizador atualizado (sem o hash da senha)
    // eslint-disable-next-line no-unused-vars
    const { password_hash, ...safeUser } = updatedUser;
    res.status(200).json(safeUser);
    
  } catch (error) {
    console.error('Erro no controlador updateUser:', error);
    if (error.code === 'ER_DUP_ENTRY') { // Erro de email duplicado
      return res.status(409).json({ 
        message: 'Email já existe.', 
        // Formato de erro para o frontend ler
        errors: { email: 'Este email já está em uso por outra conta.' } 
      });
    }
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * @desc    Apaga um utilizador (Admin ou Contador).
 * @route   DELETE /api/users/:id
 * @access  Privado (Admin)
 */
export const deleteUser = async (req, res) => {
  try {
    // A verificação de Admin já é feita pelo middleware na rota
    const { id: userIdToDelete } = req.params;
    const { id: loggedInUserId } = req.user;

    // Medida de segurança: Não permitir que o Admin se apague a si mesmo
    if (Number(userIdToDelete) === Number(loggedInUserId)) {
      return res.status(403).json({ message: 'Não pode apagar a sua própria conta.' });
    }

    // O modelo deve verificar se o utilizador existe
    const success = await UserModel.deleteUser(userIdToDelete);

    if (!success) {
      return res.status(404).json({ message: 'Utilizador não encontrado ou é uma OSC (use DELETE /api/oscs/:id).' });
    }
    
    res.status(204).send(); // 204 No Content (sucesso, sem corpo)
  } catch (error) {
    console.error('Erro no controlador deleteUser:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};