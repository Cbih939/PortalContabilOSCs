// backend/src/controllers/osc.controller.js

// Importa os modelos de dados
import * as OscModel from '../models/osc.model.js';
import * as UserModel from '../models/user.model.js'; // Necessário para criar/atualizar utilizadores OSC

// Importa utilitários
import { ROLES } from '../utils/constants.js';
import { hashPassword } from '../utils/bcrypt.utils.js';

/**
 * @desc    Busca TODAS as OSCs (para o Admin).
 * @route   GET /api/oscs
 * @access  Privado (Admin)
 */
export const getAllOSCs = async (req, res) => {
  try {
    // (A rota deve ser protegida para ROLES.ADMIN)
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }
    
    // O modelo deve juntar (JOIN) com a tabela de 'users' (Contadores)
    // para obter o 'nome_do_contador_associado'
    const oscs = await OscModel.findAllWithContador();
    res.status(200).json(oscs);
  } catch (error) {
    console.error('Erro no controlador getAllOSCs:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * @desc    Busca as OSCs associadas ao Contador logado.
 * @route   GET /api/oscs/my
 * @access  Privado (Contador)
 */
export const getMyOSCs = async (req, res) => {
  try {
    // (A rota deve ser protegida para ROLES.CONTADOR)
    const contadorId = req.user.id;
    if (req.user.role !== ROLES.CONTADOR) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }

    const oscs = await OscModel.findByContadorId(contadorId);
    res.status(200).json(oscs);
  } catch (error) {
    console.error('Erro no controlador getMyOSCs:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * @desc    Busca os detalhes de uma OSC específica pelo ID.
 * @route   GET /api/oscs/:id
 * @access  Privado (Admin, ou Contador/OSC associada)
 */
export const getOSCById = async (req, res) => {
  try {
    const { id: oscId } = req.params;
    const { id: userId, role: userRole } = req.user;

    const osc = await OscModel.findById(oscId);
    if (!osc) {
      return res.status(404).json({ message: 'OSC não encontrada.' });
    }

    // --- Verificação de Permissão ---
    let hasPermission = false;
    if (userRole === ROLES.ADMIN) {
      hasPermission = true;
    } else if (userRole === ROLES.CONTADOR) {
      // O Contador pode ver se a OSC estiver associada a ele
      hasPermission = osc.assigned_contador_id === userId;
    } else if (userRole === ROLES.OSC) {
      // A OSC pode ver o seu próprio perfil
      hasPermission = osc.id === userId;
    }

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
 * @desc    Cria uma nova OSC e um Utilizador associado a ela.
 * @route   POST /api/oscs
 * @access  Privado (Contador, Admin)
 * @body    { name, cnpj, responsible, email, phone, address, password }
 */
export const createOSC = async (req, res) => {
  try {
    // Apenas Contadores (ou Admins) podem criar OSCs
    if (req.user.role !== ROLES.CONTADOR && req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }
    
    // O ID do Contador que está a criar (se for um Admin, pode ser 'null')
    const creatingContadorId = req.user.role === ROLES.CONTADOR ? req.user.id : null;

    const { name, cnpj, responsible, email, phone, address, password } = req.body;

    // 1. Validação de entrada
    if (!name || !cnpj || !email || !password) {
      return res.status(400).json({ message: 'Nome, CNPJ, Email e Senha são obrigatórios.' });
    }

    // 2. Verifica duplicados (Email e CNPJ)
    const existingUser = await UserModel.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'Este email já está em uso.' });
    }
    const existingOSC = await OscModel.findByCnpj(cnpj);
    if (existingOSC) {
      return res.status(409).json({ message: 'Este CNPJ já está registado.' });
    }

    // 3. Hash da senha
    const passwordHash = await hashPassword(password);

    // 4. Prepara os dados (isto deve ser executado numa Transação no Modelo)
    const userData = {
      name, // O nome do utilizador será o nome da OSC
      email,
      password_hash: passwordHash,
      role: ROLES.OSC,
      // O 'user.id' será o mesmo que 'osc.id' (se o modelo o permitir)
    };
    
    const oscData = {
      name,
      cnpj,
      responsible,
      email,
      phone,
      address,
      status: 'Ativo',
      assigned_contador_id: creatingContadorId, // Associa automaticamente ao Contador que a criou
    };

    // 5. O Modelo 'createOscAndUser' deve usar uma TRANSAÇÃO
    //    para criar a OSC e o Utilizador atomicamente.
    const newOSC = await OscModel.createOscAndUser(oscData, userData);

    res.status(201).json(newOSC);
  } catch (error) {
    console.error('Erro no controlador createOSC:', error);
    // Verifica se é um erro de duplicado do banco
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email ou CNPJ já existe.' });
    }
    res.status(500).json({ message: 'Erro interno do servidor ao criar OSC.' });
  }
};

/**
 * @desc    Atualiza os dados de uma OSC (Perfil).
 * @route   PUT /api/oscs/:id
 * @access  Privado (OSC dona, ou Contador associado)
 * @body    { name, responsible, email, phone, address, status }
 */
export const updateOSC = async (req, res) => {
  try {
    const { id: oscId } = req.params;
    const { id: userId, role: userRole } = req.user;
    
    // (O CNPJ geralmente não deve ser editável após a criação)
    const { name, responsible, email, phone, address, status } = req.body;

    // 1. Verifica se a OSC existe
    const osc = await OscModel.findById(oscId);
    if (!osc) {
      return res.status(404).json({ message: 'OSC não encontrada.' });
    }
    
    // 2. --- Verificação de Permissão ---
    let hasPermission = false;
    // A OSC pode editar o seu próprio perfil
    if (userRole === ROLES.OSC && osc.id === userId) {
      hasPermission = true;
    }
    // O Contador associado pode editar o perfil da OSC
    else if (userRole === ROLES.CONTADOR && osc.assigned_contador_id === userId) {
      hasPermission = true;
    }
    
    if (!hasPermission) {
      return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para editar esta OSC.' });
    }

    // 3. Prepara os dados
    const updateData = {
      name,
      responsible,
      email,
      phone,
      address,
      // Apenas um Contador (ou Admin) deve poder alterar o 'status'
      // A própria OSC não deve poder desativar-se.
      status: (userRole === ROLES.CONTADOR || userRole === ROLES.ADMIN) ? status : undefined,
    };
    
    // (O Modelo 'updateOscAndUser' deve usar uma TRANSAÇÃO
    //  para atualizar o 'osc.name' e 'user.name' ao mesmo tempo)
    const updatedOSC = await OscModel.updateOscAndUser(oscId, updateData);

    res.status(200).json(updatedOSC);
  } catch (error) {
    console.error('Erro no controlador updateOSC:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email ou CNPJ já existe.' });
    }
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * @desc    Associa (ou re-associa) uma OSC a um Contador.
 * @route   PATCH /api/oscs/:id/assign
 * @access  Privado (Admin)
 * @body    { contadorId: string }
 */
export const assignContador = async (req, res) => {
  try {
    // (A rota deve ser protegida para ROLES.ADMIN)
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }

    const { id: oscId } = req.params;
    const { contadorId } = req.body;

    if (!contadorId) {
      return res.status(400).json({ message: 'O ID do Contador (contadorId) é obrigatório.' });
    }

    // O modelo verificará se a OSC e o Contador (com role 'Contador') existem
    const updatedOSC = await OscModel.assignContador(oscId, contadorId);

    if (!updatedOSC) {
      return res.status(404).json({ message: 'OSC ou Contador não encontrado.' });
    }

    res.status(200).json({ message: 'Contador associado com sucesso.', osc: updatedOSC });
  } catch (error) {
    console.error('Erro no controlador assignContador:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * @desc    Apaga uma OSC e o seu utilizador associado.
 * @route   DELETE /api/oscs/:id
 * @access  Privado (Admin)
 */
export const deleteOSC = async (req, res) => {
  try {
    // (A rota deve ser protegida para ROLES.ADMIN)
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }
    
    const { id: oscId } = req.params;

    // O Modelo 'deleteOscAndUser' deve usar uma TRANSAÇÃO
    // para apagar a OSC, o Utilizador, e (opcionalmente)
    // os documentos, mensagens, etc. (ou marcá-los como órfãos).
    await OscModel.deleteOscAndUser(oscId);

    res.status(204).send(); // 204 No Content (sucesso, sem corpo)
  } catch (error) {
    console.error('Erro no controlador deleteOSC:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};