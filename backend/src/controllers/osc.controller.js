import pool from '../config/db.js';

/**
 * --- BUSCAR PAGAMENTOS DA OSC ---
 */
export const getMyPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const [oscRows] = await pool.execute('SELECT id FROM oscs WHERE user_id = ?', [userId]);
    
    if (oscRows.length === 0) {
      return res.status(404).json({ message: 'OSC não encontrada.' });
    }

    const osc_id = oscRows[0].id;

    try {
      const [payments] = await pool.execute(
        `SELECT * FROM subscriptions WHERE osc_id = ? ORDER BY created_at DESC`,
        [osc_id]
      );
      res.json(payments);
    } catch (dbError) {
      console.error('Tabela subscriptions não encontrada no DB.');
      res.json([]); 
    }
  } catch (error) {
    console.error('[OSC Controller] Erro grave:', error);
    res.status(500).json({ message: 'Erro interno ao processar pagamentos.' });
  }
};

/**
 * --- ASSOCIAR CONTADOR OU ESCRITÓRIO ---
 */
export const assignContador = async (req, res) => {
  try {
    const { id } = req.params;
    const { contadorId, officeId } = req.body;
    
    await pool.execute(
      'UPDATE oscs SET assigned_contador_id = ?, office_id = ? WHERE id = ?',
      [
        contadorId === "null" || !contadorId ? null : contadorId, 
        officeId === "null" || !officeId ? null : officeId,
        id
      ]
    );
    
    const [updated] = await pool.execute(
      'SELECT id, razao_social as name FROM oscs WHERE id = ?', 
      [id]
    );
    
    return res.json({ message: 'Associação atualizada com sucesso', osc: updated[0] });
  } catch (error) {
    console.error('[OSC Controller] Erro em assignContador:', error);
    return res.status(500).json({ message: 'Erro ao associar contador/escritório.' });
  }
};

/**
 * --- BUSCAR MINHAS OSCS (LÓGICA DE GRUPO/ESCRITÓRIO) ---
 */
export const getMyOSCs = async (req, res) => {
  try {
    const userId = req.user.id;
    // Proteção: Se office_id vier como "0" (string), forçamos para null
    const officeId = (req.user.office_id && req.user.office_id !== "0") ? req.user.office_id : null; 
    const userRole = req.user.role.toLowerCase();

    let query = `
      SELECT id, cnpj, razao_social, responsible, email, phone, address, user_id, assigned_contador_id, office_id
      FROM oscs
    `;
    let params = [];

    if (userRole === 'contador') {
      // Se o contador pertence a um escritório real, vê todos os clientes do escritório
      if (officeId) {
        query += ' WHERE office_id = ?';
        params.push(officeId);
      } else {
        // Se for contador independente, vê as OSCs vinculadas ao seu ID
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
    const { razao_social, name, cnpj, responsible, phone, email, address, office_id } = req.body;

    const finalName = razao_social || name;

    await pool.execute(
      `UPDATE oscs SET razao_social = ?, cnpj = ?, responsible = ?, phone = ?, email = ?, address = ?, office_id = ?
       WHERE id = ?`,
      [finalName, cnpj, responsible, phone, email, address, office_id || null, id]
    );

    res.json({ message: "Dados atualizados com sucesso!" });
  } catch (error) {
    console.error("[OSC Controller] Erro em updateOSC:", error);
    res.status(500).json({ message: "Erro ao atualizar os dados." });
  }
};

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
 * --- BUSCAR TODAS AS OSCS (ADMIN) ---
 */
export const getAllOSCs = async (req, res) => {
  try {
    // Tentativa completa (se a tabela offices existir)
    const [rows] = await pool.execute(`
      SELECT o.id, o.razao_social, o.cnpj, u.name as contadorName, off.name as officeName
      FROM oscs o
      LEFT JOIN users u ON o.assigned_contador_id = u.id
      LEFT JOIN offices off ON o.office_id = off.id
    `);
    res.json(rows.map(r => ({ ...r, name: r.razao_social, status: 'Ativo' })));
  } catch (error) {
    // Fallback: Se a tabela offices não existir, busca sem ela para não quebrar a tela do Admin
    try {
      const [rowsFallback] = await pool.execute(`
        SELECT o.id, o.razao_social, o.cnpj, u.name as contadorName
        FROM oscs o
        LEFT JOIN users u ON o.assigned_contador_id = u.id
      `);
      res.json(rowsFallback.map(r => ({ ...r, name: r.razao_social, status: 'Ativo' })));
    } catch (fallbackError) {
      console.error('[OSC Controller] Erro grave em getAllOSCs:', fallbackError);
      res.status(500).json({ message: 'Erro interno ao listar OSCs.' });
    }
  }
};

/**
 * --- CRIAR NOVA OSC (CONTADOR/ADMIN) ---
 */
export const createOSC = async (req, res) => {
  try {
    const { name, cnpj, responsible, email, phone, address } = req.body;

    // IMPORTANTE: Verifique se o middleware de autenticação está a preencher o req.user
    // Se req.user.id não existir, a OSC ficará "órfã"
    const contadorId = req.user ? req.user.id : null;
    const officeId = req.user ? req.user.office_id : null;

    console.log("Criando OSC para o Contador ID:", contadorId); // Adicione este log para debugar no PM2

    const query = `
      INSERT INTO oscs 
      (razao_social, cnpj, responsible, email, phone, address, assigned_contador_id, office_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(query, [
      name, cnpj, responsible, email, phone, address, 
      contadorId, // Aqui é onde o 18 deve entrar
      officeId
    ]);

    return res.status(201).json({ success: true, message: 'OSC criada com sucesso!', id: result.insertId });
  } catch (error) {
    console.error('[createOSC Error]:', error);
    return res.status(500).json({ message: 'Erro ao criar OSC.' });
  }
};