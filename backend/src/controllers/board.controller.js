// backend/src/controllers/board.controller.js
import pool from '../config/db.js';

// Função auxiliar para descobrir a OSC do utilizador logado
const getInternalOscId = async (userId) => {
  const [rows] = await pool.execute('SELECT id FROM oscs WHERE user_id = ?', [userId]);
  return rows.length > 0 ? rows[0].id : null;
};

// 1. Listar membros da diretoria
export const getBoardMembers = async (req, res) => {
  try {
    const oscId = await getInternalOscId(req.user.id);
    if (!oscId) return res.status(404).json({ message: 'OSC não encontrada.' });

    const [members] = await pool.execute(
      'SELECT * FROM board_members WHERE osc_id = ? ORDER BY status ASC, role ASC', 
      [oscId]
    );
    return res.status(200).json(members);
  } catch (error) {
    console.error('[getBoardMembers]', error);
    return res.status(500).json({ message: 'Erro ao buscar membros da diretoria.' });
  }
};

// 2. Adicionar novo membro
export const createBoardMember = async (req, res) => {
  try {
    const oscId = await getInternalOscId(req.user.id);
    if (!oscId) return res.status(404).json({ message: 'OSC não encontrada.' });

    const { name, role, cpf, start_date, end_date, status } = req.body;
    if (!name || !role) return res.status(400).json({ message: 'Nome e Cargo são obrigatórios.' });

    const [result] = await pool.execute(
      'INSERT INTO board_members (osc_id, name, role, cpf, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [oscId, name, role, cpf || null, start_date || null, end_date || null, status || 'ATIVO']
    );

    return res.status(201).json({ success: true, message: 'Membro adicionado com sucesso!', id: result.insertId });
  } catch (error) {
    console.error('[createBoardMember]', error);
    return res.status(500).json({ message: 'Erro ao adicionar membro.' });
  }
};

// 3. Atualizar membro
export const updateBoardMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, cpf, start_date, end_date, status } = req.body;

    await pool.execute(
      'UPDATE board_members SET name = ?, role = ?, cpf = ?, start_date = ?, end_date = ?, status = ? WHERE id = ?',
      [name, role, cpf || null, start_date || null, end_date || null, status, id]
    );

    return res.status(200).json({ success: true, message: 'Membro atualizado com sucesso!' });
  } catch (error) {
    console.error('[updateBoardMember]', error);
    return res.status(500).json({ message: 'Erro ao atualizar membro.' });
  }
};

// 4. Remover membro
export const deleteBoardMember = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM board_members WHERE id = ?', [id]);
    return res.status(200).json({ success: true, message: 'Membro removido com sucesso!' });
  } catch (error) {
    console.error('[deleteBoardMember]', error);
    return res.status(500).json({ message: 'Erro ao remover membro.' });
  }
};