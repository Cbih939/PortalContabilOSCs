// backend/src/models/document.model.js

import pool from '../config/db.js'; // Importa o pool de conexões MySQL
import { ROLES } from '../utils/constants.js';

/**
 * Busca todos os documentos relacionados às OSCs de um Contador.
 * @param {number} contadorId - O ID do utilizador (Contador).
 * @returns {Promise<Array>} Um array de objetos de documento.
 */
export const findDocsByContadorId = async (contadorId) => {
  const query = `
    SELECT
      d.id,
      d.original_name,
      d.created_at as date,
      u_osc.name as from_name, -- Nome da OSC que enviou (tabela users)
      u_sender.role as uploader_role -- Quem fez o upload
    FROM documents d
    JOIN oscs o ON d.osc_id = o.id
    JOIN users u_osc ON d.osc_id = u_osc.id -- JOIN para nome da OSC
    JOIN users u_sender ON d.uploaded_by_user_id = u_sender.id -- JOIN para saber quem enviou
    WHERE o.assigned_contador_id = ?
    ORDER BY d.created_at DESC
  `;
  const [rows] = await pool.execute(query, [contadorId]);
  // Ajusta o 'type' baseado em quem fez o upload
  return rows.map(row => ({
    ...row,
    // 'received' para o contador significa que a OSC enviou
    type: row.uploader_role === ROLES.OSC ? 'received' : 'sent',
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
      u_sender.role as uploader_role,
      u_sender.name as from_name -- Nome de quem enviou (Contador ou a própria OSC)
    FROM documents d
    JOIN users u_sender ON d.uploaded_by_user_id = u_sender.id
    WHERE d.osc_id = ?
    ORDER BY d.created_at DESC
  `;
  const [rows] = await pool.execute(query, [oscId]);
  // Ajusta 'type' e 'from' baseado em quem enviou
  return rows.map(row => ({
    ...row,
    type: row.uploader_role === ROLES.OSC ? 'sent' : 'received',
    from: row.from_name, // Nome já vem correto do JOIN
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
    from_name,
    to_name,
    to_contador_id // Adicionado
  } = docData;

  const query = `
    INSERT INTO documents
      (osc_id, uploaded_by_user_id, original_name, saved_filename, file_path, file_size_bytes, mime_type, from_name, to_name, to_contador_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await pool.execute(query, [
    osc_id, uploaded_by_user_id, original_name, saved_filename, file_path,
    file_size_bytes, mime_type, from_name, to_name, to_contador_id
  ]);

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
  const doc = await findDocById(fileId);
  if (!doc) return false;
  if (userRole === ROLES.ADMIN) return true;
  if (userRole === ROLES.OSC) return doc.osc_id === userId;
  if (userRole === ROLES.CONTADOR) {
    const [rows] = await pool.execute(
      'SELECT id FROM oscs WHERE id = ? AND assigned_contador_id = ?',
      [doc.osc_id, userId]
    );
    return rows.length > 0;
  }
  return false;
};


// --- NOVAS FUNÇÕES PARA O DASHBOARD DO CONTADOR ---

/**
 * Conta o número de documentos recebidos por um Contador (enviados pelas OSCs associadas).
 * (Poderia adicionar filtro por 'read_status' se existir)
 * @param {number} contadorId - O ID do utilizador (Contador).
 * @returns {Promise<number>} O número de documentos recebidos.
 */
export const countReceivedByContadorId = async (contadorId) => {
  const query = `
    SELECT COUNT(d.id) as count
    FROM documents d
    JOIN oscs o ON d.osc_id = o.id
    WHERE o.assigned_contador_id = ? AND d.uploaded_by_user_id = d.osc_id
    -- AND d.read_status = false -- Adicionar se existir
  `;
  try {
    const [rows] = await pool.execute(query, [contadorId]);
    return rows[0].count;
  } catch (error) {
    console.error('Erro em countReceivedByContadorId:', error);
    throw new Error('Erro ao contar documentos recebidos.');
  }
};

/**
 * Busca as últimas N atividades de documentos enviados por OSCs a um Contador.
 * (CORRIGIDO para buscar 'u.name' da tabela users)
 * @param {number} contadorId - O ID do utilizador (Contador).
 * @param {number} limit - O número máximo de atividades a retornar.
 * @returns {Promise<Array>} Um array de objetos representando a atividade.
 */
export const findRecentActivityByContadorId = async (contadorId, limit = 5) => {
  const query = `
    SELECT
      d.id,
      d.original_name,
      d.created_at,
      u.name as from_name -- Nome da OSC que enviou (da tabela users)
    FROM documents d
    JOIN oscs o ON d.osc_id = o.id
    JOIN users u ON d.osc_id = u.id -- JOIN adicional para nome da OSC/User
    WHERE o.assigned_contador_id = ? AND d.uploaded_by_user_id = d.osc_id AND u.role = '${ROLES.OSC}'
    ORDER BY d.created_at DESC
    LIMIT ?
  `;
  try {
    const [rows] = await pool.execute(query, [contadorId, limit]);
    return rows;
  } catch (error) {
    console.error('Erro em findRecentActivityByContadorId:', error);
    throw new Error('Erro ao buscar atividades recentes de documentos.');
  }
};