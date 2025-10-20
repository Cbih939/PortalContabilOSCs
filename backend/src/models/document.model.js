// backend/src/models/document.model.js

import pool from '../config/db.js'; // Importa o pool de conexões MySQL
import { ROLES } from '../utils/constants.js';

/**
 * Busca todos os documentos relacionados às OSCs de um Contador.
 * @param {number} contadorId - O ID do utilizador (Contador).
 * @returns {Promise<Array>} Um array de objetos de documento.
 */
export const findDocsByContadorId = async (contadorId) => {
  // Esta query busca todos os documentos (d) onde a OSC (o)
  // está associada ao contadorId.
  // Também junta (JOIN) o utilizador que fez o upload (u)
  // para que o frontend possa saber quem enviou.
  const query = `
    SELECT 
      d.id,
      d.original_name,
      d.created_at as date, 
      o.name as from_name,
      u.role as uploader_role
    FROM documents d
    JOIN oscs o ON d.osc_id = o.id
    JOIN users u ON d.uploaded_by_user_id = u.id
    WHERE o.assigned_contador_id = ?
    ORDER BY d.created_at DESC
  `;
  const [rows] = await pool.execute(query, [contadorId]);
  
  // (Lógica para corresponder ao mock 'type: "sent"'/'type: "received"')
  return rows.map(row => ({
    ...row,
    // Se quem fez o upload foi o Contador, foi 'sent' (pelo Contador)
    // Se quem fez o upload foi a OSC, foi 'received' (pelo Contador)
    type: row.uploader_role === ROLES.CONTADOR ? 'sent' : 'received',
  }));
};

/**
 * Busca todos os documentos (enviados e recebidos) de uma OSC.
 * @param {number} oscId - O ID da OSC (que também é um user.id).
 * @returns {Promise<Array>} Um array de objetos de documento.
 */
export const findDocsByOscId = async (oscId) => {
  const query = `
    SELECT 
      d.id,
      d.original_name as name,
      d.created_at as date,
      u.role as uploader_role,
      u.name as from_name,
      o.name as osc_name
    FROM documents d
    JOIN users u ON d.uploaded_by_user_id = u.id
    JOIN oscs o ON d.osc_id = o.id
    WHERE d.osc_id = ?
    ORDER BY d.created_at DESC
  `;
  const [rows] = await pool.execute(query, [oscId]);

  // (Lógica para corresponder ao mock 'type: "sent"'/'type: "received"')
  return rows.map(row => ({
    ...row,
    // Se quem fez o upload foi a OSC, foi 'sent' (pela OSC)
    // Se quem fez o upload foi o Contador, foi 'received' (pela OSC)
    type: row.uploader_role === ROLES.OSC ? 'sent' : 'received',
    // O 'from' do protótipo
    from: row.uploader_role === ROLES.OSC ? row.osc_name : row.from_name
  }));
};

/**
 * Busca um único documento pelo seu ID.
 * @param {number} fileId - O ID do documento.
 * @returns {Promise<object | null>} O objeto do documento ou null.
 */
export const findDocById = async (fileId) => {
  const [rows] = await pool.execute(
    'SELECT * FROM documents WHERE id = ?',
    [fileId]
  );
  return rows[0] || null;
};

/**
 * Cria um novo registo de documento no banco de dados.
 * @param {object} docData - Os dados a serem inseridos.
 * @returns {Promise<object>} O novo objeto de documento criado.
 */
export const createDocumentRecord = async (docData) => {
  const {
    osc_id,
    uploaded_by_user_id,
    original_name,
    saved_filename,
    file_path,
    file_size_bytes,
    mime_type,
    from_name, // (Campo do protótipo)
    to_name    // (Campo do protótipo)
  } = docData;

  const query = `
    INSERT INTO documents 
      (osc_id, uploaded_by_user_id, original_name, saved_filename, file_path, file_size_bytes, mime_type, from_name, to_name) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const [result] = await pool.execute(query, [
    osc_id,
    uploaded_by_user_id,
    original_name,
    saved_filename,
    file_path,
    file_size_bytes,
    mime_type,
    from_name,
    to_name
  ]);

  // Retorna o documento recém-criado
  return await findDocById(result.insertId);
};

/**
 * (Segurança) Verifica se um utilizador tem permissão para aceder a um ficheiro.
 * @param {number} fileId - O ID do ficheiro.
 * @param {number} userId - O ID do utilizador que está a pedir.
 * @param {string} userRole - O perfil (role) do utilizador.
 * @returns {Promise<boolean>} True se tiver permissão, false se não.
 */
export const checkPermission = async (fileId, userId, userRole) => {
  // 1. Busca o documento (especificamente o seu 'osc_id')
  const doc = await findDocById(fileId);
  if (!doc) {
    return false; // Ficheiro não existe
  }

  // 2. Admin pode ver tudo
  if (userRole === ROLES.ADMIN) {
    return true;
  }

  // 3. OSC pode ver se o 'osc_id' do documento for o seu próprio 'id'
  if (userRole === ROLES.OSC) {
    return doc.osc_id === userId;
  }

  // 4. Contador pode ver se o 'osc_id' do documento
  //    pertence a uma OSC que lhe está associada.
  if (userRole === ROLES.CONTADOR) {
    const [rows] = await pool.execute(
      'SELECT id FROM oscs WHERE id = ? AND assigned_contador_id = ?',
      [doc.osc_id, userId]
    );
    return rows.length > 0; // Se encontrar (rows.length = 1), tem permissão
  }

  // Se não for nenhum dos acima, nega
  return false;
};