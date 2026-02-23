import pool from '../config/db.js';
import * as UserModel from '../models/user.model.js';
import { hashPassword } from '../utils/bcrypt.utils.js';

// LISTAR TODOS
export const getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, status, is_in_debt FROM users'
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('[getAllUsers Error]:', error);
    res.status(500).json({ message: 'Erro ao buscar utilizadores.' });
  }
};

// BUSCAR POR ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, status, is_in_debt FROM users WHERE id = ?',
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Utilizador não encontrado.' });
    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar utilizador.' });
  }
};

// CRIAR
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Campos obrigatórios em falta.' });
    }

    const existingUser = await UserModel.findUserByEmail(email);
    if (existingUser) return res.status(409).json({ message: 'Email já em uso.' });
    
    const passwordHash = await hashPassword(password);
    
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password_hash, role, status, is_in_debt) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, passwordHash, role.toUpperCase().trim(), 'Ativo', 0]
    );

    const newUser = { id: result.insertId, name, email, role: role.toUpperCase(), status: 'Ativo' };
    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.error('[createUser Error]:', error);
    res.status(500).json({ message: 'Erro interno ao criar utilizador.' });
  }
};

// ATUALIZAR
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, status } = req.body;

    const [result] = await pool.execute(
      'UPDATE users SET name = ?, email = ?, role = ?, status = ? WHERE id = ?',
      [name, email, role?.toUpperCase().trim() || 'CONTADOR', status || 'Ativo', id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: 'Utilizador não encontrado.' });

    const [rows] = await pool.execute(
      'SELECT id, name, email, role, status FROM users WHERE id = ?',
      [id]
    );
    
    return res.json({ success: true, user: rows[0] });
  } catch (error) {
    console.error('[updateUser Error]:', error);
    res.status(500).json({ message: 'Erro interno ao salvar perfil.' });
  }
};

// ELIMINAR
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Utilizador não encontrado.' });
    res.status(200).json({ message: 'Utilizador eliminado com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao eliminar utilizador.' });
  }
};