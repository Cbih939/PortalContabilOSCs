import pool from '../config/db.js';

// LISTAR TODOS OS ESCRITÓRIOS
export const getAllOffices = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, name FROM offices ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    console.error('[Office Controller] Erro ao listar:', error);
    res.status(500).json({ message: 'Erro ao buscar escritórios.' });
  }
};

// CRIAR NOVO ESCRITÓRIO
export const createOffice = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Nome do escritório é obrigatório.' });

    const [result] = await pool.execute('INSERT INTO offices (name) VALUES (?)', [name]);
    res.status(201).json({ id: result.insertId, name });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar escritório.' });
  }
};