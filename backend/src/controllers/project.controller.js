// backend/src/controllers/project.controller.js
import pool from '../config/db.js';

// Busca o ID interno da OSC do utilizador logado
const getInternalOscId = async (userId) => {
  const [rows] = await pool.execute('SELECT id FROM oscs WHERE user_id = ?', [userId]);
  return rows.length > 0 ? rows[0].id : null;
};

// Listar todos os projetos da OSC logada
export const getMyProjects = async (req, res) => {
  try {
    const oscId = await getInternalOscId(req.user.id);
    if (!oscId) return res.status(404).json({ message: 'OSC não encontrada.' });

    const [projects] = await pool.execute(
      'SELECT * FROM projects WHERE osc_id = ? ORDER BY status ASC, created_at DESC', 
      [oscId]
    );
    return res.status(200).json(projects);
  } catch (error) {
    console.error('[getProjects]', error);
    return res.status(500).json({ message: 'Erro ao buscar projetos.' });
  }
};

// Criar um novo projeto
export const createProject = async (req, res) => {
  try {
    const oscId = await getInternalOscId(req.user.id);
    if (!oscId) return res.status(404).json({ message: 'OSC não encontrada.' });

    const { name, description, start_date, end_date, status } = req.body;
    if (!name) return res.status(400).json({ message: 'O nome do projeto é obrigatório.' });

    const [result] = await pool.execute(
      'INSERT INTO projects (osc_id, name, description, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?)',
      [oscId, name, description || null, start_date || null, end_date || null, status || 'ATIVO']
    );

    return res.status(201).json({ success: true, message: 'Projeto criado com sucesso!', id: result.insertId });
  } catch (error) {
    console.error('[createProject]', error);
    return res.status(500).json({ message: 'Erro ao criar projeto.' });
  }
};

// Atualizar um projeto
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, start_date, end_date, status } = req.body;

    await pool.execute(
      'UPDATE projects SET name = ?, description = ?, start_date = ?, end_date = ?, status = ? WHERE id = ?',
      [name, description || null, start_date || null, end_date || null, status, id]
    );

    return res.status(200).json({ success: true, message: 'Projeto atualizado com sucesso!' });
  } catch (error) {
    console.error('[updateProject]', error);
    return res.status(500).json({ message: 'Erro ao atualizar projeto.' });
  }
};

// Excluir um projeto
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM projects WHERE id = ?', [id]);
    return res.status(200).json({ success: true, message: 'Projeto excluído com sucesso!' });
  } catch (error) {
    console.error('[deleteProject]', error);
    return res.status(500).json({ message: 'Erro ao excluir projeto.' });
  }
};