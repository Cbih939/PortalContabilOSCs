import pool from '../config/db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Listar Documentos
export const getDocuments = async (req, res) => {
  try {
    const { oscId, status } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = `
      SELECT 
        d.id, 
        d.original_name as title, 
        d.mime_type as type, 
        d.created_at, 
        d.status,
        d.file_path,
        o.razao_social as osc_name,
        o.cnpj as osc_cnpj
      FROM documents d
      LEFT JOIN oscs o ON d.osc_id = o.id
    `;
    
    const params = [];
    const conditions = [];

    // Filtros de Permissão
    if (userRole === 'OSC') {
      // Se for OSC, vê os documentos vinculados à sua OSC
      const [osc] = await pool.execute('SELECT id FROM oscs WHERE user_id = ?', [userId]);
      if (osc.length === 0) return res.json([]); 
      
      conditions.push('d.osc_id = ?');
      params.push(osc[0].id);
    } 
    else if (userRole === 'Contador') {
      // Se for Contador, vê documentos das OSCs que ele atende
      conditions.push('o.assigned_contador_id = ?');
      params.push(userId);
    }

    // Filtros de Interface
    if (oscId) {
      conditions.push('d.osc_id = ?');
      params.push(oscId);
    }
    if (status) {
      conditions.push('d.status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY d.created_at DESC';

    const [rows] = await pool.execute(query, params);
    res.json(rows);

  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    res.status(500).json({ message: 'Erro ao listar documentos.' });
  }
};

// Upload de Documento
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum ficheiro enviado.' });
    }

    const { oscId } = req.body;
    let targetOscId = oscId;

    // Se quem envia é a OSC, pega o ID dela automaticamente
    if (req.user.role === 'OSC') {
        const [osc] = await pool.execute('SELECT id FROM oscs WHERE user_id = ?', [req.user.id]);
        if (osc.length > 0) targetOscId = osc[0].id;
    }

    if (!targetOscId) {
        return res.status(400).json({ message: 'OSC não identificada.' });
    }

    // Inserção alinhada com o seu Banco de Dados
    const [result] = await pool.execute(
      `INSERT INTO documents 
      (osc_id, uploaded_by_user_id, original_name, saved_filename, file_path, file_size_bytes, mime_type, status, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, 'Pendente', NOW())`,
      [
        targetOscId,
        req.user.id,
        req.file.originalname, // original_name
        req.file.filename,     // saved_filename
        req.file.filename,     // file_path (geralmente salva só o nome ou caminho relativo)
        req.file.size,         // file_size_bytes
        req.file.mimetype      // mime_type
      ]
    );

    res.status(201).json({ 
        id: result.insertId, 
        message: 'Documento enviado com sucesso.' 
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ message: 'Falha ao salvar documento no banco.' });
  }
};

// Download
export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT saved_filename, original_name FROM documents WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Documento não encontrado.' });
    }

    // Ajuste o caminho conforme sua estrutura de pastas
    const filePath = path.join(__dirname, '../../uploads', rows[0].saved_filename);

    if (fs.existsSync(filePath)) {
      res.download(filePath, rows[0].original_name);
    } else {
      res.status(404).json({ message: 'Arquivo físico não encontrado.' });
    }
  } catch (error) {
    console.error('Erro download:', error);
    res.status(500).json({ message: 'Erro ao baixar arquivo.' });
  }
};

// Deletar
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    // Primeiro buscar o nome do arquivo para deletar do disco
    const [rows] = await pool.execute('SELECT saved_filename FROM documents WHERE id = ?', [id]);
    
    if (rows.length > 0) {
        const filePath = path.join(__dirname, '../../uploads', rows[0].saved_filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await pool.execute('DELETE FROM documents WHERE id = ?', [id]);
    res.json({ message: 'Documento excluído.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao excluir.' });
  }
};

// Atualizar Status (Aprovar/Rejeitar)
export const updateDocumentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'Aprovado' ou 'Rejeitado'

        await pool.execute('UPDATE documents SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: `Documento ${status} com sucesso.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar status.' });
    }
};