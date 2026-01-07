import pool from '../config/db.js';
import { ROLES } from '../utils/constants.js';

/**
 * Busca todas as OSCs com o nome do contador associado. (Admin)
 */
export const findAllWithContador = async () => {
  const query = `
    SELECT
      o.id, u_osc.name, o.cnpj, o.responsible, u_osc.status,
      u_contador.name as contadorName
    FROM oscs o
    JOIN users u_osc ON o.id = u_osc.id
    LEFT JOIN users u_contador ON o.assigned_contador_id = u_contador.id
      AND u_contador.role = ?
    WHERE u_osc.role = ?
    ORDER BY u_osc.name ASC
  `;
  const [rows] = await pool.execute(query, [ROLES.CONTADOR, ROLES.OSC]);
  return rows;
};

/**
 * Busca OSCs associadas a um Contador específico. (Contador)
 */
export const findByContadorId = async (contadorId) => {
  const query = `
    SELECT
        o.id, u.name, o.cnpj, o.responsible, o.email, o.phone, o.address, u.status
    FROM oscs o
    JOIN users u ON o.id = u.id
    WHERE o.assigned_contador_id = ? AND u.role = ?
    ORDER BY u.name ASC
  `;
  const [rows] = await pool.execute(query, [contadorId, ROLES.OSC]);
  return rows;
};

/**
 * Busca uma OSC pelo seu ID (incluindo dados da tabela users).
 */
export const findById = async (id) => {
  const query = `
    SELECT
      o.id,
      u.name, 
      o.cnpj,
      o.razao_social,
      o.data_fundacao,
      o.responsible, 
      o.responsible_cpf, 
      o.email, 
      o.phone, 
      o.address, o.cep, o.numero, o.bairro, o.cidade, o.estado, o.pais,
      o.website, o.instagram,
      o.logotipo_path, o.ata_path, o.estatuto_path,
      u.email as login_email, 
      u.cpf as login_cpf, 
      u.phone as login_phone, 
      u.status,
      o.assigned_contador_id,
      u.role
    FROM oscs o
    JOIN users u ON o.id = u.id
    WHERE o.id = ? AND u.role = ?
  `;
  const [rows] = await pool.execute(query, [id, ROLES.OSC]);
  return rows[0] || null;
};

/**
 * Busca uma OSC pelo seu CNPJ.
 */
export const findByCnpj = async (cnpj) => {
  const [rows] = await pool.execute(
    'SELECT id, cnpj FROM oscs WHERE cnpj = ?',
    [cnpj]
  );
  return rows[0] || null;
};

/**
 * Cria uma nova OSC e o seu Utilizador.
 */
export const createOscAndUser = async (oscData, userData) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const userQuery = `
      INSERT INTO users (
        name, email, password_hash, role, status, cpf, phone
      ) VALUES (?, ?, ?, ?, 'Ativo', ?, ?)
    `;
    const [userResult] = await connection.execute(userQuery, [
      userData.name,          
      userData.email,         
      userData.password_hash,
      ROLES.OSC,
      userData.cpf || null,   
      userData.phone || null  
    ]);
    const newUserId = userResult.insertId;

    const oscQuery = `
      INSERT INTO oscs (
        id, cnpj, razao_social, data_fundacao, responsible, responsible_cpf,
        email, phone, address, cep, numero, bairro, cidade, estado, pais,
        website, instagram,
        assigned_contador_id,
        logotipo_path, ata_path, estatuto_path
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await connection.execute(oscQuery, [
      newUserId,
      oscData.cnpj,
      oscData.razao_social,
      oscData.data_fundacao || null, 
      oscData.responsible,
      oscData.responsible_cpf || null,
      oscData.email,
      oscData.phone,
      oscData.address,
      oscData.cep,
      oscData.numero,
      oscData.bairro,
      oscData.cidade,
      oscData.estado,
      oscData.pais || 'Brasil',
      oscData.website || null,   
      oscData.instagram || null, 
      oscData.assigned_contador_id,
      oscData.logotipo_path || null,
      oscData.ata_path || null,
      oscData.estatuto_path || null
    ]);

    await connection.commit();
    return await findById(newUserId);

  } catch (error) {
    await connection.rollback();
    console.error('Erro na transação createOscAndUser:', error);
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Atualiza uma OSC e o seu Utilizador associado.
 * --- VERSÃO CORRIGIDA (SEM LOOPS NO UPDATE DE USER) ---
 */
export const updateOscAndUser = async (oscId, updateData) => {
  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.execute('SELECT id FROM oscs WHERE id = ?', [oscId]);
    if (existing.length === 0) return null;

    await connection.beginTransaction();

    // 1. Atualiza a tabela 'oscs'
    const oscFieldsToUpdate = [];
    const oscParams = [];
    const allowedOscFields = [
        'razao_social', 'data_fundacao', 'responsible', 'responsible_cpf',
        'email', 'phone', 'address', 'cep', 'numero', 'bairro', 'cidade', 'estado', 'pais',
        'website', 'instagram', 'assigned_contador_id',
        'logotipo_path', 'ata_path', 'estatuto_path'
    ];

    allowedOscFields.forEach(field => {
        if (Object.prototype.hasOwnProperty.call(updateData, field) && updateData[field] !== undefined) {
            oscFieldsToUpdate.push(`${field} = ?`);
            oscParams.push(updateData[field]);
        }
    });

    if (oscFieldsToUpdate.length > 0) {
        oscParams.push(oscId);
        const oscQuery = `UPDATE oscs SET ${oscFieldsToUpdate.join(', ')} WHERE id = ?`;
        await connection.execute(oscQuery, oscParams);
    }

    // 2. Atualiza a tabela 'users' (CORREÇÃO DE SEGURANÇA)
    // Aqui fazemos manualmente para garantir que a coluna seja uma string fixa
    // e evitar o erro "Lucas bahia = ?"
    const userFieldsToUpdate = [];
    const userParams = [];
    
    // Verifica campo por campo explicitamente
    if (updateData.name !== undefined) {
        userFieldsToUpdate.push('name = ?'); 
        userParams.push(updateData.name);
    }
    if (updateData.login_email !== undefined) {
        userFieldsToUpdate.push('email = ?');
        userParams.push(updateData.login_email);
    }
    if (updateData.login_cpf !== undefined) {
        userFieldsToUpdate.push('cpf = ?');
        userParams.push(updateData.login_cpf);
    }
    if (updateData.login_phone !== undefined) {
        userFieldsToUpdate.push('phone = ?');
        userParams.push(updateData.login_phone);
    }
    if (updateData.status !== undefined) {
        userFieldsToUpdate.push('status = ?');
        userParams.push(updateData.status);
    }

    if (userFieldsToUpdate.length > 0) {
        userParams.push(oscId);
        // O role é fixo como OSC para segurança
        const userQuery = `UPDATE users SET ${userFieldsToUpdate.join(', ')} WHERE id = ? AND role = ?`;
        await connection.execute(userQuery, [...userParams, ROLES.OSC]);
    }

    await connection.commit();
    return await findById(oscId);

  } catch (error) {
    await connection.rollback();
    console.error('Erro na transação updateOscAndUser:', error);
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Associa uma OSC a um Contador.
 */
export const assignContador = async (oscId, contadorId) => {
  const [result] = await pool.execute(
    'UPDATE oscs SET assigned_contador_id = ? WHERE id = ?',
    [contadorId, oscId]
  );
  if (result.affectedRows === 0) return null;
  return await findById(oscId);
};

/**
 * Apaga uma OSC e o seu Utilizador.
 */
export const deleteOscAndUser = async (oscId) => {
  const [result] = await pool.execute(
    'DELETE FROM users WHERE id = ? AND role = ?',
    [oscId, ROLES.OSC]
  );
  return result.affectedRows > 0;
};

/**
 * Encontra o Contador associado a uma OSC.
 */
export const findContadorForOsc = async (oscId) => {
  const query = `
    SELECT u.id, u.name, u.email, u.role
    FROM users u
    JOIN oscs o ON u.id = o.assigned_contador_id
    WHERE o.id = ? AND u.role = ?
  `;
  const [rows] = await pool.execute(query, [oscId, ROLES.CONTADOR]);
  return rows[0] || null;
};

/**
 * Verifica se uma OSC está associada a um Contador.
 */
export const isOscAssignedToContador = async (oscId, contadorId) => {
  const [rows] = await pool.execute(
    'SELECT id FROM oscs WHERE id = ? AND assigned_contador_id = ?',
    [oscId, contadorId]
  );
  return rows.length > 0;
};

/**
 * Conta o número de OSCs ATIVAS.
 */
export const countActiveByContadorId = async (contadorId) => {
  const query = `
    SELECT COUNT(o.id) as count
    FROM oscs o
    JOIN users u ON o.id = u.id
    WHERE o.assigned_contador_id = ? AND u.status = 'Ativo' AND u.role = ?
  `;
  try {
    const [rows] = await pool.execute(query, [contadorId, ROLES.OSC]);
    return rows[0].count;
  } catch (error) {
    console.error('Erro em countActiveByContadorId:', error);
    throw new Error('Erro ao contar OSCs ativas.');
  }
};