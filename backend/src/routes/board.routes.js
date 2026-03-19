import express from 'express';
import pool from '../config/db.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// 1. Buscar membros da OSC do utilizador logado
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Primeiro, descobre qual é a OSC deste utilizador
    const [oscs] = await pool.execute('SELECT id FROM oscs WHERE user_id = ? LIMIT 1', [userId]);
    if (oscs.length === 0) return res.json([]);

    const oscId = oscs[0].id;
    
    // Busca os membros da diretoria dessa OSC
    const [members] = await pool.execute('SELECT * FROM board_members WHERE osc_id = ? ORDER BY id DESC', [oscId]);
    res.json(members);

  } catch (error) {
    console.error('Erro ao buscar diretoria:', error);
    res.status(500).json({ message: 'Erro ao buscar diretoria.' });
  }
});

// 2. Criar novo membro
router.post('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, role, cpf, start_date, end_date, status } = req.body;

    const [oscs] = await pool.execute('SELECT id FROM oscs WHERE user_id = ? LIMIT 1', [userId]);
    if (oscs.length === 0) return res.status(404).json({ message: 'OSC não encontrada.' });
    const oscId = oscs[0].id;

    await pool.execute(
      'INSERT INTO board_members (osc_id, name, role, cpf, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [oscId, name, role, cpf || null, start_date || null, end_date || null, status]
    );

    res.status(201).json({ message: 'Membro adicionado!' });
  } catch (error) {
    console.error('Erro ao criar membro:', error);
    res.status(500).json({ message: 'Erro ao adicionar membro.' });
  }
});

// 3. Atualizar membro
router.put('/:id', protect, async (req, res) => {
  try {
    const memberId = req.params.id;
    const { name, role, cpf, start_date, end_date, status } = req.body;

    await pool.execute(
      'UPDATE board_members SET name = ?, role = ?, cpf = ?, start_date = ?, end_date = ?, status = ? WHERE id = ?',
      [name, role, cpf || null, start_date || null, end_date || null, status, memberId]
    );

    res.json({ message: 'Membro atualizado!' });
  } catch (error) {
    console.error('Erro ao atualizar membro:', error);
    res.status(500).json({ message: 'Erro ao atualizar membro.' });
  }
});

// 4. Deletar membro
router.delete('/:id', protect, async (req, res) => {
  try {
    const memberId = req.params.id;
    await pool.execute('DELETE FROM board_members WHERE id = ?', [memberId]);
    res.json({ message: 'Membro removido!' });
  } catch (error) {
    console.error('Erro ao remover membro:', error);
    res.status(500).json({ message: 'Erro ao remover membro.' });
  }
});

export default router;