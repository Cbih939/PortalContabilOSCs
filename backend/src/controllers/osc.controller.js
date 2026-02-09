import pool from '../config/db.js';

// --- BUSCAR PAGAMENTOS DA OSC (NOVA FUNÇÃO) ---
export const getMyPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Primeiro buscamos o ID da OSC vinculada a este usuário
    const [oscRows] = await pool.execute('SELECT id FROM oscs WHERE user_id = ?', [userId]);
    
    if (oscRows.length === 0) {
      return res.status(404).json({ message: 'OSC não encontrada para este usuário.' });
    }

    const oscId = oscRows[0].id;

    // Buscamos os pagamentos na tabela de assinaturas/transações (ajuste o nome da tabela se for diferente)
    // Assumindo que você tem uma tabela 'subscriptions' ou 'payments'
    const [payments] = await pool.execute(
      `SELECT id, amount, status, stripe_status, created_at, period_start, period_end 
       FROM subscriptions 
       WHERE osc_id = ? 
       ORDER BY created_at DESC`,
      [oscId]
    );

    res.json(payments);
  } catch (error) {
    console.error('[OSC Controller] Erro em getMyPayments:', error);
    res.status(500).json({ message: 'Erro ao carregar histórico de pagamentos.' });
  }
};

// --- ASSOCIAR CONTADOR ---
export const assignContador = async (req, res) => {
    try {
        const { id } = req.params;
        const { contadorId } = req.body;
        await pool.execute(
            'UPDATE oscs SET assigned_contador_id = ? WHERE id = ?',
            [contadorId === "null" || !contadorId ? null : contadorId, id]
        );
        const [updated] = await pool.execute('SELECT id, razao_social as name FROM oscs WHERE id = ?', [id]);
        return res.json({ message: 'Sucesso', osc: updated[0] });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao associar.' });
    }
};

// --- BUSCAR MINHAS OSCS (USADO PELO CONTADOR E PELA OSC) ---
export const getMyOSCs = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = `
      SELECT id, cnpj, razao_social, responsible, email, phone, address, user_id, assigned_contador_id
      FROM oscs
    `;
    let params = [];

    if (userRole === 'Contador') {
      query += ' WHERE assigned_contador_id = ?';
      params.push(userId);
    } else if (userRole === 'OSC') {
      query += ' WHERE user_id = ?';
      params.push(userId);
    }

    const [oscs] = await pool.execute(query, params);

    const oscsWithDocs = await Promise.all(oscs.map(async (osc) => {
      try {
        const [docs] = await pool.execute(
          `SELECT id, original_name, saved_filename, file_path, doc_type, status, ref_month, ref_year, created_at 
           FROM documents 
           WHERE osc_id = ?`,
          [osc.id]
        );
        return { 
          ...osc, 
          name: osc.razao_social, 
          documents: docs || [] 
        };
      } catch (docError) {
        return { ...osc, name: osc.razao_social, documents: [] };
      }
    }));

    res.json(oscsWithDocs);
  } catch (error) {
    console.error('[OSC Controller] Erro em getMyOSCs:', error);
    res.status(500).json({ message: "Erro ao carregar lista de organizações." });
  }
};

// --- ATUALIZAR OSC ---
export const updateOSC = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      razao_social, name, 
      cnpj, 
      responsible, responsavel, 
      phone, telefone, 
      email, address 
    } = req.body;

    const finalName = razao_social || name;
    const finalResponsible = responsible || responsavel;
    const finalPhone = phone || telefone;

    const [result] = await pool.execute(
      `UPDATE oscs 
       SET razao_social = ?, cnpj = ?, responsible = ?, phone = ?, email = ?, address = ?
       WHERE id = ?`,
      [finalName, cnpj, finalResponsible, finalPhone, email, address, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "OSC não encontrada." });
    }

    res.json({ message: "Dados atualizados com sucesso!" });
  } catch (error) {
    console.error("[OSC Controller] Erro em updateOSC:", error);
    res.status(500).json({ message: "Erro ao atualizar os dados." });
  }
};

// --- BUSCAR POR ID ---
export const getOSCById = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM oscs WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Não encontrado" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar OSC" });
  }
};

// --- LISTAR TODAS (ADMIN) ---
export const getAllOSCs = async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT o.id, o.razao_social, o.cnpj, u.name as contadorName
            FROM oscs o
            LEFT JOIN users u ON o.assigned_contador_id = u.id
        `);
        res.json(rows.map(r => ({ ...r, name: r.razao_social, status: 'Ativo' })));
    } catch (error) {
        res.status(500).json({ message: 'Erro interno' });
    }
};