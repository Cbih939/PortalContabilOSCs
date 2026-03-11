import pool from '../config/db.js';

/**
 * --- BUSCAR MINHAS OSCS (LÓGICA DE GRUPO/ESCRITÓRIO E PENDÊNCIAS) ---
 */
export const getMyOSCs = async (req, res) => {
  try {
    const userId = req.user.id;
    const officeId = (req.user.office_id && req.user.office_id !== "0") ? req.user.office_id : null;
    const userRole = req.user.role.toLowerCase();

    let query = `
      SELECT id, cnpj, razao_social, responsible, email, phone, address, 
             user_id, assigned_contador_id, office_id, 
             data_origem_estatuto, data_contrato_conta_comigo, tipo_plano
      FROM oscs
    `;
    let params = [];

    if (userRole === 'contador') {
      if (officeId) {
        query += ' WHERE office_id = ?';
        params.push(officeId);
      } else {
        query += ' WHERE assigned_contador_id = ?';
        params.push(userId);
      }
    } else if (userRole === 'osc') {
      query += ' WHERE user_id = ?';
      params.push(userId);
    }

    const [oscs] = await pool.execute(query, params);

    const oscsWithDocs = await Promise.all(oscs.map(async (osc) => {
      try {
        const [docs] = await pool.execute(
          `SELECT id, original_name, saved_filename, file_path, doc_type, status, ref_month, ref_year, 
           COALESCE(created_at, NOW()) as created_at 
           FROM documents WHERE osc_id = ?`,
          [osc.id]
        );
        
        return { 
          ...osc, 
          name: osc.razao_social, 
          status: 'Ativo',
          documents: docs || [] 
        };
      } catch (docError) {
        return { ...osc, name: osc.razao_social, status: 'Ativo', documents: [] };
      }
    }));

    res.json(oscsWithDocs);
  } catch (error) {
    console.error('[OSC Controller] Erro em getMyOSCs:', error);
    res.status(500).json({ message: "Erro ao carregar lista de organizações." });
  }
};

/**
 * --- CRIAR NOVA OSC ---
 */
export const createOSC = async (req, res) => {
  try {
    const { 
      name, cnpj, responsible, email, phone, address,
      data_origem_estatuto, data_contrato_conta_comigo, tipo_plano 
    } = req.body;

    // Pega o ID do usuário logado
    const contadorId = (req.user && req.user.role.toUpperCase() === 'CONTADOR') ? req.user.id : null;
    const officeId = (req.user && req.user.office_id && req.user.office_id !== "0") ? req.user.office_id : null;

    const query = `
      INSERT INTO oscs 
      (razao_social, cnpj, responsible, email, phone, address, 
       assigned_contador_id, office_id, 
       data_origem_estatuto, data_contrato_conta_comigo, tipo_plano) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(query, [
      name, cnpj, responsible, email, phone, address, 
      contadorId, officeId,
      data_origem_estatuto || null, 
      data_contrato_conta_comigo || null, // <--- O erro de digitação estava aqui!
      tipo_plano || 'PRATA'
    ]);

    return res.status(201).json({ 
      success: true, 
      message: 'OSC criada com sucesso!', 
      id: result.insertId 
    });

  } catch (error) {
    console.error('[createOSC Error]:', error);
    if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'CNPJ já cadastrado.' });
    return res.status(500).json({ message: 'Erro interno ao criar OSC.' });
  }
};

/**
 * --- ATUALIZAR OSC ---
 */
export const updateOSC = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      razao_social, name, cnpj, responsible, phone, email, address,
      data_origem_estatuto, data_contrato_conta_comigo, tipo_plano 
    } = req.body;

    const finalName = razao_social || name;

    await pool.execute(
      `UPDATE oscs SET 
        razao_social = ?, cnpj = ?, responsible = ?, phone = ?, email = ?, address = ?, 
        data_origem_estatuto = ?, data_contrato_conta_comigo = ?, tipo_plano = ?
       WHERE id = ?`,
      [finalName, cnpj, responsible, phone, email, address, 
       data_origem_estatuto || null, data_contrato_conta_comigo || null, tipo_plano || 'PRATA', id]
    );

    res.json({ message: "Dados atualizados com sucesso!" });
  } catch (error) {
    console.error("[updateOSC Error]:", error);
    res.status(500).json({ message: "Erro ao atualizar os dados." });
  }
};

export const getOSCById = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT *, "Ativo" as status FROM oscs WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Não encontrado" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar OSC" });
  }
};

export const getAllOSCs = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT o.id, o.razao_social, o.cnpj, o.data_contrato_conta_comigo, u.name as contadorName
      FROM oscs o
      LEFT JOIN users u ON o.assigned_contador_id = u.id
    `);
    res.json(rows.map(r => ({ ...r, name: r.razao_social, status: 'Ativo' })));
  } catch (error) {
    res.status(500).json({ message: 'Erro interno ao listar OSCs.' });
  }
};

// Funções de pagamento (Mantidas conforme o original)
export const getMyPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const [oscRows] = await pool.execute('SELECT id FROM oscs WHERE user_id = ?', [userId]);
    if (oscRows.length === 0) return res.status(404).json({ message: 'OSC não encontrada.' });
    const [payments] = await pool.execute(`SELECT * FROM subscriptions WHERE osc_id = ?`, [oscRows[0].id]);
    res.json(payments);
  } catch (error) { res.status(500).json({ message: 'Erro nos pagamentos.' }); }
};

export const assignContador = async (req, res) => {
  try {
    const { id } = req.params;
    const { contadorId, officeId } = req.body;
    await pool.execute('UPDATE oscs SET assigned_contador_id = ?, office_id = ? WHERE id = ?', 
      [contadorId || null, officeId || null, id]);
    res.json({ message: 'Associação atualizada' });
  } catch (error) { res.status(500).json({ message: 'Erro ao associar.' }); }
};