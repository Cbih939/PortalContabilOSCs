import express from 'express';
import pool from '../config/db.js';
import { protect } from '../middlewares/auth.middleware.js';
import { logAction } from '../services/logger.service.js'; // 🕵️‍♂️ O NOSSO ESPIÃO AQUI!

const router = express.Router();

// 1. Buscar membros
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const [oscs] = await pool.execute('SELECT id FROM oscs WHERE user_id = ? LIMIT 1', [userId]);
    if (oscs.length === 0) return res.json([]);

    const oscId = oscs[0].id;
    const [members] = await pool.execute('SELECT * FROM board_members WHERE osc_id = ? ORDER BY id DESC', [oscId]);
    res.json(members);
  } catch (error) {
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

    // 🔴 GRAVA NO RELATÓRIO
    await logAction(req.user.id, req.user.name, oscId, 'CRIOU', 'DIRETORIA', `Adicionou o membro ${name} (${role}) à diretoria.`);

    res.status(201).json({ message: 'Membro adicionado!' });
  } catch (error) {
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

    // 🔴 GRAVA NO RELATÓRIO
    const [oscs] = await pool.execute('SELECT id FROM oscs WHERE user_id = ? LIMIT 1', [req.user.id]);
    const oscId = oscs.length > 0 ? oscs[0].id : null;
    await logAction(req.user.id, req.user.name, oscId, 'EDITOU', 'DIRETORIA', `Atualizou os dados do membro ${name} (${role}).`);

    res.json({ message: 'Membro atualizado!' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar membro.' });
  }
});

// 4. Deletar membro
router.delete('/:id', protect, async (req, res) => {
  try {
    const memberId = req.params.id;
    
    // Busca o nome do membro antes de apagar para colocar no log
    const [member] = await pool.execute('SELECT name FROM board_members WHERE id = ?', [memberId]);
    const memberName = member.length > 0 ? member[0].name : 'Desconhecido';

    await pool.execute('DELETE FROM board_members WHERE id = ?', [memberId]);

    // 🔴 GRAVA NO RELATÓRIO
    const [oscs] = await pool.execute('SELECT id FROM oscs WHERE user_id = ? LIMIT 1', [req.user.id]);
    const oscId = oscs.length > 0 ? oscs[0].id : null;
    await logAction(req.user.id, req.user.name, oscId, 'EXCLUIU', 'DIRETORIA', `Removeu o membro ${memberName} da diretoria.`);

    res.json({ message: 'Membro removido!' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao remover membro.' });
  }
});

export default router;