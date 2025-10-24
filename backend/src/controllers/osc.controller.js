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
 * @route   GET /api/oscs/my
 * @access  Privado (Contador)
 */
export const getMyOSCs = async (req, res) => {
  try {
    const contadorId = req.user?.id; // Pega ID do middleware

    // --- LOG DE DEBUG ---
    console.log(`[getMyOSCs] Buscando OSCs para o Contador ID: ${contadorId}`);

    if (req.user?.role !== ROLES.CONTADOR) { // Usa optional chaining por segurança
      console.log(`[getMyOSCs] Acesso negado. Role do utilizador: ${req.user?.role}`);
      return res.status(403).json({ message: 'Acesso negado.' });
    }
    if (!contadorId) { // Segurança extra
        console.log('[getMyOSCs] Erro: ID do Contador não encontrado no token.');
        return res.status(401).json({ message: 'Não autorizado.' });
    }

    const oscs = await OscModel.findByContadorId(contadorId); // Chama o modelo

    // --- LOG DE DEBUG ---
    console.log(`[getMyOSCs] OSCs encontradas pelo modelo: ${oscs?.length || 0}`);

    res.status(200).json(oscs); // Retorna o resultado do modelo
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
      hasPermission = osc.assigned_contador_id === userId;
    } else if (userRole === ROLES.OSC) {
      hasPermission = Number(osc.id) === Number(userId); // Garante comparação numérica
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
 * @body    { name, cnpj, responsible, email (login), phone, address, password, email_contato? }
 */
export const createOSC = async (req, res) => {
  try {
    if (req.user.role !== ROLES.CONTADOR && req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }
    const creatingContadorId = req.user.role === ROLES.CONTADOR ? req.user.id : null;

    const { name, cnpj, responsible, email, phone, address, password, email_contato } = req.body; // email é o de LOGIN

    // 1. Validação
    if (!name || !cnpj || !email || !password) {
      return res.status(400).json({ message: 'Nome, CNPJ, Email de login e Senha são obrigatórios.' });
    }

    // 2. Verifica duplicados
    const existingUser = await UserModel.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'Este email de login já está em uso.' });
    }
    const existingOSC = await OscModel.findByCnpj(cnpj);
    if (existingOSC) {
      return res.status(409).json({ message: 'Este CNPJ já está registado.' });
    }

    // 3. Hash da senha
    const passwordHash = await hashPassword(password);

    // 4. Prepara os dados
    const userData = {
      name, // Nome da OSC vai para users.name
      email, // Email de LOGIN
      password_hash: passwordHash,
      role: ROLES.OSC,
      status: 'Ativo' // OSC começa ativa
    };
    const oscData = {
      cnpj,
      responsible,
      email: email_contato || email, // Email de CONTACTO (usa login se não fornecido)
      phone,
      address,
      assigned_contador_id: creatingContadorId,
    };

    // 5. O Modelo 'createOscAndUser' usa TRANSAÇÃO
    const newOSC = await OscModel.createOscAndUser(oscData, userData);

    res.status(201).json(newOSC);
  } catch (error) {
    console.error('Erro no controlador createOSC:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email de login ou CNPJ já existe.' });
    }
    res.status(500).json({ message: 'Erro interno do servidor ao criar OSC.' });
  }
};

/**
 * @desc    Atualiza os dados de uma OSC (Perfil).
 * @route   PUT /api/oscs/:id
 * @access  Privado (OSC dona, ou Contador associado)
 * @body    { name, responsible, email (contacto), phone, address, status, login_email? }
 */
export const updateOSC = async (req, res) => {
  try {
    const { id: oscId } = req.params;
    const { id: userId, role: userRole } = req.user;
    const updateData = req.body; // Contém os campos a atualizar

    // 1. Verifica se a OSC existe (busca combinada)
    const osc = await OscModel.findById(oscId);
    if (!osc) {
      return res.status(404).json({ message: 'OSC não encontrada.' });
    }

    // 2. Verificação de Permissão
    let hasPermission = false;
    if (userRole === ROLES.OSC && Number(osc.id) === Number(userId)) {
      hasPermission = true;
      // OSC não pode alterar o próprio status ou contador associado
      delete updateData.status;
      delete updateData.assigned_contador_id;
    } else if (userRole === ROLES.CONTADOR && osc.assigned_contador_id === userId) {
      hasPermission = true;
      // Contador não pode alterar o contador associado (ele mesmo)
      delete updateData.assigned_contador_id;
    } else if (userRole === ROLES.ADMIN) { // Admin pode editar tudo
        hasPermission = true;
    }

    if (!hasPermission) {
      return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para editar esta OSC.' });
    }

    // 3. O Modelo 'updateOscAndUser' usa TRANSAÇÃO
    const updatedOSC = await OscModel.updateOscAndUser(oscId, updateData);

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
 * @route   PATCH /api/oscs/:id/assign
 * @access  Privado (Admin)
 * @body    { contadorId: string }
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

    // (Validação extra: verificar se contadorId existe e tem role Contador)
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
 * @route   DELETE /api/oscs/:id
 * @access  Privado (Admin)
 */
export const deleteOSC = async (req, res) => {
  try {
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }
    const { id: oscId } = req.params;

    // O Modelo 'deleteOscAndUser' usa ON DELETE CASCADE
    const success = await OscModel.deleteOscAndUser(oscId);
    if (!success) {
        return res.status(404).json({ message: 'OSC não encontrada.' });
    }

    res.status(204).send(); // Sucesso, sem conteúdo
  } catch (error) {
    console.error('Erro no controlador deleteOSC:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};