import pool from '../config/db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const UPLOADS_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../uploads');
const INLINE_SAFE = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.webp']);

/**
 * Resolve o arquivo físico de um registro de public_files. Aceita os formatos antigos do banco
 * (caminho relativo, com barras invertidas ou absoluto) e procura em uploads/ e uploads/public/.
 */
const resolvePublicFile = (storedPath) => {
  const normalized = String(storedPath || '').replace(/\\/g, '/');
  const rel = normalized.includes('uploads/') ? normalized.split('uploads/').pop() : normalized;
  const candidates = [rel, path.basename(rel), path.join('public', path.basename(rel))];
  for (const candidate of candidates) {
    const full = path.resolve(UPLOADS_ROOT, candidate);
    if (full.startsWith(UPLOADS_ROOT + path.sep) && fs.existsSync(full) && fs.statSync(full).isFile()) return full;
  }
  return null;
};

/**
 * Entrega o arquivo (ou a capa) de um item da biblioteca/modelos. Só serve arquivos
 * cadastrados em public_files; os documentos contábeis continuam privados.
 */
export const serveFile = async (req, res) => {
  try {
    const kind = req.params.kind === 'cover' ? 'cover_path' : 'file_path';
    const [rows] = await pool.execute(`SELECT title, ${kind} AS stored FROM public_files WHERE id = ?`, [req.params.id]);
    const full = rows[0]?.stored ? resolvePublicFile(rows[0].stored) : null;
    if (!full) return res.status(404).json({ message: 'Arquivo não encontrado.' });

    const ext = path.extname(full).toLowerCase();
    const inline = INLINE_SAFE.has(ext) && req.query.download !== '1';
    const name = `${rows[0].title || 'arquivo'}${path.extname(String(rows[0].title || '')) ? '' : ext}`;
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Content-Disposition', `${inline ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(name)}`);
    if (ext === '.pdf') res.type('application/pdf');
    return res.sendFile(full);
  } catch (error) {
    console.error('Erro ao servir arquivo público:', error);
    return res.status(500).json({ message: 'Erro ao abrir o arquivo.' });
  }
};



// Listar arquivos
export const getFiles = async (req, res) => {
  try {
    const { category } = req.query;
    let query = '';
    let params = [];

    if (category) {
      query = `SELECT id, title, file_path, cover_path, category, created_at, ebook_category FROM public_files WHERE category = ? ORDER BY created_at DESC`;
      params = [category];
    } else {
      query = `SELECT id, title, file_path, cover_path, category, created_at, ebook_category FROM public_files ORDER BY created_at DESC`;
    }

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar arquivos:', error);
    res.status(500).json({ message: 'Erro ao buscar arquivos.' });
  }
};

// --- UPLOAD INTELIGENTE (Detecta PDF, Word e Imagem automaticamente) ---
export const uploadFile = async (req, res) => {
  try {
    console.log('[Upload] Iniciando processamento inteligente...');
    
    // Com upload.any(), req.files é sempre um ARRAY de arquivos
    const files = req.files || [];
    
    // 1. Procura o documento principal (PDF ou formatos Word)
    const documentFile = files.find(f => 
      f.mimetype === 'application/pdf' || 
      f.mimetype === 'application/msword' || 
      f.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );

    // 2. Procura a Capa (qualquer arquivo que comece com 'image/')
    const coverFile = files.find(f => f.mimetype.startsWith('image/'));

    if (!documentFile) {
      console.error('[Upload] Erro: Nenhum documento (PDF ou Word) encontrado.');
      return res.status(400).json({ 
          message: 'É obrigatório enviar um arquivo PDF ou Word.',
          received_files: files.map(f => `${f.fieldname} (${f.mimetype})`)
      });
    }

    const { title, category, ebook_category } = req.body;
    
    // Prepara os caminhos
    const filePath = documentFile.path;
    const coverPath = coverFile ? coverFile.path : null;

    console.log(`[Upload] Salvando: ${title || documentFile.originalname}`);
    console.log(`[Upload] Arquivo: ${filePath}`);
    console.log(`[Upload] Capa: ${coverPath || 'Sem capa'}`);
    console.log(`[Upload] Categoria: ${category}`);
    console.log(`[Upload] Ebook Sub: ${ebook_category || 'N/A'}`);

    // Salva no Banco
    const [result] = await pool.execute(
      `INSERT INTO public_files (title, file_path, cover_path, category, ebook_category, created_at) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        title || documentFile.originalname, 
        filePath, 
        coverPath, 
        category, 
        // Se for BIBLIOTECA usa a subcategoria, se não, salva null
        category === 'BIBLIOTECA' ? (ebook_category || null) : null 
      ]
    );

    res.status(201).json({ 
      message: 'Upload realizado com sucesso!', 
      id: result.insertId 
    });

  } catch (error) {
    console.error('[Upload] Erro Interno:', error);
    res.status(500).json({ message: 'Erro ao salvar arquivo no banco.' });
  }
};

// Deletar arquivo
export const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM public_files WHERE id = ?', [id]);
    res.json({ message: 'Arquivo removido com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    res.status(500).json({ message: 'Erro ao deletar arquivo.' });
  }
};