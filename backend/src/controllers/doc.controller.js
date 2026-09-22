import pool from '../config/db.js';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import config from '../config/index.js';
import { logAction } from '../services/logger.service.js';
import { getAccessibleOsc, findOscOfUser, oscScope } from '../services/access.service.js';
import { isAdmin, isContador, isOSC, isStaff } from '../utils/roles.js';

const require = createRequire(import.meta.url);
const archiver = require('archiver');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_ROOT = path.resolve(__dirname, '../../uploads');

// Linhas "virtuais" (TEC) não são arquivos: não entram em contagens de envio.
const REAL_DOC_SQL = "LEFT(d.saved_filename, 12) <> 'tec_virtual_'";

const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

// --- helpers -----------------------------------------------------------------
/**
 * Meses (do ano corrente) sem nenhum documento enviado pela OSC.
 * O mês anterior só vira "atraso" após o dia 10; meses anteriores à origem da OSC são ignorados.
 */
const computeLateMonths = (osc, haveMonths, now = new Date()) => {
  const year = now.getFullYear();
  const lastLateMonth = now.getDate() > 10 ? now.getMonth() : now.getMonth() - 1;
  const origin = osc.data_origem_estatuto || osc.data_fundacao || osc.created_at;
  let originYear = 2000, originMonth = 1;
  if (origin) {
    const d = new Date(origin);
    if (!Number.isNaN(d.getTime())) { originYear = d.getFullYear(); originMonth = d.getMonth() + 1; }
  }
  const late = [];
  for (let m = 1; m <= lastLateMonth; m++) {
    if (year < originYear || (year === originYear && m < originMonth)) continue;
    if (!haveMonths.has(m)) late.push(m);
  }
  return late;
};

const toInt = (value) => {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
};

const validMonth = (m) => m !== null && m >= 1 && m <= 12;
const validYear = (y) => y !== null && y >= 2000 && y <= 2100;

/** Cabeçalho Content-Disposition seguro para nomes com acentos/aspas. */
const contentDisposition = (type, name) =>
  `${type}; filename*=UTF-8''${encodeURIComponent(String(name || 'arquivo'))}`;

/** Resolve o arquivo físico de um documento sem permitir sair de /uploads. */
const resolveStoredFile = (savedFilename) => {
  const clean = String(savedFilename || '')
    .replace('uploads/', '')
    .replace('public/', '')
    .replace(/^\/+/, '');
  const candidates = [
    path.resolve(UPLOADS_ROOT, clean),
    path.resolve(UPLOADS_ROOT, 'public', clean),
  ];
  for (const candidate of candidates) {
    if (candidate.startsWith(UPLOADS_ROOT + path.sep) && fs.existsSync(candidate)) return candidate;
  }
  return null;
};

const discardUploadedFile = (file) => {
  try {
    if (file?.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
  } catch (e) { /* melhor esforço */ }
};

/** Carrega um documento junto com os vínculos da OSC dona e valida o acesso do usuário. */
const getAccessibleDocument = async (user, docId) => {
  const [rows] = await pool.execute(
    `SELECT d.id, d.osc_id, d.original_name, d.saved_filename, d.file_path, d.mime_type, d.status,
            d.uploaded_by_user_id, d.doc_type, d.ref_month, d.ref_year, d.project_id, d.file_size_bytes
       FROM documents d WHERE d.id = ?`,
    [docId]
  );
  const doc = rows[0];
  if (!doc) return { doc: null, osc: null };
  const osc = await getAccessibleOsc(user, doc.osc_id);
  return { doc, osc };
};

// --- listagens -----------------------------------------------------------------
export const getDocuments = async (req, res) => {
  try {
    const { oscId, year } = req.query;
    const scope = oscScope(req.user, 'o');

    let query = `
      SELECT d.*, 
             d.created_at as createdAt, 
             o.razao_social as osc_name,
             p.name as project_name 
      FROM documents d
      INNER JOIN oscs o ON d.osc_id = o.id
      LEFT JOIN projects p ON d.project_id = p.id
    `;

    const params = [...scope.params];
    const conditions = [scope.sql];

    if (oscId) { conditions.push('d.osc_id = ?'); params.push(oscId); }
    if (year) { conditions.push('d.ref_year = ?'); params.push(year); }

    query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY d.ref_year DESC, d.ref_month DESC, d.created_at DESC';

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('[getDocuments]', error.message);
    res.status(500).json({ message: 'Erro ao carregar documentos das OSCs.' });
  }
};

export const getReceivedDocuments = async (req, res) => {
  try {
    const scope = oscScope(req.user, 'o');
    const query = `
      SELECT d.*, u.name as sender_name, o.razao_social
      FROM documents d
      JOIN oscs o ON d.osc_id = o.id
      JOIN users u ON d.uploaded_by_user_id = u.id
      WHERE ${scope.sql}
      ORDER BY d.created_at DESC
    `;
    const [rows] = await pool.execute(query, scope.params);

    const formatted = rows.map(doc => ({
      id: doc.id,
      title: doc.original_name,
      original_name: doc.original_name,
      sender_name: doc.razao_social || doc.sender_name,
      created_at: doc.created_at,
      file_path: doc.saved_filename
    }));

    res.json(formatted);
  } catch (error) {
    console.error('[getReceivedDocuments]', error.message);
    res.status(500).json({ message: 'Erro ao buscar documentos recebidos.' });
  }
};

/**
 * Documentos recebidos agrupados por OSC (mais recentes primeiro), com quem enviou
 * e os meses do ano corrente ainda sem envio.
 */
export const getReceivedByOsc = async (req, res) => {
  try {
    const scope = oscScope(req.user, 'o');
    const [oscs] = await pool.execute(
      `SELECT o.id, o.razao_social, o.data_origem_estatuto, o.data_fundacao, o.created_at
         FROM oscs o WHERE ${scope.sql} ORDER BY o.razao_social`,
      scope.params
    );
    const [docs] = await pool.execute(
      `SELECT d.id, d.osc_id, d.original_name, d.doc_type, d.status, d.ref_month, d.ref_year, d.created_at,
              u.name AS uploader_name
         FROM documents d
         JOIN oscs o ON d.osc_id = o.id
         LEFT JOIN users u ON d.uploaded_by_user_id = u.id
        WHERE ${scope.sql} AND ${REAL_DOC_SQL}
        ORDER BY d.created_at DESC`,
      scope.params
    );

    const now = new Date();
    const year = now.getFullYear();
    const byOsc = new Map(oscs.map(o => [o.id, { docs: [], months: new Set() }]));
    for (const d of docs) {
      const bucket = byOsc.get(d.osc_id);
      if (!bucket) continue;
      bucket.docs.push(d);
      if (Number(d.ref_year) === year && d.ref_month) bucket.months.add(Number(d.ref_month));
    }

    res.json(oscs.map(o => {
      const bucket = byOsc.get(o.id);
      return {
        id: o.id,
        name: o.razao_social,
        year,
        late_months: computeLateMonths(o, bucket.months, now),
        documents: bucket.docs,
      };
    }));
  } catch (error) {
    console.error('[getReceivedByOsc]', error.message);
    res.status(500).json({ message: 'Erro ao buscar documentos recebidos.' });
  }
};

// --- upload ------------------------------------------------------------------
export const uploadDocument = async (req, res) => {
  const file = req.file;
  try {
    let { osc_id, doc_type, ref_month, ref_year, project_id } = req.body;
    const userId = req.user.id;

    if (!file) return res.status(400).json({ message: 'Nenhum arquivo enviado.' });

    // Resolve a OSC de destino respeitando o perfil.
    let osc;
    if (isOSC(req.user)) {
      // A OSC só envia para si mesma; qualquer osc_id do corpo é ignorado.
      osc = await findOscOfUser(userId);
      if (!osc) { discardUploadedFile(file); return res.status(404).json({ message: 'Perfil de OSC não encontrado.' }); }
    } else {
      if (!osc_id || osc_id === 'undefined' || osc_id === 'null') {
        discardUploadedFile(file);
        return res.status(400).json({ message: 'Informe a OSC de destino.' });
      }
      osc = await getAccessibleOsc(req.user, osc_id);
      if (!osc) { discardUploadedFile(file); return res.status(403).json({ message: 'Acesso negado a esta OSC.' }); }
    }
    osc_id = osc.id;

    // Competência (mês/ano de referência), quando informada, precisa ser válida.
    const month = toInt(ref_month);
    const year = toInt(ref_year);
    if ((ref_month !== undefined && ref_month !== '' && !validMonth(month)) ||
        (ref_year !== undefined && ref_year !== '' && !validYear(year))) {
      discardUploadedFile(file);
      return res.status(400).json({ message: 'Mês ou ano de referência inválido.' });
    }

    const parsedProjectId = (project_id && project_id !== 'null' && project_id !== 'undefined' && project_id !== '') ? parseInt(project_id) : null;

    const query = `
      INSERT INTO documents 
      (osc_id, project_id, original_name, saved_filename, file_path, doc_type, ref_month, ref_year, status, uploaded_by_user_id, file_size_bytes, mime_type) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await pool.execute(query, [
      osc_id, parsedProjectId, file.originalname, file.filename, file.path, doc_type, month, year, 'PENDENTE', userId, file.size || 0, file.mimetype || 'application/pdf'
    ]);

    await logAction(userId, req.user.name, osc_id, 'CRIOU', 'DOCUMENTO', `Enviou o documento: ${file.originalname} (Mês: ${month}/${year})`);

    res.status(201).json({ message: 'Documento enviado com sucesso!' });
  } catch (error) {
    console.error('[uploadDocument]', error.message);
    discardUploadedFile(file);
    res.status(500).json({ message: 'Erro interno ao salvar documento.' });
  }
};

/**
 * Corrige o envio de um documento: troca o arquivo e/ou os dados (tipo, mês/ano de
 * referência). Usado quando a OSC (ou o contador, em nome dela) enviou o arquivo errado.
 * A OSC só corrige o que ela mesma enviou e enquanto não estiver "CONCLUIDO";
 * a equipe contábil (contador/admin) pode corrigir qualquer documento em seu escopo.
 */
export const updateDocument = async (req, res) => {
  const file = req.file;
  try {
    const { doc, osc } = await getAccessibleDocument(req.user, req.params.id);
    if (!doc) { discardUploadedFile(file); return res.status(404).json({ message: 'Documento não encontrado.' }); }
    if (!osc) { discardUploadedFile(file); return res.status(403).json({ message: 'Acesso negado a este documento.' }); }

    if (doc.doc_type === 'CONCLUSO TEC' || String(doc.saved_filename).startsWith('tec_virtual_')) {
      discardUploadedFile(file);
      return res.status(400).json({ message: 'Este registro não é um arquivo e não pode ser editado.' });
    }

    if (isOSC(req.user)) {
      const ownsIt = Number(doc.uploaded_by_user_id) === Number(req.user.id);
      if (!ownsIt || String(doc.status).toUpperCase() === 'CONCLUIDO') {
        discardUploadedFile(file);
        return res.status(403).json({ message: 'Este documento já foi concluído e não pode mais ser editado. Fale com a contabilidade.' });
      }
    }

    const { doc_type, ref_month, ref_year, project_id } = req.body;

    const month = ref_month !== undefined && ref_month !== '' ? toInt(ref_month) : doc.ref_month;
    const year = ref_year !== undefined && ref_year !== '' ? toInt(ref_year) : doc.ref_year;
    if ((ref_month !== undefined && ref_month !== '' && !validMonth(month)) ||
        (ref_year !== undefined && ref_year !== '' && !validYear(year))) {
      discardUploadedFile(file);
      return res.status(400).json({ message: 'Mês ou ano de referência inválido.' });
    }

    const parsedProjectId = project_id !== undefined
      ? ((project_id && project_id !== 'null' && project_id !== 'undefined' && project_id !== '') ? parseInt(project_id) : null)
      : doc.project_id;

    const fields = {
      doc_type: doc_type || doc.doc_type,
      ref_month: month,
      ref_year: year,
      project_id: parsedProjectId,
      status: 'PENDENTE', // conteúdo mudou: volta para análise da contabilidade
    };
    if (file) {
      fields.original_name = file.originalname;
      fields.saved_filename = file.filename;
      fields.file_path = file.path;
      fields.mime_type = file.mimetype || 'application/pdf';
      fields.file_size_bytes = file.size || 0;
    }

    await pool.execute(
      `UPDATE documents SET doc_type = ?, ref_month = ?, ref_year = ?, project_id = ?, status = ?,
              original_name = ?, saved_filename = ?, file_path = ?, mime_type = ?, file_size_bytes = ?
         WHERE id = ?`,
      [fields.doc_type, fields.ref_month, fields.ref_year, fields.project_id, fields.status,
       fields.original_name || doc.original_name, fields.saved_filename || doc.saved_filename,
       fields.file_path || doc.file_path, fields.mime_type || doc.mime_type,
       fields.file_size_bytes ?? doc.file_size_bytes, doc.id]
    );

    // Só remove o arquivo antigo depois que o banco confirmou a troca.
    if (file && doc.saved_filename !== 'none') {
      const oldPath = resolveStoredFile(doc.saved_filename);
      if (oldPath) { try { fs.unlinkSync(oldPath); } catch (e) { /* melhor esforço */ } }
    }

    await logAction(req.user.id, req.user.name, doc.osc_id, 'EDITOU', 'DOCUMENTO',
      file ? `Substituiu o arquivo de "${doc.original_name}" por "${file.originalname}".` : `Corrigiu os dados do documento "${doc.original_name}".`);

    res.json({ message: 'Documento atualizado com sucesso.' });
  } catch (error) {
    console.error('[updateDocument]', error.message);
    discardUploadedFile(file);
    res.status(500).json({ message: 'Erro ao atualizar o documento.' });
  }
};

// --- status por mês (somente equipe contábil) ----------------------------------------
const requireOscAccess = async (req, res, oscId) => {
  if (!isStaff(req.user)) {
    res.status(403).json({ message: 'Apenas a equipe contábil pode executar esta ação.' });
    return null;
  }
  const osc = await getAccessibleOsc(req.user, oscId);
  if (!osc) {
    res.status(403).json({ message: 'Acesso negado a esta OSC.' });
    return null;
  }
  return osc;
};

export const markMonthAsConcluded = async (req, res) => {
  try {
    const { oscId, month, year } = req.body;
    if (!oscId || !month || !year) return res.status(400).json({ message: 'OSC, Mês e Ano de referência são obrigatórios.' });
    if (!(await requireOscAccess(req, res, oscId))) return;

    const [result] = await pool.execute(
      `UPDATE documents SET status = 'CONCLUIDO' WHERE osc_id = ? AND doc_type = 'MENSAL' AND ref_month = ? AND ref_year = ?`,
      [oscId, month, year]
    );

    await logAction(req.user.id, req.user.name, oscId, 'APROVOU', 'DOCUMENTO', `Marcou o mês ${month}/${year} como CONCLUÍDO.`);

    res.json({ message: `Mês ${month}/${year} concluído com sucesso.`, updatedRows: result.affectedRows });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno ao concluir mês.' });
  }
};

export const markConclusoTec = async (req, res) => {
  try {
    const { osc_id, month, year } = req.body;
    const userId = req.user.id;
    if (!osc_id || !year) return res.status(400).json({ message: "OSC e Ano são obrigatórios." });
    if (!(await requireOscAccess(req, res, osc_id))) return;

    if (month === 'ALL') {
      for (let m = 1; m <= 12; m++) {
        const uniqueName = `tec_virtual_${osc_id}_${year}_${m}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        await pool.execute(
          `INSERT INTO documents (osc_id, original_name, saved_filename, file_path, doc_type, ref_month, ref_year, status, uploaded_by_user_id, file_size_bytes, mime_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [osc_id, 'Histórico TEC', uniqueName, uniqueName, 'CONCLUSO TEC', m, year, 'CONCLUIDO', userId, 0, 'text/plain']
        );
      }
    } else {
      const uniqueName = `tec_virtual_${osc_id}_${year}_${month}_${Date.now()}`;
      await pool.execute(
        `INSERT INTO documents (osc_id, original_name, saved_filename, file_path, doc_type, ref_month, ref_year, status, uploaded_by_user_id, file_size_bytes, mime_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [osc_id, 'Histórico TEC', uniqueName, uniqueName, 'CONCLUSO TEC', month, year, 'CONCLUIDO', userId, 0, 'text/plain']
      );
    }

    await logAction(userId, req.user.name, osc_id, 'CRIOU', 'DOCUMENTO', `Registou TEC (Transferência de Escritório) para ${month === 'ALL' ? 'o ano todo' : `o mês ${month}`}/${year}.`);

    res.json({ message: 'Histórico TEC registrado com sucesso!' });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno ao marcar TEC.' });
  }
};

export const markMonthAsPending = async (req, res) => {
  try {
    const { oscId, month, year } = req.body;
    if (!oscId || !month || !year) return res.status(400).json({ message: 'OSC, Mês e Ano são obrigatórios.' });
    if (!(await requireOscAccess(req, res, oscId))) return;

    await pool.execute(`DELETE FROM documents WHERE osc_id = ? AND doc_type = 'CONCLUSO TEC' AND ref_month = ? AND ref_year = ?`, [oscId, month, year]);

    const [result] = await pool.execute(`UPDATE documents SET status = 'PENDENTE' WHERE osc_id = ? AND ref_month = ? AND ref_year = ? AND doc_type != 'CONCLUSO TEC'`, [oscId, month, year]);

    await logAction(req.user.id, req.user.name, oscId, 'EDITOU', 'DOCUMENTO', `Reverteu o mês ${month}/${year} para PENDENTE.`);

    res.json({ message: `Mês ${month}/${year} marcado como PENDENTE.`, updatedRows: result.affectedRows });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno ao reverter status.' });
  }
};

// --- download / exclusão ---------------------------------------------------------------
export const downloadDocument = async (req, res) => {
  try {
    const { doc, osc } = await getAccessibleDocument(req.user, req.params.id);
    if (!doc) return res.status(404).json({ message: 'Documento não encontrado.' });
    if (!osc) return res.status(403).json({ message: 'Acesso negado a este documento.' });

    const filePath = resolveStoredFile(doc.saved_filename);
    if (!filePath) return res.status(404).json({ message: 'Arquivo físico não encontrado no disco.' });

    res.setHeader('Content-Type', doc.mime_type || 'application/pdf');
    res.setHeader('Content-Disposition', contentDisposition('inline', doc.original_name));
    return res.sendFile(filePath);
  } catch (error) {
    console.error('[downloadDocument]', error.message);
    res.status(500).json({ message: 'Erro ao processar o documento.' });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { doc, osc } = await getAccessibleDocument(req.user, req.params.id);
    if (!doc) return res.status(404).json({ message: 'Documento não encontrado.' });
    if (!osc) return res.status(403).json({ message: 'Acesso negado a este documento.' });

    // A OSC só remove o que ela mesma enviou e que ainda não foi concluído pela contabilidade.
    if (isOSC(req.user)) {
      const ownsIt = Number(doc.uploaded_by_user_id) === Number(req.user.id);
      if (!ownsIt || String(doc.status).toUpperCase() === 'CONCLUIDO') {
        return res.status(403).json({ message: 'Este documento já foi concluído e não pode ser removido pela OSC.' });
      }
    }

    if (doc.saved_filename !== 'none' && !String(doc.saved_filename).startsWith('tec_virtual')) {
      const filePath = resolveStoredFile(doc.saved_filename);
      if (filePath) fs.unlinkSync(filePath);
    }

    await pool.execute('DELETE FROM documents WHERE id = ?', [doc.id]);
    await logAction(req.user.id, req.user.name, doc.osc_id, 'EXCLUIU', 'DOCUMENTO', `Removeu o ficheiro: ${doc.original_name}`);

    res.json({ message: 'Documento excluído com sucesso.' });
  } catch (error) {
    console.error('[deleteDocument]', error.message);
    res.status(500).json({ message: 'Erro ao excluir o documento.' });
  }
};

export const downloadMonthZip = async (req, res) => {
  try {
    const { oscId } = req.query;
    const month = toInt(req.query.month);
    const year = toInt(req.query.year);

    if (!oscId || !validMonth(month) || !validYear(year)) {
      return res.status(400).json({ message: 'OSC, Mês e Ano são obrigatórios.' });
    }
    const osc = await getAccessibleOsc(req.user, oscId);
    if (!osc) return res.status(403).json({ message: 'Acesso negado a esta OSC.' });

    const [rows] = await pool.execute(
      'SELECT original_name, saved_filename FROM documents WHERE osc_id = ? AND ref_month = ? AND ref_year = ? AND doc_type != "CONCLUSO TEC"',
      [osc.id, month, year]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Nenhum documento encontrado para este mês.' });
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="documentos_${year}_${month}.zip"`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', (err) => {
      console.error('Erro no Archiver:', err);
      if (!res.headersSent) res.status(500).send({ error: err.message });
    });
    archive.pipe(res);

    for (const doc of rows) {
      const filePath = resolveStoredFile(doc.saved_filename);
      if (filePath) archive.file(filePath, { name: doc.original_name });
    }

    await archive.finalize();
  } catch (error) {
    console.error('Erro ao gerar ZIP:', error);
    if (!res.headersSent) res.status(500).json({ message: 'Erro ao processar o arquivo ZIP.' });
  }
};

// --- link público -------------------------------------------------------------------
export const generatePublicLink = async (req, res) => {
  try {
    const { doc, osc } = await getAccessibleDocument(req.user, req.params.id);
    if (!doc) return res.status(404).json({ message: 'Documento não encontrado.' });
    if (!osc) return res.status(403).json({ message: 'Acesso negado a este documento.' });

    // Token válido por 30 dias, assinado com o segredo real (sem fallback).
    const token = jwt.sign({ docId: doc.id }, config.JWT_SECRET, { expiresIn: '30d' });

    // Usa o host da própria requisição (com trust proxy) em vez de um localhost fixo.
    const baseUrl = process.env.PUBLIC_API_URL || `${req.protocol}://${req.get('host')}/api`;
    const publicUrl = `${baseUrl.replace(/\/+$/, '')}/documents/public/${token}`;

    res.json({ message: 'Link gerado com sucesso.', link: publicUrl });
  } catch (error) {
    console.error('Erro ao gerar link público:', error);
    res.status(500).json({ message: 'Erro ao gerar link de partilha.' });
  }
};

export const downloadPublicDocument = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) return res.status(400).send('Token inválido ou expirado.');

    let decoded;
    try {
      decoded = jwt.verify(token, config.JWT_SECRET);
    } catch (err) {
      return res.status(401).send('O link expirou ou é inválido.');
    }
    if (!decoded.docId) return res.status(401).send('O link expirou ou é inválido.');

    const [rows] = await pool.execute('SELECT saved_filename, original_name, mime_type FROM documents WHERE id = ?', [decoded.docId]);
    if (rows.length === 0) return res.status(404).send('Documento não encontrado no servidor.');

    const { saved_filename, original_name, mime_type } = rows[0];
    const filePath = resolveStoredFile(saved_filename);
    if (!filePath) return res.status(404).send('O arquivo físico não foi encontrado.');

    res.setHeader('Content-Type', mime_type || 'application/pdf');
    res.setHeader('Content-Disposition', contentDisposition('inline', original_name));
    return res.sendFile(filePath);
  } catch (error) {
    console.error('Erro ao processar download público:', error);
    res.status(500).send('Erro interno.');
  }
};

// --- estatísticas do novo dashboard ----------------------------------------------------
const monthIndex = (year, month) => year * 12 + (month - 1);
const fromIndex = (idx) => ({ year: Math.floor(idx / 12), month: (idx % 12) + 1 });

/**
 * GET /api/documents/stats
 * Query: months=6|12 | from=YYYY-MM&to=YYYY-MM | basis=upload|competencia | oscId | officeId (admin)
 * Escopo por perfil: OSC (a própria), Contador/ADM (escritório ou atribuídas), Admin (global).
 * Retorna somente dados reais; meses sem movimento vêm com count = 0.
 */
export const getDocumentStats = async (req, res) => {
  try {
    const now = new Date();
    const basis = req.query.basis === 'competencia' ? 'competencia' : 'upload';

    // Escopo de OSCs
    const scope = oscScope(req.user, 'o');
    const scopeSql = [scope.sql];
    const scopeParams = [...scope.params];
    if (req.query.oscId) { scopeSql.push('o.id = ?'); scopeParams.push(req.query.oscId); }
    if (req.query.officeId && isAdmin(req.user)) { scopeSql.push('o.office_id = ?'); scopeParams.push(req.query.officeId); }
    const scopeWhere = scopeSql.join(' AND ');

    // Janela do histórico
    let startIdx;
    let endIdx = monthIndex(now.getFullYear(), now.getMonth() + 1);
    const fromQ = /^(\d{4})-(\d{2})$/.exec(String(req.query.from || ''));
    const toQ = /^(\d{4})-(\d{2})$/.exec(String(req.query.to || ''));
    if (fromQ && toQ) {
      startIdx = monthIndex(Number(fromQ[1]), Number(fromQ[2]));
      endIdx = monthIndex(Number(toQ[1]), Number(toQ[2]));
      if (endIdx < startIdx) return res.status(400).json({ message: 'Período inválido.' });
      if (endIdx - startIdx > 35) return res.status(400).json({ message: 'O período máximo é de 36 meses.' });
    } else {
      const months = req.query.months === '12' ? 12 : 6;
      startIdx = endIdx - (months - 1);
    }
    const start = fromIndex(startIdx);
    const end = fromIndex(endIdx);

    // Coluna de agrupamento conforme a base de contagem
    const yearExpr = basis === 'upload' ? 'YEAR(d.created_at)' : 'd.ref_year';
    const monthExpr = basis === 'upload' ? 'MONTH(d.created_at)' : 'd.ref_month';
    const idxExpr = `(${yearExpr} * 12 + ${monthExpr} - 1)`;

    // 1) Histórico mensal
    const [historyRows] = await pool.execute(
      `SELECT ${yearExpr} AS y, ${monthExpr} AS m, COUNT(*) AS c,
              SUM(CASE WHEN d.status = 'CONCLUIDO' THEN 1 ELSE 0 END) AS concluded
         FROM documents d JOIN oscs o ON d.osc_id = o.id
        WHERE ${scopeWhere} AND ${REAL_DOC_SQL}
          AND ${idxExpr} BETWEEN ? AND ?
        GROUP BY y, m`,
      [...scopeParams, startIdx, endIdx]
    );
    const byIdx = new Map(historyRows.map(r => [monthIndex(Number(r.y), Number(r.m)), r]));
    const history = [];
    for (let idx = startIdx; idx <= endIdx; idx++) {
      const { year, month } = fromIndex(idx);
      const row = byIdx.get(idx);
      history.push({
        year, month,
        label: `${MONTH_LABELS[month - 1]}/${String(year).slice(-2)}`,
        count: row ? Number(row.c) : 0,
        concluded: row ? Number(row.concluded) : 0,
      });
    }

    // 2) Totais do mês corrente
    const currentIdx = monthIndex(now.getFullYear(), now.getMonth() + 1);
    const [totalRows] = await pool.execute(
      `SELECT COUNT(*) AS sent,
              SUM(CASE WHEN d.status = 'CONCLUIDO' THEN 1 ELSE 0 END) AS concluded
         FROM documents d JOIN oscs o ON d.osc_id = o.id
        WHERE ${scopeWhere} AND ${REAL_DOC_SQL} AND ${idxExpr} = ?`,
      [...scopeParams, currentIdx]
    );
    const sent = Number(totalRows[0]?.sent) || 0;
    const concluded = Number(totalRows[0]?.concluded) || 0;

    // 3) OSCs em escopo e pendências de competência (mesma regra do calendário da OSC)
    const [oscRows] = await pool.execute(
      `SELECT o.id, o.data_origem_estatuto, o.data_fundacao, o.created_at
         FROM oscs o WHERE ${scopeWhere}`,
      scopeParams
    );
    const year = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    let docMonths = new Map();
    if (oscRows.length > 0) {
      const [dm] = await pool.execute(
        `SELECT DISTINCT d.osc_id, d.ref_month
           FROM documents d JOIN oscs o ON d.osc_id = o.id
          WHERE ${scopeWhere} AND d.ref_year = ?`,
        [...scopeParams, year]
      );
      docMonths = dm.reduce((acc, r) => {
        if (!acc.has(r.osc_id)) acc.set(r.osc_id, new Set());
        acc.get(r.osc_id).add(Number(r.ref_month));
        return acc;
      }, new Map());
    }

    let oscsWithLate = 0;
    const lateMonthsByOsc = new Map();
    for (const osc of oscRows) {
      const late = computeLateMonths(osc, docMonths.get(osc.id) || new Set(), now);
      lateMonthsByOsc.set(osc.id, late);
      if (late.length > 0) oscsWithLate++;
    }

    const singleOsc = oscRows.length === 1 ? oscRows[0] : null;

    // 4) Documentos recentes
    const [recent] = await pool.execute(
      `SELECT d.id, d.original_name, d.status, d.doc_type, d.ref_month, d.ref_year, d.created_at,
              o.id AS osc_id, o.razao_social AS osc_name
         FROM documents d JOIN oscs o ON d.osc_id = o.id
        WHERE ${scopeWhere} AND ${REAL_DOC_SQL}
        ORDER BY d.created_at DESC LIMIT 5`,
      scopeParams
    );

    const reference = Number.parseInt(process.env.MONTHLY_DOC_REFERENCE, 10) || 20;

    res.json({
      scope: isOSC(req.user) ? 'osc' : (isAdmin(req.user) ? 'global' : 'office'),
      basis,
      period: { from: start, to: end },
      current: { year, month: currentMonth },
      // Referência operacional (≈ 20 lançamentos/mês), NÃO é um limite rígido.
      reference: { monthly: reference, isHardLimit: false },
      totals: { sent, inReview: Math.max(sent - concluded, 0), concluded },
      oscCount: oscRows.length,
      late: {
        oscsWithLate,
        lateMonths: singleOsc ? (lateMonthsByOsc.get(singleOsc.id) || []) : null,
      },
      history,
      recent,
    });
  } catch (error) {
    console.error('[getDocumentStats]', error);
    res.status(500).json({ message: 'Erro ao calcular as estatísticas de documentos.' });
  }
};
