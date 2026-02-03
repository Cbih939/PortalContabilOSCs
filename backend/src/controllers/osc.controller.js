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

export const getMyOSCs = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Busca OSCs vinculadas ao contador logado e traz os documentos de cada uma
    const [oscs] = await pool.execute(
      `SELECT o.*, o.razao_social as name 
       FROM oscs o 
       WHERE o.assigned_contador_id = ?`, 
      [userId]
    );

    // Para cada OSC, busca os documentos vinculados
    const oscsWithDocs = await Promise.all(oscs.map(async (osc) => {
      const [docs] = await pool.execute(
        `SELECT * FROM documents WHERE osc_id = ? ORDER BY ref_year DESC, ref_month DESC`,
        [osc.id]
      );
      return { ...osc, documents: docs };
    }));

    res.json(oscsWithDocs);
  } catch (error) {
    res.status(500).json({ message: "Erro ao carregar OSCs para o contador." });
  }
};

export const getOSCById = async (req, res) => {
    const [rows] = await pool.execute('SELECT * FROM oscs WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
};

export const updateOSC = async (req, res) => {
  try {
    const { id } = req.params;
    const { razao_social, cnpj, responsavel, telefone, email, assigned_contador_id } = req.body;

    const [result] = await pool.execute(
      `UPDATE oscs 
       SET razao_social = ?, cnpj = ?, responsavel = ?, telefone = ?, email = ?, assigned_contador_id = ? 
       WHERE id = ?`,
      [razao_social, cnpj, responsavel, telefone, email, assigned_contador_id, id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: "OSC não encontrada." });
    res.json({ message: "OSC atualizada com sucesso!" });
  } catch (error) {
    console.error("[Update Error]:", error);
    res.status(500).json({ message: "Erro ao atualizar. Verifique os dados." });
  }
};