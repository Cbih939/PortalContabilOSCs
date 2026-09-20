import pool from '../config/db.js';
import * as UserModel from '../models/user.model.js';
import { hashPassword } from '../utils/bcrypt.utils.js';
import bcrypt from 'bcryptjs';
import { invalidateUserCache } from '../middlewares/auth.middleware.js';
import {
  ROLE, ASSIGNABLE_ROLES, LEGACY_FINANCEIRO,
  normalizeRole, isAdmin, isOfficeAdmin, officeIdOf,
} from '../utils/roles.js';

const PUBLIC_COLUMNS_FULL = 'id, name, email, role, status, is_in_debt, office_id, is_office_admin, onboarding_completed_at';
const PUBLIC_COLUMNS_LEGACY = 'id, name, email, role, status, is_in_debt, office_id';
const MIN_PASSWORD_LENGTH = 8;

/** SELECT tolerante a schema sem as colunas novas. */
const selectUsers = async (where = '', params = []) => {
  const run = (cols) => pool.execute(`SELECT ${cols} FROM users ${where}`, params);
  try {
    const [rows] = await run(PUBLIC_COLUMNS_FULL);
    return rows;
  } catch (error) {
    if (error.code !== 'ER_BAD_FIELD_ERROR') throw error;
    const [rows] = await run(PUBLIC_COLUMNS_LEGACY);
    return rows;
  }
};

const present = (u) => ({ ...u, role: normalizeRole(u.role), is_office_admin: Number(u.is_office_admin) || 0 });

/** O ator pode administrar o alvo? (ADMIN: qualquer; ADM Contador: contadores comuns do próprio escritório.) */
const canManageTarget = (actor, target) => {
  if (isAdmin(actor)) return true;
  if (!isOfficeAdmin(actor)) return false;
  return normalizeRole(target.role) === ROLE.CONTADOR
    && officeIdOf(target) === officeIdOf(actor)
    && !(Number(target.is_office_admin) === 1);
};

const parseRoleInput = (role) => {
  const normalized = normalizeRole(role);
  if (normalized === LEGACY_FINANCEIRO) {
    return { error: 'O perfil Financeiro foi descontinuado. Use Administrador ou ADM Contador.' };
  }
  if (!ASSIGNABLE_ROLES.includes(normalized)) return { error: 'Perfil inválido.' };
  return { role: normalized };
};

// BUSCAR POR ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await selectUsers('WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Utilizador não encontrado.' });

    const target = rows[0];
    const isSelf = Number(target.id) === Number(req.user.id);
    if (!isSelf && !canManageTarget(req.user, target)) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }
    res.status(200).json(present(target));
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar utilizador.' });
  }
};

// LISTAR (ADMIN: todos | ADM Contador: contadores do próprio escritório)
export const getAllUsers = async (req, res) => {
  try {
    let rows;
    if (isAdmin(req.user)) {
      rows = await selectUsers();
    } else if (isOfficeAdmin(req.user)) {
      rows = await selectUsers("WHERE office_id = ? AND UPPER(role) = 'CONTADOR'", [officeIdOf(req.user)]);
    } else {
      return res.status(403).json({ message: 'Acesso negado.' });
    }
    res.status(200).json(rows.map(present));
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
    if (String(password).length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ message: `A senha deve ter no mínimo ${MIN_PASSWORD_LENGTH} caracteres.` });
    }

    const parsed = parseRoleInput(role);
    if (parsed.error) return res.status(400).json({ message: parsed.error });

    let finalRole = parsed.role;
    let finalOffice = office_id || null;
    let officeAdminFlag = req.body.is_office_admin ? 1 : 0;

    if (isAdmin(req.user)) {
      if (finalRole === ROLE.ADMIN) { finalOffice = null; officeAdminFlag = 0; }
      if (finalRole === ROLE.OSC) officeAdminFlag = 0;
      if (finalRole === ROLE.CONTADOR && officeAdminFlag && !finalOffice) {
        return res.status(400).json({ message: 'O ADM do escritório precisa estar vinculado a um escritório.' });
      }
    } else if (isOfficeAdmin(req.user)) {
      // ADM Contador só cria contadores comuns dentro do próprio escritório.
      if (finalRole !== ROLE.CONTADOR) {
        return res.status(403).json({ message: 'Você só pode cadastrar contadores do seu escritório.' });
      }
      finalOffice = officeIdOf(req.user);
      officeAdminFlag = 0;
    } else {
      return res.status(403).json({ message: 'Acesso negado.' });
    }

    const existingUser = await UserModel.findUserByEmail(email);
    if (existingUser) return res.status(409).json({ message: 'Email já em uso.' });

    const passwordHash = await hashPassword(password);

    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password_hash, role, status, is_in_debt, office_id, is_office_admin) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, passwordHash, finalRole, 'Ativo', 0, finalOffice, officeAdminFlag]
    );

    const newUser = { id: result.insertId, name, email, role: finalRole, status: 'Ativo', office_id: finalOffice, is_office_admin: officeAdminFlag };
    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.error('[createUser Error]:', error);
    res.status(500).json({ message: 'Erro interno ao criar utilizador.' });
  }
};

// ATUALIZAR (perfil próprio, Admin e ADM Contador — cada um dentro do seu limite)
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, role, status, office_id, is_office_admin, currentPassword, newPassword } = req.body;

  try {
    const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    if (users.length === 0) return res.status(404).json({ message: 'Utilizador não encontrado.' });
    const user = users[0];

    const isSelf = Number(user.id) === Number(req.user.id);
    const actorIsAdmin = isAdmin(req.user);

    if (!isSelf && !canManageTarget(req.user, user)) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }

    // Campos administrativos: só Admin (qualquer alvo) ou ADM Contador (status dos seus contadores).
    const changesRole = role !== undefined && normalizeRole(role) !== normalizeRole(user.role);
    const changesOffice = office_id !== undefined && String(office_id ?? '') !== String(user.office_id ?? '');
    const changesFlag = is_office_admin !== undefined && (Number(!!is_office_admin) !== (Number(user.is_office_admin) || 0));
    const changesStatus = status !== undefined && status !== user.status;

    if ((changesRole || changesOffice || changesFlag) && !actorIsAdmin) {
      return res.status(403).json({ message: 'Somente o Administrador pode alterar perfil, escritório ou ADM.' });
    }
    if (changesStatus && isSelf) {
      return res.status(403).json({ message: 'Você não pode alterar o status da própria conta.' });
    }
    if (isSelf && actorIsAdmin && changesRole) {
      return res.status(400).json({ message: 'Você não pode alterar o próprio perfil de administrador.' });
    }

    let finalRole = user.role;
    if (role !== undefined && actorIsAdmin) {
      const parsed = parseRoleInput(role);
      if (parsed.error) return res.status(400).json({ message: parsed.error });
      finalRole = parsed.role;
    }
    const finalStatus = status !== undefined ? status : user.status;
    let finalOfficeId = (office_id !== undefined && actorIsAdmin) ? (office_id || null) : user.office_id;
    let finalFlag = (is_office_admin !== undefined && actorIsAdmin) ? (is_office_admin ? 1 : 0) : (Number(user.is_office_admin) || 0);

    if (normalizeRole(finalRole) === ROLE.ADMIN) { finalOfficeId = null; finalFlag = 0; }
    if (normalizeRole(finalRole) === ROLE.OSC) finalFlag = 0;
    if (finalFlag === 1 && !finalOfficeId) {
      return res.status(400).json({ message: 'O ADM do escritório precisa estar vinculado a um escritório.' });
    }

    const finalName = name !== undefined ? name : user.name;
    const finalEmail = email !== undefined ? email : user.email;

    let passwordHash = null;
    if (newPassword) {
      if (String(newPassword).length < MIN_PASSWORD_LENGTH) {
        return res.status(400).json({ message: `A senha deve ter no mínimo ${MIN_PASSWORD_LENGTH} caracteres.` });
      }
      if (isSelf) {
        if (!currentPassword) return res.status(400).json({ message: 'A senha atual é obrigatória para definir uma nova.' });
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) return res.status(400).json({ message: 'A senha atual está incorreta.' });
      }
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(newPassword, salt);
    }

    const sets = ['name = ?', 'email = ?', 'role = ?', 'status = ?', 'office_id = ?'];
    const params = [finalName, finalEmail, finalRole, finalStatus, finalOfficeId];
    if (Object.prototype.hasOwnProperty.call(user, 'is_office_admin')) { sets.push('is_office_admin = ?'); params.push(finalFlag); }
    if (passwordHash) { sets.push('password_hash = ?'); params.push(passwordHash); }
    params.push(id);

    await pool.execute(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, params);
    invalidateUserCache(id);

    const updated = await selectUsers('WHERE id = ?', [id]);
    res.json(present(updated[0]));
  } catch (error) {
    console.error('[updateUser Error]:', error);
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
    if (Number(id) === Number(req.user.id)) {
      return res.status(400).json({ message: 'Você não pode excluir a própria conta.' });
    }

    const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    if (users.length === 0) return res.status(404).json({ message: 'Utilizador não encontrado.' });
    if (!canManageTarget(req.user, users[0])) return res.status(403).json({ message: 'Acesso negado.' });

    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    invalidateUserCache(id);
    res.status(200).json({ message: 'Utilizador eliminado com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao eliminar utilizador.' });
  }
};
