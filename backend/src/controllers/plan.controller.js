import pool from '../config/db.js';

export const getPlans = async (req, res) => {
  try {
    const [plans] = await pool.execute('SELECT * FROM plans ORDER BY id DESC');
    res.json(plans);
  } catch (error) {
    console.error('Erro ao buscar planos:', error);
    res.status(500).json({ message: 'Erro ao buscar planos' });
  }
};

export const getActivePlan = async (req, res) => {
  try {
    const [plans] = await pool.execute('SELECT * FROM plans WHERE is_active = true LIMIT 1');
    res.json(plans[0] || null);
  } catch (error) {
    console.error('Erro ao buscar plano ativo:', error);
    res.status(500).json({ message: 'Erro ao buscar plano ativo' });
  }
};

export const createPlan = async (req, res) => {
  const { name, amount, interval_type, is_active } = req.body;
  try {
    if (is_active) {
      await pool.execute('UPDATE plans SET is_active = false');
    }
    const [result] = await pool.execute(
      'INSERT INTO plans (name, amount, interval_type, is_active) VALUES (?, ?, ?, ?)',
      [name, amount, interval_type || 'month', is_active || false]
    );
    res.status(201).json({ id: result.insertId, name, amount, interval_type, is_active });
  } catch (error) {
    console.error('Erro ao criar plano:', error);
    res.status(500).json({ message: 'Erro ao criar plano' });
  }
};

export const updatePlan = async (req, res) => {
  const { id } = req.params;
  const { name, amount, interval_type, is_active } = req.body;
  try {
    if (is_active) {
      await pool.execute('UPDATE plans SET is_active = false');
    }
    await pool.execute(
      'UPDATE plans SET name = ?, amount = ?, interval_type = ?, is_active = ? WHERE id = ?',
      [name, amount, interval_type, is_active, id]
    );
    res.json({ message: 'Plano atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar plano:', error);
    res.status(500).json({ message: 'Erro ao atualizar plano' });
  }
};

export const deletePlan = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.execute('DELETE FROM plans WHERE id = ?', [id]);
    res.json({ message: 'Plano excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir plano:', error);
    res.status(500).json({ message: 'Erro ao excluir plano' });
  }
};

export const activatePlan = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.execute('UPDATE plans SET is_active = false');
    await pool.execute('UPDATE plans SET is_active = true WHERE id = ?', [id]);
    res.json({ message: 'Plano ativado com sucesso' });
  } catch (error) {
    console.error('Erro ao ativar plano:', error);
    res.status(500).json({ message: 'Erro ao ativar plano' });
  }
};
