import pool from '../config/db.js';

/**
 * --- BUSCAR MINHAS OSCS (LÓGICA DE GRUPO/ESCRITÓRIO RIGOROSA) ---
 * Regra 2: Contadores só veem OSCs do seu próprio escritório.
 */
export const getMyOSCs = async (req, res) => {
  try {
    const userId = req.user.id;
    const officeId = (req.user.office_id && req.user.office_id !== "0") ? req.user.office_id : null;
    const userRole = req.user.role.toLowerCase();

    let query = `
      SELECT o.id, o.cnpj, o.razao_social, o.responsible, o.email, o.phone, o.address, 
             o.user_id, o.assigned_contador_id, o.office_id, 
             o.data_origem_estatuto, o.data_contrato_conta_comigo, o.tipo_plano,
             off.name as office_name
      FROM oscs o
      LEFT JOIN offices off ON o.office_id = off.id
    `;
    let params = [];

    // O Filtro de Silo de Dados
    if (userRole === 'contador') {
      if (!officeId) {
        // Se o contador não tem escritório atrelado, por segurança, ele não vê nenhuma OSC.
        return res.json([]); 
      }
      query += ' WHERE o.office_id = ?';
      params.push(officeId);
    } else if (userRole === 'osc') {
      query += ' WHERE o.user_id = ?';
      params.push(userId);
    } else if (userRole === 'admin') {
       // Admin vê tudo, não adiciona WHERE a menos que queira filtrar
    }

    const [oscs] = await pool.execute(query, params);

    // Busca os documentos de cada OSC de forma segura
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
      data_contrato_conta_comigo || null,
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

    // Verificação de segurança: Um contador só pode atualizar uma OSC se ela pertencer ao escritório dele
    // (A menos que seja admin)
    const userRole = req.user.role.toLowerCase();
    const officeId = req.user.office_id;

    if (userRole === 'contador') {
        const [check] = await pool.execute('SELECT office_id FROM oscs WHERE id = ?', [id]);
        if (check.length === 0 || check[0].office_id !== officeId) {
            return res.status(403).json({ message: "Acesso negado: OSC pertence a outro escritório." });
        }
    }

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
    const [rows] = await pool.execute(`
      SELECT o.*, off.name as office_name, "Ativo" as status 
      FROM oscs o 
      LEFT JOIN offices off ON o.office_id = off.id 
      WHERE o.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) return res.status(404).json({ message: "Não encontrado" });

    // Regra de Visão: Impede que um contador force o ID na URL para ver OSC de outro escritório
    const userRole = req.user.role.toLowerCase();
    const officeId = req.user.office_id;
    if (userRole === 'contador' && rows[0].office_id !== officeId) {
         return res.status(403).json({ message: "Acesso negado." });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar OSC" });
  }
};

export const getAllOSCs = async (req, res) => {
  try {
    // Agora puxamos também o nome do escritório para o Admin saber
    const [rows] = await pool.execute(`
      SELECT o.id, o.razao_social, o.cnpj, o.data_contrato_conta_comigo, o.office_id, 
             u.name as contadorName, off.name as officeName
      FROM oscs o
      LEFT JOIN users u ON o.assigned_contador_id = u.id
      LEFT JOIN offices off ON o.office_id = off.id
    `);
    res.json(rows.map(r => ({ ...r, name: r.razao_social, status: 'Ativo' })));
  } catch (error) {
    res.status(500).json({ message: 'Erro interno ao listar OSCs.' });
  }
};

/**
 * --- REGRA 1: TRANSFERIR OSC PARA NOVO ESCRITÓRIO ---
 * (Apenas Admin ou perfis com permissão devem aceder a isto)
 */
export const transferOSCOffice = async (req, res) => {
    try {
        const { id } = req.params; // ID da OSC
        const { newOfficeId } = req.body;

        // Opcional: Adicionar validação de se o usuário que fez o request é ADMIN
        if (req.user.role.toLowerCase() !== 'admin') {
             return res.status(403).json({ message: 'Apenas administradores podem transferir carteiras.' });
        }

        if (!newOfficeId) {
            return res.status(400).json({ message: 'ID do novo escritório é obrigatório.' });
        }

        // Ao transferir o escritório, removemos o contador atribuído especificamente
        // para forçar a equipe do novo escritório a assumir o cliente de forma global.
        await pool.execute(
            'UPDATE oscs SET office_id = ?, assigned_contador_id = NULL WHERE id = ?', 
            [newOfficeId, id]
        );

        res.json({ message: 'OSC transferida com sucesso para o novo escritório!' });
    } catch (error) {
        console.error('[transferOSCOffice Error]:', error);
        res.status(500).json({ message: 'Erro ao transferir a OSC.' });
    }
};

// Funções de pagamento e antigas
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

export const getMyOscProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Busca a OSC que pertence ao utilizador logado
    const [rows] = await pool.execute('SELECT * FROM oscs WHERE user_id = ?', [userId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Perfil da OSC não encontrado.' });
    }
    
    // Devolve os dados da OSC
    return res.status(200).json({ osc: rows[0] });
  } catch (error) {
    console.error('[getMyOscProfile] Erro:', error);
    return res.status(500).json({ message: 'Erro ao buscar perfil da OSC.' });
  }
};