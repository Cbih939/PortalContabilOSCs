// backend/src/controllers/osc.controller.js

import * as OscModel from '../models/osc.model.js';
import * as UserModel from '../models/user.model.js';
import { ROLES } from '../utils/constants.js';
import { hashPassword } from '../utils/bcrypt.utils.js';

/**
 * @desc    Busca TODAS as OSCs (para o Admin).
 */
export const getAllOSCs = async (req, res) => {
  try {
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }
    const oscs = await OscModel.findAllWithContador();
    res.status(200).json(oscs);
  } catch (error) {
    console.error('Erro no controlador getAllOSCs:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * @desc    Busca as OSCs associadas ao Contador logado.
 */
export const getMyOSCs = async (req, res) => {
  try {
    const contadorId = req.user?.id;
    console.log(`[getMyOSCs] Buscando OSCs para o Contador ID: ${contadorId}`);
    if (req.user?.role !== ROLES.CONTADOR) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }
    if (!contadorId) {
        return res.status(401).json({ message: 'Não autorizado.' });
    }
    const oscs = await OscModel.findByContadorId(contadorId);
    console.log(`[getMyOSCs] OSCs encontradas pelo modelo: ${oscs?.length || 0}`);
    res.status(200).json(oscs);
  } catch (error) {
    console.error('Erro no controlador getMyOSCs:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * @desc    Busca os detalhes de uma OSC específica pelo ID.
 */
export const getOSCById = async (req, res) => {
  try {
    const { id: oscId } = req.params;
    const { id: userId, role: userRole } = req.user;

    const osc = await OscModel.findById(oscId);
    if (!osc) {
      return res.status(404).json({ message: 'OSC não encontrada.' });
    }
    
    let hasPermission = false;
    if (userRole === ROLES.ADMIN) hasPermission = true;
    else if (userRole === ROLES.CONTADOR) hasPermission = (Number(osc.assigned_contador_id) === Number(userId));
    else if (userRole === ROLES.OSC) hasPermission = (Number(osc.id) === Number(userId));

    if (!hasPermission) {
      return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para ver esta OSC.' });
    }

    res.status(200).json(osc);
  } catch (error) {
    console.error('Erro no controlador getOSCById:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * @desc    Cria uma nova OSC e um Utilizador associado (Formulário Detalhado).
 * @route   POST /api/oscs
 * @access  Privado (Contador, Admin)
 */
export const createOSC = async (req, res) => {
  try {
    if (req.user.role !== ROLES.CONTADOR && req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }
    const creatingContadorId = req.user.role === ROLES.CONTADOR ? req.user.id : null;
    
    // Todos os campos do formulário RHF
    const data = req.body;
    console.log('[CreateOSC] Dados recebidos:', data); // Log

    // 1. Validação (feita pelo Yup no frontend, mas verificações cruciais aqui)
    if (!data.nomeFantasia || !data.cnpj || !data.coordEmail || !data.coordSenha) {
      return res.status(400).json({ message: 'Nome Fantasia, CNPJ, Email do Coordenador e Senha são obrigatórios.' });
    }
    if (data.coordSenha.length < 8) {
        return res.status(400).json({ message: 'A senha do Coordenador deve ter no mínimo 8 caracteres.' });
    }

    // 2. Verifica duplicados
    const existingUser = await UserModel.findUserByEmail(data.coordEmail);
    if (existingUser) {
      return res.status(409).json({ message: 'O Email do Coordenador (login) já está em uso.' });
    }
    const existingOSC = await OscModel.findByCnpj(data.cnpj);
    if (existingOSC) {
      return res.status(409).json({ message: 'Este CNPJ já está registado.' });
    }

    // 3. Hash da senha do Coordenador
    const passwordHash = await hashPassword(data.coordSenha);

    // 4. Prepara os dados para os Modelos
    const userData = {
      name: data.coordNome || data.nomeFantasia, // Nome do Coordenador ou Nome Fantasia
      email: data.coordEmail,       // Email de LOGIN
      password_hash: passwordHash,
      cpf: data.coordCpf,
      phone: data.coordTelefone,
    };
    
    const oscData = {
      cnpj: data.cnpj,
      razao_social: data.razaoSocial,
      data_fundacao: data.dataFundacao || null, // Garante NULL se vazio
      responsible: data.respNome,
      responsible_cpf: data.respCpf,
      email: data.emailContato,     // Email de CONTACTO
      phone: data.telefone,         // Telefone PRINCIPAL
      address: data.endereco,
      cep: data.cep,
      numero: data.numero,
      bairro: data.bairro,
      cidade: data.cidade,
      estado: data.estado,
      pais: data.pais || 'Brasil',
      website: data.website,
      instagram: data.instagram,
      assigned_contador_id: creatingContadorId,
      // (Faltam os uploads de ficheiro)
    };

    // 5. O Modelo 'createOscAndUser' usa TRANSAÇÃO
    const newOSC = await OscModel.createOscAndUser(oscData, userData);
    console.log('[CreateOSC] OSC criada com sucesso:', newOSC.id);

    res.status(201).json(newOSC);
  } catch (error) {
    console.error('Erro no controlador createOSC (detalhado):', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email de login ou CNPJ já existe.' });
    }
    res.status(500).json({ message: 'Erro interno do servidor ao criar OSC.' });
  }
};

/**
 * @desc    Atualiza os dados de uma OSC (Perfil).
 */
export const updateOSC = async (req, res) => {
  try {
    const { id: oscId } = req.params;
    const { id: userId, role: userRole } = req.user;
    const updateData = req.body;

    const osc = await OscModel.findById(oscId);
    if (!osc) {
      return res.status(404).json({ message: 'OSC não encontrada.' });
    }
    
    let hasPermission = false;
    if (userRole === ROLES.ADMIN) hasPermission = true;
    else if (userRole === ROLES.CONTADOR) hasPermission = (Number(osc.assigned_contador_id) === Number(userId));
    else if (userRole === ROLES.OSC) hasPermission = (Number(osc.id) === Number(userId));

    if (!hasPermission) {
      return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para editar esta OSC.' });
    }

    // Regras de negócio
    if (userRole !== ROLES.ADMIN) {
        delete updateData.assigned_contador_id; // Só Admin pode reatribuir
    }
    if (userRole === ROLES.OSC) {
        delete updateData.status; // OSC não pode mudar o próprio status
        delete updateData.cnpj; // OSC não pode mudar o próprio CNPJ
    }
    
    const updatedOSC = await OscModel.updateOscAndUser(oscId, updateData);
    if (!updatedOSC) { // Caso update falhe no modelo
         return res.status(404).json({ message: 'OSC não encontrada durante a atualização.' });
    }

    res.status(200).json(updatedOSC);
  } catch (error) {
    console.error('Erro no controlador updateOSC:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email de login ou CNPJ já existe.' });
    }
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * @desc    Associa (ou re-associa) uma OSC a um Contador.
 */
export const assignContador = async (req, res) => {
  try {
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }
    const { id: oscId } = req.params;
    const { contadorId } = req.body;

    if (!contadorId) {
      return res.status(400).json({ message: 'O ID do Contador (contadorId) é obrigatório.' });
    }
    
    const contadorUser = await UserModel.findUserById(contadorId);
    if (!contadorUser || contadorUser.role !== ROLES.CONTADOR) {
        return res.status(404).json({ message: 'Contador não encontrado ou inválido.'});
    }

    const updatedOSC = await OscModel.assignContador(oscId, contadorId);
    if (!updatedOSC) {
      return res.status(404).json({ message: 'OSC não encontrada.' });
    }

    res.status(200).json({ message: 'Contador associado com sucesso.', osc: updatedOSC });
  } catch (error) {
    console.error('Erro no controlador assignContador:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * @desc    Apaga uma OSC e o seu utilizador associado.
 */
export const deleteOSC = async (req, res) => {
  try {
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }
    const { id: oscId } = req.params;

    const success = await OscModel.deleteOscAndUser(oscId);
    if (!success) {
        return res.status(404).json({ message: 'OSC não encontrada.' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Erro no controlador deleteOSC:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};