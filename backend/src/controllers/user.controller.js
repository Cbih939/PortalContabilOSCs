// backend/src/controllers/user.controller.js

import pool from '../config/db.js'; // Importação essencial para a query SQL direta
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
    const filters = req.query; 
    const users = await UserModel.findAll(filters);
    
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
 */
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Nome, email, senha e perfil (role) são obrigatórios.' });
    }

    if (role === ROLES.OSC) {
      return res.status(400).json({ 
        message: 'Para criar uma OSC, utilize a rota POST /api/oscs.' 
      });
    }
    if (role !== ROLES.ADMIN && role !== ROLES.CONTADOR) {
      return res.status(400).json({ message: 'Perfil (role) inválido.' });
    }

    const existingUser = await UserModel.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'Este email já está em uso.' });
    }

    const passwordHash = await hashPassword(password);

    const userData = {
      name,
      email,
      password_hash: passwordHash,
      role: role,
      status: 'Ativo'
    };

    const newUser = await UserModel.createUser(userData);

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
 * @desc    Atualiza um utilizador (Perfil ou Admin).
 * @route   PUT /api/users/:id
 * @access  Privado (Admin OU o próprio utilizador)
 */
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role } = req.body;

        console.log(`[User Update] Processando ID: ${id}`);

        // 1. Executa a atualização no banco
        const [result] = await pool.execute(
            'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
            [name, email, role || 'Contador', id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Utilizador não encontrado.' });
        }

        // 2. BUSCA OS DADOS ATUALIZADOS (Crucial para o Frontend não receber undefined)
        const [rows] = await pool.execute(
            'SELECT id, name, email, role, status FROM users WHERE id = ?',
            [id]
        );
        
        const updatedUser = rows[0];

        console.log(`[User Update] Sucesso para: ${updatedUser.name}`);

        // 3. Retorna o objeto USER completo para o Frontend atualizar o AuthContext
        return res.json({ 
            success: true, 
            message: 'Perfil atualizado com sucesso!',
            user: updatedUser // <--- O Frontend precisa disso aqui
        });

    } catch (error) {
        console.error('[User SQL Error]:', error);
        return res.status(500).json({ message: 'Erro interno ao salvar perfil.' });
    }
};

/**
 * @desc    Apaga um utilizador.
 * @route   DELETE /api/users/:id
 * @access  Privado (Admin)
 */
export const deleteUser = async (req, res) => {
  try {
    const { id: userIdToDelete } = req.params;
    const { id: loggedInUserId } = req.user;

    if (Number(userIdToDelete) === Number(loggedInUserId)) {
      return res.status(403).json({ message: 'Não pode apagar a sua própria conta.' });
    }

    const success = await UserModel.deleteUser(userIdToDelete);

    if (!success) {
      return res.status(404).json({ message: 'Utilizador não encontrado.' });
    }
    
    res.status(204).send(); 
  } catch (error) {
    console.error('Erro no controlador deleteUser:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};