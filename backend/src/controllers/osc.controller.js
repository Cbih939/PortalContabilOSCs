import pool from '../config/db.js';

export const getAllOSCs = async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT o.id, o.razao_social, o.cnpj, u.name as contador_nome_sql
            FROM oscs o
            LEFT JOIN users u ON o.assigned_contador_id = u.id
        `);
        const formattedRows = rows.map(osc => ({
            id: osc.id,
            cnpj: osc.cnpj || '',
            name: osc.razao_social || 'Sem Razão Social', 
            contadorName: osc.contador_nome_sql || 'Nenhum',
            status: 'Ativo' 
        }));
        return res.status(200).json(formattedRows);
    } catch (error) {
        return res.status(500).json({ message: 'Erro interno' });
    }
};

export const assignContador = async (req, res) => {
    try {
        const { id } = req.params;
        const { contadorId } = req.body;
        await pool.execute(
            'UPDATE oscs SET assigned_contador_id = ? WHERE id = ?',
            [contadorId === "null" ? null : contadorId, id]
        );
        const [updated] = await pool.execute('SELECT id, razao_social as name FROM oscs WHERE id = ?', [id]);
        return res.json({ message: 'Sucesso', osc: updated[0] });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao associar.' });
    }
};

// função getOSCById

export const getOSCById = async (req, res) => {
    const [rows] = await pool.execute('SELECT * FROM oscs WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
};

// função getMyOSCs
export const getMyOSCs = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Ajustado 'responsavel' para 'responsible' conforme o erro do banco
    let query = `
      SELECT id, razao_social, cnpj, responsible, email, telefone 
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
          `SELECT id, original_name, doc_type, status, ref_month, ref_year 
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
    console.error('ERRO FATAL getMyOSCs:', error);
    res.status(500).json({ message: "Erro interno ao listar OSCs." });
  }
};

export const updateOSC = async (req, res) => {
  try {
    const { id } = req.params;
    // Capturamos name/razao_social e responsible/responsavel para evitar erros do frontend
    const { razao_social, name, cnpj, responsavel, responsible, telefone, email } = req.body;

    const finalName = razao_social || name;
    const finalResponsible = responsible || responsavel;

    // Query de UPDATE usando 'responsible' (coluna correta do seu banco)
    const [result] = await pool.execute(
      `UPDATE oscs 
       SET razao_social = ?, cnpj = ?, responsible = ?, telefone = ?, email = ?
       WHERE id = ?`,
      [finalName, cnpj, finalResponsible, telefone, email, id]
    );

    res.json({ message: "Dados atualizados com sucesso!" });
  } catch (error) {
    console.error("[Update OSC Error]:", error);
    res.status(500).json({ message: "Erro ao salvar no banco. Verifique os dados." });
  }
};



