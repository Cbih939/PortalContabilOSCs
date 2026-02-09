import pool from '../config/db.js';

/**
 * --- BUSCAR PAGAMENTOS DA OSC ---
 * Resolve o erro 404 da rota de pagamentos.
 */
export const getMyPayments = async (req, res) => {
  try {
    const oscId = req.user.osc_id;

    const [rows] = await pool.query(
      `
      SELECT 
        id,
        amount,
        status,
        payment_date,
        competence
      FROM payments
      WHERE osc_id = ?
      ORDER BY payment_date DESC
      `,
      [oscId]
    );

    return res.json(rows);
  } catch (error) {
    console.error('[OSC Controller] Erro em getMyPayments:', error);
    return res.status(500).json({
      message: 'Erro ao buscar pagamentos da OSC'
    });
  }
};



/**
 * --- ASSOCIAR CONTADOR ---
 */
export const assignContador = async (req, res) => {
  try {
    const { id } = req.params;
    const { contadorId } = req.body;
    
    await pool.execute(
      'UPDATE oscs SET assigned_contador_id = ? WHERE id = ?',
      [contadorId === "null" || !contadorId ? null : contadorId, id]
    );
    
    const [updated] = await pool.execute(
      'SELECT id, razao_social as name FROM oscs WHERE id = ?', 
      [id]
    );
    
    return res.json({ message: 'Associação atualizada com sucesso', osc: updated[0] });
  } catch (error) {
    console.error('[OSC Controller] Erro em assignContador:', error);
    return res.status(500).json({ message: 'Erro ao associar contador.' });
  }
};

/**
 * --- BUSCAR MINHAS OSCS (COM DOCUMENTOS) ---
 * CORREÇÃO: Garante que saved_filename e file_path existam para evitar 404.
 */
export const getMyOSCs = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role.toLowerCase();

    let query = `
      SELECT id, cnpj, razao_social, responsible, email, phone, address, user_id, assigned_contador_id
      FROM oscs
    `;
    let params = [];

    if (userRole === 'contador') {
      query += ' WHERE assigned_contador_id = ?';
      params.push(userId);
    } else if (userRole === 'osc') {
      query += ' WHERE user_id = ?';
      params.push(userId);
    }

    const [oscs] = await pool.execute(query, params);

    // Enriquecer cada OSC com os seus documentos
    const oscsWithDocs = await Promise.all(oscs.map(async (osc) => {
      try {
        const [docs] = await pool.execute(
          `SELECT 
            id, 
            original_name, 
            saved_filename, 
            file_path, 
            doc_type, 
            status, 
            ref_month, 
            ref_year, 
            COALESCE(created_at, NOW()) as created_at 
           FROM documents 
           WHERE osc_id = ?`,
          [osc.id]
        );
        
        return { 
          ...osc, 
          name: osc.razao_social, // Compatibilidade com frontend
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

/**
 * --- ATUALIZAR OSC ---
 */
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

/**
 * --- BUSCAR POR ID ---
 */
export const getOSCById = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM oscs WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Não encontrado" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar OSC" });
  }
};

/**
 * --- LISTAR TODAS (ADMIN) ---
 */
export const getAllOSCs = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT o.id, o.razao_social, o.cnpj, u.name as contadorName
      FROM oscs o
      LEFT JOIN users u ON o.assigned_contador_id = u.id
    `);
    res.json(rows.map(r => ({ ...r, name: r.razao_social, status: 'Ativo' })));
  } catch (error) {
    console.error('[OSC Controller] Erro em getAllOSCs:', error);
    res.status(500).json({ message: 'Erro interno ao listar OSCs.' });
  }
};