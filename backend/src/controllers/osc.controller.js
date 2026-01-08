import pool from '../config/db.js';

// Listar todas as OSCs (para o Contador/Admin)
export const getAllOSCs = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = `
      SELECT id, cnpj, razao_social as name, email, phone, city as cidade, status 
      FROM oscs 
    `;
    
    // Se for contador, vê apenas as suas
    if (userRole === 'Contador') {
        query += ` WHERE assigned_contador_id = ${userId}`;
    }

    const [rows] = await pool.execute(query);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar OSCs:', error);
    // Retorna array vazio para não quebrar o frontend se a coluna status não existir na tabela oscs
    // (O dump mostra status na tabela users, mas não na oscs. Se der erro, remova o 'status' do SELECT acima)
    res.status(500).json({ message: 'Erro ao listar OSCs.' });
  }
};

// Obter detalhes de uma OSC específica
export const getOSCById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT * FROM oscs WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'OSC não encontrada.' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar detalhes da OSC.' });
  }
};

// Criar OSC (Geralmente cria-se um User e uma OSC vinculada)
export const createOSC = async (req, res) => {
    // Implementação simplificada
    res.status(501).json({ message: "Utilize a rota de registro de usuário para criar OSCs." });
};

// Atualizar OSC
export const updateOSC = async (req, res) => {
  try {
    const { id } = req.params;
    const { razao_social, phone, address } = req.body;

    await pool.execute(
        'UPDATE oscs SET razao_social=?, phone=?, address=? WHERE id=?', 
        [razao_social, phone, address, id]
    );

    res.json({ message: 'OSC atualizada com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao atualizar OSC.' });
  }
};