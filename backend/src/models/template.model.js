// backend/src/models/template.model.js

import pool from '../config/db.js'; // Importa o pool de conexões MySQL

/**
 * Busca todos os ficheiros de modelo disponíveis.
 * (Usado pela OSC e Contador para listar os downloads)
 * @returns {Promise<Array>} Um array de objetos de modelo.
 */
export const findAll = async () => {
  const query = `
    SELECT 
      id, 
      file_name,   -- Nome de exibição (ex: "Modelo de Controle Financeiro")
      description, -- Nome real do ficheiro (ex: "modelo_financeiro.xlsx")
      created_at
    FROM templates
    ORDER BY file_name ASC
  `;
  try {
    const [rows] = await pool.execute(query);
    return rows;
  } catch (error) {
    console.error('Erro em TemplateModel.findAll:', error);
    throw new Error('Erro ao buscar modelos no banco de dados.');
  }
};

/**
 * Busca um único modelo pelo seu ID.
 * (Usado para download e delete, para obter o caminho do ficheiro)
 * @param {number} id - O ID do modelo.
 * @returns {Promise<object | null>} O objeto do modelo ou null.
 */
export const findById = async (id) => {
  const query = 'SELECT * FROM templates WHERE id = ?';
  try {
    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
  } catch (error) {
    console.error('Erro em TemplateModel.findById:', error);
    throw new Error('Erro ao buscar modelo por ID.');
  }
};

/**
 * Cria um novo registo de modelo no banco de dados.
 * (Usado pelo Contador após o upload)
 * @param {object} templateData - Dados do ficheiro (nome, caminho, etc.)
 * @returns {Promise<object>} O novo objeto de modelo criado.
 */
export const create = async (templateData) => {
  const {
    file_name,
    description,
    saved_filename,
    file_path,
    mime_type,
    file_size_bytes,
    uploaded_by_contador_id
  } = templateData;

  const query = `
    INSERT INTO templates 
      (file_name, description, saved_filename, file_path, mime_type, file_size_bytes, uploaded_by_contador_id) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  try {
    const [result] = await pool.execute(query, [
      file_name,
      description,
      saved_filename,
      file_path,
      mime_type,
      file_size_bytes,
      uploaded_by_contador_id
    ]);
    return await findById(result.insertId);
  } catch (error) {
    console.error('Erro em TemplateModel.create:', error);
    throw new Error('Erro ao salvar registo do modelo no banco de dados.');
  }
};

/**
 * Apaga um registo de modelo do banco de dados.
 * (Usado pelo Contador)
 * @param {number} id - O ID do modelo a ser apagado.
 * @returns {Promise<boolean>} True se foi apagado, false se não encontrado.
 */
export const deleteById = async (id) => {
  const query = 'DELETE FROM templates WHERE id = ?';
  try {
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Erro em TemplateModel.deleteById:', error);
    throw new Error('Erro ao apagar registo do modelo.');
  }
};