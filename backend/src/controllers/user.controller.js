// backend/src/controllers/user.controller.js
import pool from '../config/db.js';
import * as UserModel from '../models/user.model.js';
import { ROLES } from '../utils/constants.js';
import { hashPassword } from '../utils/bcrypt.utils.js';

export const getAllUsers = async (req, res) => {
  try {
    console.log('[User Admin] Buscando lista completa de utilizadores...');

    // Busca direta no banco de dados
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, status FROM users'
    );

    console.log(`[User Admin] Foram encontrados ${rows.length} utilizadores.`);

    // Retorna a lista para o Administrador
    res.status(200).json(rows);
  } catch (error) {
    console.error('[User Admin Error]:', error);
    res.status(500).json({ message: 'Erro ao buscar utilizadores no servidor.' });
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
 * UPDATE USERs
 */
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role } = req.body;

        console.log(`[User Update] Processando ID: ${id}`);

        // 1. Atualiza no banco de dados
        const [result] = await pool.execute(
            'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
            [name, email, role || 'Contador', id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Utilizador não encontrado.' });
        }

        // 2. BUSCA OS DADOS ATUALIZADOS (Isto evita o erro de 'user: undefined' no console)
        const [rows] = await pool.execute(
            'SELECT id, name, email, role, status FROM users WHERE id = ?',
            [id]
        );
        
        const updatedUser = rows[0];

        console.log(`[User Update] Sucesso total para: ${updatedUser.name}`);

        // 3. Resposta que o Frontend (index-EZfsWbwC.js:52) exige
        return res.json({ 
            success: true, 
            message: 'Perfil atualizado com sucesso!',
            user: updatedUser // <--- ESSENCIAL
        });

    } catch (error) {
        console.error('[User SQL Error]:', error);
        return res.status(500).json({ message: 'Erro interno ao salvar perfil.' });
    }
};

/**
 * DELETE USERs
 */

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