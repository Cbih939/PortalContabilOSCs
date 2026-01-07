import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

// 1. Listar TODAS as OSCs (Para o Admin)
export const getAllOSCs = async (req, res) => {
  try {
    // LEFT JOIN garante que a OSC aparece mesmo sem nome de usuário
    const query = `
      SELECT 
        o.id, 
        o.cnpj, 
        o.assigned_contador_id,
        COALESCE(u.name, 'Sem Nome') as name, 
        u.email,
        u.status
      FROM oscs o
      LEFT JOIN users u ON o.user_id = u.id
    `;
    const [rows] = await pool.execute(query);
    res.json(rows);
  } catch (error) {
    console.error('Erro getAllOSCs:', error);
    res.status(500).json({ message: 'Erro ao listar OSCs.' });
  }
};

// 2. Buscar OSC por ID
export const getOSCById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT * FROM oscs WHERE id = ?', [id]);
    
    if (rows.length === 0) return res.status(404).json({ message: 'OSC não encontrada' });
    
    // Busca dados do usuário associado também
    const [userRows] = await pool.execute('SELECT name, email, phone FROM users WHERE id = ?', [rows[0].user_id]);
    const oscData = { ...rows[0], ...userRows[0] };

    res.json(oscData);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar OSC' });
  }
};

// 3. Atualizar OSC
export const updateOSC = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, cnpj, assigned_contador_id } = req.body;

    // Atualiza tabela users (Nome e Email) se fornecidos
    if (name || email) {
        const [osc] = await pool.execute('SELECT user_id FROM oscs WHERE id = ?', [id]);
        if (osc.length > 0) {
            await pool.execute('UPDATE users SET name = ?, email = ? WHERE id = ?', 
                [name, email, osc[0].user_id]);
        }
    }

    // Atualiza tabela oscs
    await pool.execute(
      'UPDATE oscs SET cnpj = ?, assigned_contador_id = ? WHERE id = ?',
      [cnpj, assigned_contador_id, id]
    );

    res.json({ message: 'OSC atualizada com sucesso.' });
  } catch (error) {
    console.error('Erro updateOSC:', error);
    res.status(500).json({ message: 'Erro ao atualizar OSC.' });
  }
};

// 4. Criar OSC
export const createOSC = async (req, res) => {
    try {
        const { name, email, password, cnpj } = req.body;
        
        // Hash senha
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Cria User
        const [userResult] = await pool.execute(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, 'OSC']
        );
        
        // Cria OSC
        await pool.execute(
            'INSERT INTO oscs (user_id, cnpj) VALUES (?, ?)',
            [userResult.insertId, cnpj]
        );

        res.status(201).json({ message: 'OSC criada com sucesso.' });
    } catch (error) {
        console.error('Erro createOSC:', error);
        res.status(500).json({ message: 'Erro ao criar OSC.' });
    }
};

// 5. Deletar OSC
export const deleteOSC = async (req, res) => {
  try {
    const { id } = req.params;
    const [osc] = await pool.execute('SELECT user_id FROM oscs WHERE id = ?', [id]);
    
    if (osc.length > 0) {
        await pool.execute('DELETE FROM users WHERE id = ?', [osc[0].user_id]);
    } else {
        await pool.execute('DELETE FROM oscs WHERE id = ?', [id]);
    }
    res.json({ message: 'OSC removida.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao remover OSC.' });
  }
};

// 6. Associar Contador
export const assignContador = async (req, res) => {
    try {
        const { id } = req.params;
        const { contadorId } = req.body;
        await pool.execute('UPDATE oscs SET assigned_contador_id = ? WHERE id = ?', [contadorId, id]);
        res.json({ message: 'Contador associado.' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao associar.' });
    }
};

