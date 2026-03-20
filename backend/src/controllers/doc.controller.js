import pool from '../config/db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { logAction } from '../services/logger.service.js'; // 🕵️‍♂️ Espião importado!

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getDocuments = async (req, res) => {
  try {
    const { oscId, year } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = `
      SELECT d.*, 
             d.created_at as createdAt, 
             o.razao_social as osc_name,
             p.name as project_name 
      FROM documents d
      INNER JOIN oscs o ON d.osc_id = o.id
      LEFT JOIN projects p ON d.project_id = p.id
    `;
    
    const params = [];
    const conditions = [];

    if (userRole === 'Contador') {
      conditions.push('o.assigned_contador_id = ?');
      params.push(userId);
    } else {
      conditions.push('o.user_id = ?');
      params.push(userId);
    }

    if (oscId) { conditions.push('d.osc_id = ?'); params.push(oscId); }
    if (year) { conditions.push('d.ref_year = ?'); params.push(year); }

    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY d.ref_year DESC, d.ref_month DESC, d.created_at DESC';

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao carregar documentos das OSCs.' });
  }
};

export const getReceivedDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const query = `
      SELECT d.*, u.name as sender_name, o.razao_social
      FROM documents d
      JOIN oscs o ON d.osc_id = o.id
      JOIN users u ON d.uploaded_by_user_id = u.id
      WHERE o.assigned_contador_id = ?
      ORDER BY d.created_at DESC
    `;
    const [rows] = await pool.execute(query, [userId]);
    
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
    res.status(500).json({ message: 'Erro ao buscar documentos recebidos.' });
  }
}

export const uploadDocument = async (req, res) => {
  try {
    let { osc_id, doc_type, ref_month, ref_year, project_id } = req.body;
    const file = req.file;
    const userId = req.user.id;

    if (!file) return res.status(400).json({ message: 'Nenhum arquivo enviado.' });

    if (!osc_id || osc_id === 'undefined' || osc_id === 'null') {
      const [oscRows] = await pool.execute('SELECT id FROM oscs WHERE user_id = ?', [userId]);
      if (oscRows.length > 0) osc_id = oscRows[0].id;
      else return res.status(404).json({ message: 'Perfil de OSC não encontrado.' });
    }

    const parsedProjectId = (project_id && project_id !== 'null' && project_id !== 'undefined' && project_id !== '') ? parseInt(project_id) : null;

    const query = `
      INSERT INTO documents 
      (osc_id, project_id, original_name, saved_filename, file_path, doc_type, ref_month, ref_year, status, uploaded_by_user_id, file_size_bytes, mime_type) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await pool.execute(query, [
      osc_id, parsedProjectId, file.originalname, file.filename, file.path, doc_type, ref_month, ref_year, 'PENDENTE', userId, file.size || 0, file.mimetype || 'application/pdf'
    ]);

    // 🔴 ESPIÃO LIGADO: Grava o Upload!
    await logAction(userId, req.user.name, osc_id, 'CRIOU', 'DOCUMENTO', `Enviou o documento: ${file.originalname} (Mês: ${ref_month}/${ref_year})`);

    res.status(201).json({ message: 'Documento enviado com sucesso!' });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno ao salvar documento.' });
  }
};

export const markMonthAsConcluded = async (req, res) => {
  try {
    const { oscId, month, year } = req.body;
    if (!oscId || !month || !year) return res.status(400).json({ message: 'OSC, Mês e Ano de referência são obrigatórios.' });

    const [result] = await pool.execute(
      `UPDATE documents SET status = 'CONCLUIDO' WHERE osc_id = ? AND doc_type = 'MENSAL' AND ref_month = ? AND ref_year = ?`,
      [oscId, month, year]
    );

    // 🔴 ESPIÃO LIGADO: Grava a Conclusão!
    await logAction(req.user.id, req.user.name, oscId, 'APROVOU', 'DOCUMENTO', `Marcou o mês ${month}/${year} como CONCLUÍDO.`);

    res.json({ message: `Mês ${month}/${year} concluído com sucesso.`, updatedRows: result.affectedRows });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno ao concluir mês.' });
  }
};

export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT saved_filename, original_name, mime_type FROM documents WHERE id = ?', [id]);
    
    if (rows.length === 0) return res.status(404).json({ message: 'Documento não encontrado.' });

    const { saved_filename, original_name, mime_type } = rows[0];
    const cleanFileName = saved_filename.replace('uploads/', '').replace('public/', '').replace(/^\/+/, '');
    
    let filePath = path.resolve(__dirname, '../../uploads', cleanFileName);
    if (!fs.existsSync(filePath)) filePath = path.resolve(__dirname, '../../uploads/public', cleanFileName);

    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', mime_type || 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${original_name}"`);
      return res.sendFile(filePath);
    } else {
      return res.status(404).json({ message: 'Arquivo físico não encontrado no disco.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro ao processar o documento.' });
  }
};

export const markConclusoTec = async (req, res) => {
  try {
    const { osc_id, month, year } = req.body;
    const userId = req.user.id;
    if (!osc_id || !year) return res.status(400).json({ message: "OSC e Ano são obrigatórios." });

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

    // 🔴 ESPIÃO LIGADO!
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

    await pool.execute(`DELETE FROM documents WHERE osc_id = ? AND doc_type = 'CONCLUSO TEC' AND ref_month = ? AND ref_year = ?`, [oscId, month, year]);

    const [result] = await pool.execute(`UPDATE documents SET status = 'PENDENTE' WHERE osc_id = ? AND ref_month = ? AND ref_year = ? AND doc_type != 'CONCLUSO TEC'`, [oscId, month, year]);

    // 🔴 ESPIÃO LIGADO: Grava a reversão para pendente!
    await logAction(req.user.id, req.user.name, oscId, 'EDITOU', 'DOCUMENTO', `Reverteu o mês ${month}/${year} para PENDENTE.`);

    res.json({ message: `Mês ${month}/${year} marcado como PENDENTE.`, updatedRows: result.affectedRows });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno ao reverter status.' });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Puxa o nome e a osc antes de apagar para o espião saber o que foi apagado
    const [rows] = await pool.execute('SELECT osc_id, original_name, saved_filename FROM documents WHERE id = ?', [id]);
    
    if (rows.length > 0) {
      if (rows[0].saved_filename !== 'none' && !rows[0].saved_filename.startsWith('tec_virtual')) {
        const filePath = path.resolve(__dirname, '../../uploads', rows[0].saved_filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
      
      await pool.execute('DELETE FROM documents WHERE id = ?', [id]);
      
      // 🔴 ESPIÃO LIGADO: Grava a Exclusão!
      await logAction(req.user.id, req.user.name, rows[0].osc_id, 'EXCLUIU', 'DOCUMENTO', `Removeu o ficheiro: ${rows[0].original_name}`);
    }

    res.json({ message: 'Documento excluído com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir o documento.' });
  }
};