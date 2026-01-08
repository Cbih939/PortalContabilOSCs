import pool from '../config/db.js';

// 1. Listar Histórico de Avisos
export const getNoticeHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log(`[Notices] Buscando histórico para User ID: ${userId}`);

        // Busca avisos enviados por este contador
        const query = `
            SELECT 
                n.id,
                n.title,
                n.message,
                n.type,
                n.created_at,
                COALESCE(o.razao_social, 'Todos (Global)') as target_name
            FROM notices n
            LEFT JOIN oscs o ON n.target_osc_id = o.id
            WHERE n.created_by_user_id = ?
            ORDER BY n.created_at DESC
        `;

        const [rows] = await pool.execute(query, [userId]);

        // Mapeamento Universal (Blindado contra erros de frontend)
        const safeNotices = rows.map(n => ({
            id: n.id,
            
            // Variações de Título
            title: n.title,
            subject: n.title,

            // Variações de Mensagem/Conteúdo
            message: n.message,
            content: n.message,
            description: n.message,
            text: n.message,

            // Variações de Data
            date: n.created_at,
            created_at: n.created_at,
            timestamp: n.created_at,

            // Variações de Destinatário
            target: n.target_name,
            osc: n.target_name,
            to: n.target_name,

            // Outros
            type: n.type || 'info'
        }));

        console.log(`[Notices] Enviando ${safeNotices.length} avisos.`);
        res.json(safeNotices);

    } catch (error) {
        console.error('[Notices] Erro ao listar:', error);
        res.status(500).json({ message: 'Erro ao buscar histórico de avisos.' });
    }
};

// 2. Enviar Novo Aviso
export const sendNotice = async (req, res) => {
    try {
        const { title, message, type, oscId } = req.body;
        const userId = req.user.id;

        console.log(`[Notices] Criando aviso: ${title}`);

        const query = `
            INSERT INTO notices (title, message, type, target_osc_id, created_by_user_id)
            VALUES (?, ?, ?, ?, ?)
        `;

        // Se oscId vier vazio ou 'all', salvamos como NULL (Global)
        const targetId = (oscId && oscId !== 'all') ? oscId : null;

        await pool.execute(query, [
            title, 
            message, 
            type || 'info', 
            targetId, 
            userId
        ]);

        res.status(201).json({ message: 'Aviso enviado com sucesso!' });

    } catch (error) {
        console.error('[Notices] Erro ao enviar:', error);
        res.status(500).json({ message: 'Erro ao enviar aviso.' });
    }
};

// 3. Obter Estatísticas (Opcional, se a página pedir)
export const getNoticeStats = async (req, res) => {
    res.json({ sent: 10, read: 5 }); // Dummy por enquanto
};