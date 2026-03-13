// backend/src/controllers/office.controller.js
import pool from '../config/db.js';

// Lista todos os escritórios
export const getOffices = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM offices ORDER BY name ASC');
    return res.status(200).json(rows);
  } catch (error) {
    console.error('[getOffices Error]:', error);
    return res.status(500).json({ message: 'Erro ao buscar escritórios.' });
  }
};

// Cria um novo escritório
export const createOffice = async (req, res) => {
  try {
    const { name, document, email, phone } = req.body;

    if (!name) return res.status(400).json({ message: 'O nome do escritório é obrigatório.' });

    const [result] = await pool.execute(
      'INSERT INTO offices (name, document, email, phone) VALUES (?, ?, ?, ?)',
      [name, document || null, email || null, phone || null]
    );

    return res.status(201).json({ success: true, message: 'Escritório criado com sucesso!' });
  } catch (error) {
    console.error('[createOffice Error]:', error);
    return res.status(500).json({ message: 'Erro ao criar escritório.' });
  }
};

// Atualiza um escritório existente
export const updateOffice = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, document, email, phone } = req.body;

    if (!name) return res.status(400).json({ message: 'O nome do escritório é obrigatório.' });

    await pool.execute(
      'UPDATE offices SET name = ?, document = ?, email = ?, phone = ? WHERE id = ?',
      [name, document || null, email || null, phone || null, id]
    );

    return res.status(200).json({ success: true, message: 'Escritório atualizado com sucesso!' });
  } catch (error) {
    console.error('[updateOffice Error]:', error);
    return res.status(500).json({ message: 'Erro ao atualizar escritório.' });
  }
};

// Exclui um escritório
export const deleteOffice = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute('DELETE FROM offices WHERE id = ?', [id]);
    
    return res.status(200).json({ success: true, message: 'Escritório excluído com sucesso!' });
  } catch (error) {
    console.error('[deleteOffice Error]:', error);
    
    // Trava de segurança: Se o escritório tiver usuários vinculados, o MySQL bloqueia e dá este erro específico
    if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
       return res.status(400).json({ 
           message: 'Não é possível excluir este escritório pois já existem contadores vinculados a ele. Remova os usuários primeiro.' 
       });
    }
    
    return res.status(500).json({ message: 'Erro ao excluir escritório.' });
  }
};