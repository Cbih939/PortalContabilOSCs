// backend/src/controllers/user.controller.js
import pool from '../config/db.js';
import * as UserModel from '../models/user.model.js';
import { hashPassword } from '../utils/bcrypt.utils.js';

export const getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, status, is_in_debt FROM users'
    );
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar utilizadores.' });
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
    
    // Normalização: Role para Maiúsculas e is_in_debt para 0 (Administrativo)
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password_hash, role, status, is_in_debt) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, passwordHash, role.toUpperCase(), 'Ativo', 0]
    );

    const newUser = { id: result.insertId, name, email, role: role.toUpperCase(), status: 'Ativo' };
    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role } = req.body;

        const [result] = await pool.execute(
            'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
            [name, email, role?.toUpperCase() || 'CONTADOR', id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Utilizador não encontrado.' });
        }

        const [rows] = await pool.execute(
            'SELECT id, name, email, role, status FROM users WHERE id = ?',
            [id]
        );
        
        return res.json({ 
            success: true, 
            message: 'Perfil atualizado com sucesso!',
            user: rows[0] 
        });

    } catch (error) {
        console.error('[User SQL Error]:', error);
        return res.status(500).json({ message: 'Erro interno ao salvar perfil.' });
    }
};