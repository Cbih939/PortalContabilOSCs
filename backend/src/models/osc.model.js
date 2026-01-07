// backend/src/models/osc.model.js

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
  console.log(`[Model findByContadorId] Recebido contadorId: ${contadorId}`);
  const query = `
    SELECT
        o.id, u.name, o.cnpj, o.responsible, o.email, o.phone, o.address, u.status
    FROM oscs o
    JOIN users u ON o.id = u.id
    WHERE o.assigned_contador_id = ? AND u.role = ?
    ORDER BY u.name ASC
  `;
  try {
      const [rows] = await pool.execute(query, [contadorId, ROLES.OSC]);
      console.log(`[Model findByContadorId] Query executada. Linhas encontradas: ${rows.length}`);
      return rows;
  } catch (error) {
      console.error('Erro em findByContadorId:', error);
      throw new Error('Erro ao buscar OSCs por contador.');
  }
};

/**
 * Busca uma OSC pelo seu ID (incluindo dados da tabela users).
 */
export const findById = async (id) => {
  const query = `
    SELECT
      o.id,
      u.name, -- Nome Fantasia (da tabela users)
      o.cnpj,
      o.razao_social,
      o.data_fundacao,
      o.responsible, -- Resp. Legal Nome
      o.responsible_cpf, -- Resp. Legal CPF
      o.email, -- Email de CONTACTO (da tabela oscs)
      o.phone, -- Telefone PRINCIPAL (da tabela oscs)
      o.address, o.cep, o.numero, o.bairro, o.cidade, o.estado, o.pais,
      o.website, o.instagram,
      o.logotipo_path, o.ata_path, o.estatuto_path,
      u.email as login_email, -- Email de LOGIN (Coordenador, da tabela users)
      u.cpf as login_cpf, -- CPF do Coordenador (da tabela users)
      u.phone as login_phone, -- Telefone do Coordenador (da tabela users)
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
 * Busca uma OSC pelo seu CNPJ (para validação).
 */
export const findByCnpj = async (cnpj) => {
  const [rows] = await pool.execute(
    'SELECT id, cnpj FROM oscs WHERE cnpj = ?',
    [cnpj]
  );
  return rows[0] || null;
};

/**
 * Cria uma nova OSC e o seu Utilizador (Coordenador) associado (Transação).
 * CORRIGIDO: Tratamento de campos opcionais para NULL.
 */
export const createOscAndUser = async (oscData, userData) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Cria o Utilizador (Coordenador)
    const userQuery = `
      INSERT INTO users (
        name, email, password_hash, role, status, cpf, phone
      ) VALUES (?, ?, ?, ?, 'Ativo', ?, ?)
    `;
    const [userResult] = await connection.execute(userQuery, [
      userData.name,          // coordNome ou Nome Fantasia
      userData.email,         // coordEmail
      userData.password_hash,
      ROLES.OSC,
      userData.cpf || null,   // coordCpf (Pode ser null)
      userData.phone || null  // coordTelefone (Pode ser null)
    ]);
    const newUserId = userResult.insertId;

    // 2. Cria o Registo da OSC
    const oscQuery = `
      INSERT INTO oscs (
        id, cnpj, razao_social, data_fundacao, responsible, responsible_cpf,
        email, phone, address, cep, numero, bairro, cidade, estado, pais,
        website, instagram,
        assigned_contador_id,
        logotipo_path, ata_path, estatuto_path
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    // AQUI ESTAVA O ERRO: Use || null em todos os campos opcionais
    await connection.execute(oscQuery, [
      newUserId,
      oscData.cnpj,
      oscData.razao_social,
      oscData.data_fundacao || null, // DATA pode vir vazia string, converte pra null
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
      oscData.website || null,   // Evita undefined
      oscData.instagram || null, // Evita undefined
      oscData.assigned_contador_id,
      oscData.logotipo_path || null,
      oscData.ata_path || null,
      oscData.estatuto_path || null
    ]);

    await connection.commit();
    return await findById(newUserId);

  } catch (error) {
    await connection.rollback();
    console.error('Erro na transação createOscAndUser (detalhada):', error);
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Atualiza uma OSC e o seu Utilizador associado (usando Transação).
 */
export const updateOscAndUser = async (oscId, updateData) => {
  const connection = await pool.getConnection();
  try {
    const exists = await findById(oscId);
    if (!exists) return null;

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
        if (updateData[field] !== undefined) {
            oscFieldsToUpdate.push(`${field} = ?`);
            oscParams.push(updateData[field]);
        }
    });

    if (oscFieldsToUpdate.length > 0) {
        oscParams.push(oscId);
        const oscQuery = `UPDATE oscs SET ${oscFieldsToUpdate.join(', ')} WHERE id = ?`;
        await connection.execute(oscQuery, oscParams);
    }

    // 2. Atualiza a tabela 'users'
    const userFieldsToUpdate = [];
    const userParams = [];
    
    // Mapeamento de campos do formulário para o banco
    const userFieldMap = {
        name: updateData.name, // Nome Fantasia
        login_email: 'email', // Mapeia login_email -> email
        login_cpf: 'cpf',     // Mapeia login_cpf -> cpf
        login_phone: 'phone', // Mapeia login_phone -> phone
        status: 'status'
    };
    
    // Iteramos sobre o objeto de mapeamento
    for (const [formKey, dbKey] of Object.entries(userFieldMap)) {
       // Se o valor direto do mapa for string (ex: 'email'), usamos ela como chave do banco
       // Se o valor for undefined no updateData, ignoramos
       const value = updateData[formKey];
       const column = typeof dbKey === 'string' ? dbKey : formKey; // Se dbKey não for string, usa a chave original

       if (value !== undefined) {
           userFieldsToUpdate.push(`${column} = ?`);
           userParams.push(value);
       }
    }

    // Caso especial para login_name se vier separado
    if (updateData.name !== undefined) {
       // Já tratado acima
    }

     if (userFieldsToUpdate.length > 0) {
        userParams.push(oscId);
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
 * Associa uma OSC a um Contador (Admin).
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
 * Apaga uma OSC e o seu Utilizador associado.
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
 * Conta o número de OSCs ATIVAS associadas a um Contador específico.
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