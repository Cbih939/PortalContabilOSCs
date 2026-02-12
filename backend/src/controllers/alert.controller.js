// backend/src/controllers/alert.controller.js

// Importa os modelos
import * as AlertModel from '../models/alert.model.js';
import * as OscModel from '../models/osc.model.js'; // Para buscar nomes de OSC
import * as UserModel from '../models/user.model.js'; // Para buscar nomes de OSC (via ID)
import { ROLES } from '../utils/constants.js'; // Para comparar roles

/**
 * @desc    Busca todos os alertas para a OSC logada.
 * @route   GET /api/alerts
 * @access  Privado (OSC)
 */
export const getMyAlerts = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role ? req.user.role.toUpperCase() : '';

    // Se for Contador, ele vê os alertas que ele criou. 
    // Se for OSC, ela vê os alertas destinados a ela.
    let alerts;
    if (userRole === 'CONTADOR') {
      alerts = await AlertModel.findNoticesBySenderId(userId);
    } else {
      // Para OSC, buscamos pelo ID da OSC dela
      alerts = await AlertModel.findAlertsByOSCId(userId);
    }

    res.status(200).json(alerts || []);
  } catch (error) {
    console.error('[GetMyAlerts] Erro:', error);
    res.status(500).json({ message: 'Erro ao buscar alertas.' });
  }
};

/**
 * @desc    Cria um novo alerta/aviso para uma ou mais OSCs.
 * @route   POST /api/alerts OU POST /api/notices
 * @access  Privado (Contador)
 * @body    { oscId: (number|null), title: string, message: string, type: string? } // Aceita oscId
 */
export const createAlert = async (req, res) => {
  try {
    // --- LOG DE DEBUG ---
    console.log('[Create Alert] Corpo da Requisição Recebido:', req.body);

    // !! CORREÇÃO: Aceita oscId do frontend !!
    const { oscId, title, message, type } = req.body;
    const fromContadorId = req.user.id;

    // Validação básica
    if (!title || !message) {
      console.log('[Create Alert] Erro 400: Título ou Mensagem em falta.');
      return res.status(400).json({
        message: 'Título e mensagem são obrigatórios.'
      });
    }
    // Verifica se oscId foi enviado (mesmo que seja null)
    if (oscId === undefined) {
         console.log('[Create Alert] Erro 400: Campo oscId (mesmo que null) é esperado.');
         return res.status(400).json({ message: 'Campo oscId inválido ou em falta.' });
    }

    // Prepara dados para o modelo (usa osc_id com underscore)
    const newAlertData = {
      osc_id: oscId, // Converte para o nome da coluna no DB
      title,
      message,
      // Define tipo (Urgente para /alerts, padrão para /notices)
      type: type || (req.path.includes('/alerts') ? 'Urgente' : 'Informativo'),
      created_by_contador_id: fromContadorId,
    };

    // --- LOG DE DEBUG ---
    console.log('[Create Alert] Dados a serem salvos:', newAlertData);

    const createdAlert = await AlertModel.createAlert(newAlertData);

     // --- LOG DE DEBUG ---
     console.log('[Create Alert] Alerta criado com sucesso:', createdAlert);

    res.status(201).json(createdAlert); // Retorna 201 Created

  } catch (error) {
    // --- LOG DE DEBUG ---
    console.error('[Create Alert] Erro INESPERADO:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao criar alerta/aviso.' });
  }
};

/**
 * @desc    Marca um alerta específico como lido.
 * @route   PATCH /api/alerts/:alertId/read
 * @access  Privado (OSC)
 */
export const markAsRead = async (req, res) => {
  try {
    const { alertId } = req.params;
    const oscId = req.user.id;

    if (!alertId) {
      return res.status(400).json({ message: 'ID do alerta não fornecido.' });
    }
    if (req.user.role !== ROLES.OSC) {
        return res.status(403).json({ message: 'Acesso negado.' });
    }

    const updatedAlert = await AlertModel.markAsRead(alertId, oscId);

    if (!updatedAlert) {
      return res.status(404).json({
        message: 'Alerta não encontrado, não pertence a este utilizador ou já estava lido.'
      });
    }

    res.status(200).json(updatedAlert);
  } catch (error) {
    console.error('[MarkAsRead] Erro no controlador:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar alerta.' });
  }
};


/**
 * @desc    Busca o histórico de avisos enviados pelo Contador logado.
 * @route   GET /api/notices/history
 * @access  Privado (Contador)
 */
export const getSentNoticesHistory = async (req, res) => {
  try {
    const contadorId = req.user.id;
    console.log(`[GetSentHistory] Buscando histórico para Contador ID: ${contadorId}`); // Log

    const notices = await AlertModel.findNoticesBySenderId(contadorId);
    console.log(`[GetSentHistory] Modelo retornou ${notices.length} avisos.`); // Log

    // Enriquecer com nome da OSC
    const enrichedNotices = await Promise.all(notices.map(async (notice) => {
        let oscName = 'Todas as OSCs';
        if (notice.osc_id) {
            // Busca o nome na tabela 'users' usando o ID da OSC
            // NOTA: OscModel.findById busca JOIN com users, mais eficiente
            const osc = await OscModel.findById(notice.osc_id);
            oscName = osc?.name || 'OSC Desconhecida';
        }
        return { ...notice, oscName }; // Adiciona oscName ao objeto
    }));

     console.log('[GetSentHistory] Retornando histórico enriquecido.'); // Log
    res.status(200).json(enrichedNotices);

  } catch (error) {
    console.error('[GetSentHistory] Erro no controlador:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar histórico de avisos.' });
  }
};

export const updateAlert = async (req, res) => {
    res.status(501).json({ message: "Funcionalidade em desenvolvimento" });
};

export const deleteAlert = async (req, res) => {
    res.status(501).json({ message: "Funcionalidade em desenvolvimento" });
};

export const registerOSC = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const data = req.body;
        const files = req.files;

        // 1. Verificar se o e-mail já existe
        const [existing] = await connection.execute('SELECT id FROM users WHERE email = ?', [data.coordEmail]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Este e-mail de coordenador já está cadastrado.' });
        }

        // 2. Criar Usuário (Coordenador) - Nasce BLOQUEADO (is_in_debt: 1)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.coordSenha, salt);
        
        const [userResult] = await connection.execute(
            'INSERT INTO users (name, email, password_hash, role, status, is_in_debt) VALUES (?, ?, ?, "OSC", "Ativo", 1)',
            [data.coordNome, data.coordEmail, hashedPassword]
        );
        const userId = userResult.insertId;

        // 3. Processar caminhos dos arquivos
        const logoPath = files['logotipo'] ? `uploads/public/${files['logotipo'][0].filename}` : null;
        const ataPath = files['ata'] ? `uploads/public/${files['ata'][0].filename}` : null;
        const estatutoPath = files['estatuto'] ? `uploads/public/${files['estatuto'][0].filename}` : null;

        // 4. Inserir OSC (Atribuindo ao Contador Administrador ID: 1)
        const sqlOSC = `
            INSERT INTO oscs (
                user_id, name, razao_social, cnpj, data_fundacao, email_contato, telefone, 
                cep, endereco, numero, bairro, cidade, estado, logo_path, ata_path, estatuto_path, assigned_contador_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`;

        await connection.execute(sqlOSC, [
            userId, data.nomeFantasia, data.razaoSocial, data.cnpj, data.dataFundacao || null,
            data.emailContato, data.telefone, data.cep, data.endereco, data.numero,
            data.bairro, data.cidade, data.estado, logoPath, ataPath, estatutoPath
        ]);

        await connection.commit();

        // 5. Gerar Token para o Frontend (incluindo is_in_debt)
        const token = jwt.sign(
            { id: userId, role: 'OSC', name: data.coordNome, is_in_debt: 1 },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({ token, message: "Cadastro realizado com sucesso." });

    } catch (error) {
        await connection.rollback();
        console.error('[Register OSC Error]:', error);
        res.status(500).json({ message: 'Erro ao processar o cadastro da OSC.' });
    } finally {
        connection.release();
    }
};