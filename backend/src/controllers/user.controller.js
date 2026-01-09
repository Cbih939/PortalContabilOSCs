// backend/src/controllers/user.controller.js
import pool from '../config/db.js';
import * as UserModel from '../models/user.model.js';
import { ROLES } from '../utils/constants.js';
import { hashPassword } from '../utils/bcrypt.utils.js';

export const getAllUsers = async (req, res) => {
  try {
    const filters = req.query; 
    const users = await UserModel.findAll(filters);
    const safeUsers = users.map(user => {
      const { password_hash, ...safeUser } = user;
      return safeUser;
    });
    res.status(200).json(safeUsers);
  } catch (error) {
    console.error('Erro no controlador getAllUsers:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findUserById(id);
    if (!user) return res.status(404).json({ message: 'Utilizador não encontrado.' });
    const { password_hash, ...safeUser } = user;
    res.status(200).json(safeUser);
  } catch (error) {
    console.error('Erro no controlador getUserById:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Campos obrigatórios em falta.' });
    }
    const existingUser = await UserModel.findUserByEmail(email);
    if (existingUser) return res.status(409).json({ message: 'Email já em uso.' });
    
    const passwordHash = await hashPassword(password);
    const newUser = await UserModel.createUser({
      name, email, password_hash: passwordHash, role, status: 'Ativo'
    });
    const { password_hash, ...safeUser } = newUser;
    res.status(201).json(safeUser);
  } catch (error) {
    console.error('Erro no controlador createUser:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * CORREÇÃO: Atualiza e retorna o objeto USER para o Frontend não dar "undefined"
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

        // 2. BUSCA OS DADOS ATUALIZADOS para o React atualizar o AuthContext
        const [rows] = await pool.execute(
            'SELECT id, name, email, role, status FROM users WHERE id = ?',
            [id]
        );
        
        const updatedUser = rows[0];

        console.log(`[User Update] Sucesso para: ${updatedUser.name}`);

        // 3. Retorna 'user' explicitamente
        return res.json({ 
            success: true, 
            message: 'Perfil atualizado com sucesso!',
            user: updatedUser 
        });

    } catch (error) {
        console.error('[User SQL Error]:', error);
        return res.status(500).json({ message: 'Erro interno ao salvar perfil.' });
    }
};

export const deleteUser = async (req, res) => {
  try {
    const { id: userIdToDelete } = req.params;
    const success = await UserModel.deleteUser(userIdToDelete);
    if (!success) return res.status(404).json({ message: 'Utilizador não encontrado.' });
    res.status(204).send(); 
  } catch (error) {
    console.error('Erro no controlador deleteUser:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};