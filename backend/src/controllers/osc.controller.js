import pool from '../config/db.js';
import { logAction } from '../services/logger.service.js'; // 🕵️‍♂️ Espião importado!
import { getAccessibleOsc, findOscLinks, canAccessOsc, canManageOsc, oscScope } from '../services/access.service.js';
import { isAdmin, isContador, isOSC, isOfficeAdmin, officeIdOf } from '../utils/roles.js';

export const getMyOSCs = async (req, res) => {
  try {
    const scope = oscScope(req.user, 'o');

    let query = `
      SELECT o.id, o.cnpj, o.razao_social, o.responsible, o.email, o.phone, o.address, 
             o.user_id, o.assigned_contador_id, o.office_id, 
             o.data_origem_estatuto, o.data_contrato_conta_comigo, o.tipo_plano,
             o.cert_federal, o.cert_estadual, o.cert_municipal,
             off.name as office_name
      FROM oscs o
      LEFT JOIN offices off ON o.office_id = off.id
      WHERE ${scope.sql}
    `;
    let params = [...scope.params];

    const [oscs] = await pool.execute(query, params);

    const oscsWithDocs = await Promise.all(oscs.map(async (osc) => {
      try {
        const [docs] = await pool.execute(
          `SELECT id, original_name, saved_filename, file_path, doc_type, status, ref_month, ref_year, COALESCE(created_at, NOW()) as created_at FROM documents WHERE osc_id = ?`,
          [osc.id]
        );
        return { ...osc, name: osc.razao_social, status: 'Ativo', documents: docs || [] };
      } catch (docError) {
        return { ...osc, name: osc.razao_social, status: 'Ativo', documents: [] };
      }
    }));

    res.json(oscsWithDocs);
  } catch (error) {
    res.status(500).json({ message: "Erro ao carregar lista de organizações." });
  }
};

export const createOSC = async (req, res) => {
  try {
    const { name, cnpj, responsible, email, phone, address, data_origem_estatuto, data_contrato_conta_comigo, tipo_plano, cert_federal, cert_estadual, cert_municipal } = req.body;
    if (!isAdmin(req.user) && !isContador(req.user)) {
      return res.status(403).json({ message: 'Apenas a equipe contábil pode cadastrar OSCs.' });
    }
    const contadorId = isContador(req.user) ? req.user.id : null;
    const officeId = isAdmin(req.user) ? (req.body.office_id || null) : officeIdOf(req.user);

    const query = `
      INSERT INTO oscs (razao_social, cnpj, responsible, email, phone, address, assigned_contador_id, office_id, data_origem_estatuto, data_contrato_conta_comigo, tipo_plano, cert_federal, cert_estadual, cert_municipal) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(query, [name, cnpj, responsible, email, phone, address, contadorId, officeId, data_origem_estatuto || null, data_contrato_conta_comigo || null, tipo_plano || 'PRATA', cert_federal || null, cert_estadual || null, cert_municipal || null]);

    // 🔴 ESPIÃO LIGADO: Grava a Criação!
    await logAction(req.user.id, req.user.name, result.insertId, 'CRIOU', 'OSC', `Cadastrou a nova OSC: ${name} (CNPJ: ${cnpj})`);

    return res.status(201).json({ success: true, message: 'OSC criada com sucesso!', id: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'CNPJ já cadastrado.' });
    return res.status(500).json({ message: 'Erro interno ao criar OSC.' });
  }
};

export const updateOSC = async (req, res) => {
  try {
    const { id } = req.params;
    if (!(await getAccessibleOsc(req.user, id))) {
      return res.status(403).json({ message: 'Acesso negado a esta OSC.' });
    }
    let { name, razao_social, cnpj, data_fundacao, email, phone, address, cep, numero, bairro, cidade, estado, website, instagram, resp_nome, resp_cpf, gestor_nome, gestor_cpf, data_origem_estatuto, data_contrato_conta_comigo, tipo_plano, natureza_juridica, atividade_principal, inscricao_municipal, inscricao_estadual, presta_servico, vende_mercadorias, emite_nfse, emite_nfe, fim_mandato, banco_cadastrado, responsible, responsible_cpf, cert_federal, cert_estadual, cert_municipal } = req.body;

    const formatData = (dateStr) => {
      if (!dateStr || dateStr === '') return null;
      if (dateStr.includes('T')) return dateStr.split('T')[0];
      return dateStr;
    };

    const finalRespNome = resp_nome || responsible || null;
    const finalRespCpf = resp_cpf || responsible_cpf || null;

    const query = `
      UPDATE oscs SET 
        name = ?, razao_social = ?, cnpj = ?, data_fundacao = ?,
        email = ?, phone = ?, address = ?, cep = ?, numero = ?, bairro = ?, cidade = ?, estado = ?,
        website = ?, instagram = ?, responsible = ?, responsible_cpf = ?, resp_nome = ?, resp_cpf = ?, gestor_nome = ?, gestor_cpf = ?,
        data_origem_estatuto = ?, data_contrato_conta_comigo = COALESCE(?, data_contrato_conta_comigo), tipo_plano = COALESCE(?, tipo_plano),
        natureza_juridica = ?, atividade_principal = ?, inscricao_municipal = ?, inscricao_estadual = ?,
        presta_servico = ?, vende_mercadorias = ?, emite_nfse = ?, emite_nfe = ?,
        fim_mandato = ?, banco_cadastrado = ?,
        cert_federal = ?, cert_estadual = ?, cert_municipal = ?
      WHERE id = ?
    `;

    await pool.execute(query, [
      name || null, razao_social || null, cnpj || null, formatData(data_fundacao), email || null, phone || null, address || null, cep || null, numero || null, bairro || null, cidade || null, estado || null, website || null, instagram || null, finalRespNome, finalRespCpf, finalRespNome, finalRespCpf, gestor_nome || null, gestor_cpf || null, formatData(data_origem_estatuto), formatData(data_contrato_conta_comigo), tipo_plano || null, natureza_juridica || null, atividade_principal || null, inscricao_municipal || null, inscricao_estadual || null, presta_servico ? 1 : 0, vende_mercadorias ? 1 : 0, emite_nfse ? 1 : 0, emite_nfe ? 1 : 0, formatData(fim_mandato), banco_cadastrado ? 1 : 0, cert_federal || null, cert_estadual || null, cert_municipal || null, id
    ]);

    // 🔴 ESPIÃO LIGADO: Grava a Edição!
    await logAction(req.user.id, req.user.name, id, 'EDITOU', 'OSC', `Atualizou o Raio-X / Perfil da OSC ${name || razao_social}`);

    return res.status(200).json({ success: true, message: 'Raio-X da Organização atualizado com sucesso!' });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao atualizar a OSC.' });
  }
};

export const getOSCById = async (req, res) => {
  try {
    const [rows] = await pool.execute(`SELECT o.*, off.name as office_name, "Ativo" as status FROM oscs o LEFT JOIN offices off ON o.office_id = off.id WHERE o.id = ?`, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Não encontrado" });

    if (!canAccessOsc(req.user, rows[0])) return res.status(403).json({ message: "Acesso negado." });

    res.json(rows[0]);
  } catch (error) { res.status(500).json({ message: "Erro ao buscar OSC" }); }
};

export const getAllOSCs = async (req, res) => {
  try {
    const scope = oscScope(req.user, 'o');
    const [rows] = await pool.execute(`SELECT o.id, o.razao_social, o.cnpj, o.data_contrato_conta_comigo, o.office_id, u.name as contadorName, off.name as officeName FROM oscs o LEFT JOIN users u ON o.assigned_contador_id = u.id LEFT JOIN offices off ON o.office_id = off.id WHERE ${scope.sql}`, scope.params);
    res.json(rows.map(r => ({ ...r, name: r.razao_social, status: 'Ativo' })));
  } catch (error) { res.status(500).json({ message: 'Erro interno ao listar OSCs.' }); }
};

export const transferOSCOffice = async (req, res) => {
    try {
        const { id } = req.params;
        const { newOfficeId } = req.body;

        if (!isAdmin(req.user)) return res.status(403).json({ message: 'Apenas administradores podem transferir carteiras.' });
        if (!newOfficeId) return res.status(400).json({ message: 'ID do novo escritório é obrigatório.' });

        await pool.execute('UPDATE oscs SET office_id = ?, assigned_contador_id = NULL WHERE id = ?', [newOfficeId, id]);
        res.json({ message: 'OSC transferida com sucesso para o novo escritório!' });
    } catch (error) { res.status(500).json({ message: 'Erro ao transferir a OSC.' }); }
};

export const getMyPayments = async (req, res) => {
  try {
    const [oscRows] = await pool.execute('SELECT id FROM oscs WHERE user_id = ?', [req.user.id]);
    if (oscRows.length === 0) return res.status(404).json({ message: 'OSC não encontrada.' });
    const [payments] = await pool.execute(`SELECT * FROM subscriptions WHERE osc_id = ?`, [oscRows[0].id]);
    res.json(payments);
  } catch (error) { res.status(500).json({ message: 'Erro nos pagamentos.' }); }
};

export const assignContador = async (req, res) => {
  try {
    const { id } = req.params;
    const { contadorId } = req.body;
    let { officeId } = req.body;

    const osc = await findOscLinks(id);
    if (!osc) return res.status(404).json({ message: 'OSC não encontrada.' });
    if (!canManageOsc(req.user, osc)) {
      return res.status(403).json({ message: 'Somente o Administrador ou o ADM do escritório podem reatribuir contadores.' });
    }

    // ADM Contador não move OSCs entre escritórios: a carteira permanece no próprio escritório.
    if (!isAdmin(req.user)) officeId = officeIdOf(req.user);

    // O contador escolhido precisa pertencer ao escritório de destino.
    if (contadorId) {
      const [rows] = await pool.execute(
        "SELECT id, office_id FROM users WHERE id = ? AND UPPER(role) = 'CONTADOR' AND status = 'Ativo'",
        [contadorId]
      );
      if (rows.length === 0) return res.status(400).json({ message: 'Contador inválido ou inativo.' });
      if (officeId && Number(rows[0].office_id) !== Number(officeId)) {
        return res.status(400).json({ message: 'O contador selecionado não pertence a este escritório.' });
      }
    }

    await pool.execute('UPDATE oscs SET assigned_contador_id = ?, office_id = ? WHERE id = ?', [contadorId || null, officeId || null, id]);
    res.json({ message: 'Associação atualizada' });
  } catch (error) { res.status(500).json({ message: 'Erro ao associar.' }); }
};

export const getMyOscProfile = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM oscs WHERE user_id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Perfil da OSC não encontrado.' });
    return res.status(200).json({ osc: rows[0] });
  } catch (error) { return res.status(500).json({ message: 'Erro ao buscar perfil da OSC.' }); }
};

export const deleteOSC = async (req, res) => {
  try {
    const { id } = req.params;
    const osc = await findOscLinks(id);
    if (!osc) return res.status(404).json({ message: 'OSC não encontrada.' });
    if (!canManageOsc(req.user, osc)) {
      return res.status(403).json({ message: 'Somente o Administrador ou o ADM do escritório podem excluir uma OSC.' });
    }
    await pool.execute('DELETE FROM documents WHERE osc_id = ?', [id]);
    
    // 🔴 ESPIÃO LIGADO: Grava a Exclusão!
    await logAction(req.user.id, req.user.name, id, 'EXCLUIU', 'OSC', `A OSC com ID ${id} foi excluída permanentemente.`);
    
    const [result] = await pool.execute('DELETE FROM oscs WHERE id = ?', [id]);
        
    if (result.affectedRows === 0) return res.status(404).json({ message: 'OSC não encontrada.' });
    res.status(200).json({ message: 'OSC excluída com sucesso!' });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno ao excluir a OSC.' });
  }
};