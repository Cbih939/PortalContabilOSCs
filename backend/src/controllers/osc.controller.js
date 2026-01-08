import pool from '../config/db.js';

// Listar "Minhas OSCs"
export const getMyOSCs = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        console.log(`[OSC] Buscando lista para User ID: ${userId}`);

        // QUERY ROBUSTA: Traz todos os campos possíveis para evitar erros no Frontend
        let query = `
            SELECT 
                o.id, 
                o.cnpj, 
                -- Garante que tenha nome
                COALESCE(o.razao_social, u.name, 'Sem Nome') as name, 
                o.razao_social, -- Envia também o original
                
                -- Campos de Contato e Responsável (Necessário para a tabela)
                o.responsible, 
                o.email, 
                o.phone, 
                
                -- Endereço (Envia com dois nomes para garantir compatibilidade)
                o.cidade,
                o.cidade as city, 
                o.estado,
                o.estado as state,

                -- Status do Usuário vinculado
                u.status as status
            FROM oscs o
            LEFT JOIN users u ON o.user_id = u.id
        `;
        
        const params = [];

        // Filtros de Segurança
        if (userRole === 'Contador') {
            query += ' WHERE o.assigned_contador_id = ?';
            params.push(userId);
        } else if (userRole === 'OSC') {
            query += ' WHERE o.user_id = ?';
            params.push(userId);
        }

        query += ' ORDER BY o.razao_social ASC';

        const [rows] = await pool.execute(query, params);
        
        console.log(`[OSC] Enviando ${rows.length} registros para o frontend.`);
        res.json(rows);

    } catch (error) {
        console.error('[OSC] Erro SQL:', error);
        res.status(500).json({ message: 'Erro ao listar OSCs.' });
    }
};

// Detalhes da OSC
export const getOSCById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute('SELECT * FROM oscs WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'OSC não encontrada.' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar detalhes.' });
    }
};