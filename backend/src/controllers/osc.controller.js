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
    
    // Atualiza tanto o contador individual quanto o escritório (grupo)
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
    const officeId = req.user.office_id; // Extraído do token via middleware
    const userRole = req.user.role.toLowerCase();

    let query = `
      SELECT id, cnpj, razao_social, responsible, email, phone, address, user_id, assigned_contador_id, office_id
      FROM oscs
    `;
    let params = [];

    if (userRole === 'contador') {
      // Se o contador pertence a um escritório, vê todos os clientes do escritório
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

export const getAllOSCs = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT o.id, o.razao_social, o.cnpj, u.name as contadorName, off.name as officeName
      FROM oscs o
      LEFT JOIN users u ON o.assigned_contador_id = u.id
      LEFT JOIN offices off ON o.office_id = off.id
    `);
    res.json(rows.map(r => ({ ...r, name: r.razao_social, status: 'Ativo' })));
  } catch (error) {
    console.error('[OSC Controller] Erro em getAllOSCs:', error);
    res.status(500).json({ message: 'Erro interno ao listar OSCs.' });
  }
};

export const createOSC = async (req, res) => {
  try {
    // 1. Recebemos os dados do Frontend
    const { name, cnpj, responsible, email, phone, status, address } = req.body;

    // 2. Pegamos o ID do contador logado para vincular automaticamente
    // E também o office_id caso ele pertença a um escritório
    const contadorId = (req.user && req.user.role.toUpperCase() === 'CONTADOR') ? req.user.id : null;
    const officeId = (req.user && req.user.office_id) ? req.user.office_id : null;

    // 3. Query SQL com os nomes EXATOS da sua tabela 'oscs'
    const query = `
      INSERT INTO oscs 
      (razao_social, cnpj, responsible, email, phone, address, assigned_contador_id, office_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    // Obs: A coluna 'status' não existe na sua tabela oscs (pelo DESCRIBE que enviou), 
    // então eu removi para não dar o erro "Unknown column 'status'".
    
    const [result] = await pool.execute(query, [
      name,           // vai para razao_social
      cnpj,           // vai para cnpj
      responsible,    // vai para responsible
      email,          // vai para email
      phone,          // vai para phone
      address,        // vai para address
      contadorId,     // vai para assigned_contador_id
      officeId        // vai para office_id (se aplicável)
    ]);

    return res.status(201).json({ 
      success: true, 
      message: 'OSC criada com sucesso!', 
      id: result.insertId 
    });

  } catch (error) {
    console.error('[createOSC Error]:', error);
    // Erro 1062 é o código do MySQL para "Entrada Duplicada" (CNPJ já existe)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Já existe uma OSC cadastrada com este CNPJ.' });
    }
    return res.status(500).json({ message: 'Erro interno ao criar OSC no banco de dados.' });
  }
};