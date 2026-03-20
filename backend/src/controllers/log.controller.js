import pool from '../config/db.js';

export const getSystemLogs = async (req, res) => {
  try {
    const { startDate, endDate, userId, oscId, module, action } = req.query;
    
    let query = `
      SELECT l.*, o.name as osc_name, o.razao_social 
      FROM system_logs l
      LEFT JOIN oscs o ON l.osc_id = o.id
      WHERE 1=1
    `;
    const params = [];

    // --- APLICANDO OS FILTROS INTELIGENTES ---
    if (startDate) {
      query += ' AND DATE(l.created_at) >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND DATE(l.created_at) <= ?';
      params.push(endDate);
    }
    if (userId) {
      query += ' AND l.user_id = ?';
      params.push(userId);
    }
    if (oscId) {
      query += ' AND l.osc_id = ?';
      params.push(oscId);
    }
    if (module) {
      query += ' AND l.module = ?';
      params.push(module);
    }
    if (action) {
      query += ' AND l.action = ?';
      params.push(action);
    }

    query += ' ORDER BY l.created_at DESC LIMIT 500'; // Limite de segurança

    const [logs] = await pool.execute(query, params);
    
    res.status(200).json(logs);
  } catch (error) {
    console.error('[getSystemLogs Error]:', error);
    res.status(500).json({ message: 'Erro ao buscar relatórios e logs do sistema.' });
  }
};