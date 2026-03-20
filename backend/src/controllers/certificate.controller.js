import pool from '../config/db.js';

export const getLinks = async (req, res) => {
  try {
    const { type, state, city } = req.query;
    let query = 'SELECT * FROM certificate_links WHERE 1=1';
    const params = [];

    if (type) { query += ' AND type = ?'; params.push(type); }
    if (state) { query += ' AND state = ?'; params.push(state); }
    if (city) { query += ' AND city = ?'; params.push(city); }

    query += ' ORDER BY type, state, city, title';
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar links das certificadoras.' });
  }
};

export const createLink = async (req, res) => {
  try {
    const { type, state, city, title, url } = req.body;
    await pool.execute(
      'INSERT INTO certificate_links (type, state, city, title, url) VALUES (?, ?, ?, ?, ?)',
      [type, state || null, city || null, title, url]
    );
    res.status(201).json({ message: 'Link adicionado com sucesso!' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao adicionar link.' });
  }
};

export const deleteLink = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM certificate_links WHERE id = ?', [id]);
    res.json({ message: 'Link removido com sucesso!' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao remover link.' });
  }
};