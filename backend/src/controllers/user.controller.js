import pool from '../config/db.js';
import * as UserModel from '../models/user.model.js';
import { hashPassword } from '../utils/bcrypt.utils.js';
import bcrypt from 'bcryptjs'; // <-- IMPORTAÇÃO NECESSÁRIA PARA A SENHA

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

// LISTAR TODOS
export const getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, status, is_in_debt, office_id FROM users'
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('[getAllUsers Error]:', error);
    res.status(500).json({ message: 'Erro ao buscar utilizadores.' });
  }
};

// CRIAR
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, office_id } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Campos obrigatórios em falta.' });
    }

    const existingUser = await UserModel.findUserByEmail(email);
    if (existingUser) return res.status(409).json({ message: 'Email já em uso.' });
    
    const passwordHash = await hashPassword(password);
    
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password_hash, role, status, is_in_debt, office_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, passwordHash, role.toUpperCase().trim(), 'Ativo', 0, office_id || null]
    );

    const newUser = { id: result.insertId, name, email, role: role.toUpperCase(), status: 'Ativo', office_id };
    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.error('[createUser Error]:', error);
    res.status(500).json({ message: 'Erro interno ao criar utilizador.' });
  }
};

// ATUALIZAR (Preparado para Admin e para o Perfil do Contador)
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, role, status, office_id, currentPassword, newPassword } = req.body;

  try {
    // 1. Busca os dados atuais do utilizador
    const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    
    if (users.length === 0) {
        return res.status(404).json({ message: 'Utilizador não encontrado.' });
    }
    
    const user = users[0];

    // 2. Proteção: Se a requisição vier do Perfil (não tem role/status), mantém o que já está na DB
    const finalRole = role !== undefined ? role : user.role;
    const finalStatus = status !== undefined ? status : user.status;
    const finalOfficeId = office_id !== undefined ? office_id : user.office_id;

    // 3. Lógica se o utilizador quiser ALTERAR A SENHA
    if (newPassword) {
        if (!currentPassword) {
            return res.status(400).json({ message: 'A senha atual é obrigatória para definir uma nova.' });
        }

        // Compara a senha digitada com a que está no banco
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'A senha atual está incorreta.' });
        }

        // Encripta a nova senha
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        // Atualiza tudo, incluindo a nova senha
        await pool.execute(
            'UPDATE users SET name = ?, email = ?, role = ?, status = ?, office_id = ?, password_hash = ? WHERE id = ?',
            [name, email, finalRole, finalStatus, finalOfficeId, hashedNewPassword, id]
        );
    } 
    // 4. Lógica NORMAL (Sem alteração de senha)
    else {
        await pool.execute(
            'UPDATE users SET name = ?, email = ?, role = ?, status = ?, office_id = ? WHERE id = ?',
            [name, email, finalRole, finalStatus, finalOfficeId, id]
        );
    }

    // 5. Retorna os dados atualizados (sem a senha) para o frontend atualizar a sessão
    const [updatedUsers] = await pool.execute(
        'SELECT id, name, email, role, status, is_in_debt, office_id FROM users WHERE id = ?', 
        [id]
    );

    res.json(updatedUsers[0]);

  } catch (error) {
    console.error('[updateUser Error]:', error);
    
    // Se o email já existir noutra conta, avisa o utilizador
    if (error.code === 'ER_DUP_ENTRY') {
         return res.status(400).json({ message: 'Este endereço de e-mail já está a ser utilizado.' });
    }
    
    res.status(500).json({ error: 'Erro ao atualizar utilizador.' });
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