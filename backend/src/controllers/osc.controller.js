import pool from '../config/db.js';

// Listar "Minhas OSCs" (Chamada pela rota /api/oscs/my)
export const getMyOSCs = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        console.log(`[OSC] Buscando OSCs para o usuário ID: ${userId} (${userRole})`);

        // CORREÇÃO: Ajustei 'o.city' para 'o.cidade' conforme seu banco de dados
        let query = `
            SELECT 
                o.id, 
                o.cnpj, 
                COALESCE(o.razao_social, u.name, 'OSC Sem Nome') as name, 
                o.email, 
                o.phone, 
                o.cidade,
                o.estado,
                u.status as status
            FROM oscs o
            LEFT JOIN users u ON o.user_id = u.id
        `;
        
        const params = [];

        // Se for Contador, filtra apenas as que ele atende
        if (userRole === 'Contador') {
            query += ' WHERE o.assigned_contador_id = ?';
            params.push(userId);
        } 
        // Se for OSC, vê apenas a sua própria
        else if (userRole === 'OSC') {
            query += ' WHERE o.user_id = ?';
            params.push(userId);
        }

        query += ' ORDER BY o.razao_social ASC';

        const [rows] = await pool.execute(query, params);
        
        console.log(`[OSC] Sucesso. Encontradas ${rows.length} organizações.`);
        res.json(rows);

    } catch (error) {
        // Este log vai aparecer no seu terminal se der erro novamente
        console.error('[OSC] ERRO SQL:', error.message);
        res.status(500).json({ message: 'Erro ao listar OSCs.' });
    }
};

// Obter detalhes de uma OSC específica
export const getOSCById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute('SELECT * FROM oscs WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'OSC não encontrada.' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('[OSC] Erro Detalhes:', error.message);
        res.status(500).json({ message: 'Erro ao buscar detalhes da OSC.' });
    }
};