import pool from '../config/db.js';

// Listar "Minhas OSCs"
export const getMyOSCs = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        console.log(`[OSC] Buscando lista para User ID: ${userId}`);

        let query = `
            SELECT 
                o.id, 
                o.cnpj, 
                COALESCE(o.razao_social, u.name, 'Sem Nome') as name,
                o.responsible, 
                o.email, 
                o.phone, 
                o.cidade,
                o.estado,
                u.status as status
            FROM oscs o
            LEFT JOIN users u ON o.user_id = u.id
        `;
        
        const params = [];

        if (userRole === 'Contador') {
            query += ' WHERE o.assigned_contador_id = ?';
            params.push(userId);
        } else if (userRole === 'OSC') {
            query += ' WHERE o.user_id = ?';
            params.push(userId);
        }

        query += ' ORDER BY o.razao_social ASC';

        const [rows] = await pool.execute(query, params);

        // --- BLINDAGEM DE DADOS ---
        // Aqui garantimos que o Frontend nunca receba NULL, evitando erros de .sort() ou .filter()
        const safeRows = rows.map(row => ({
            id: row.id,
            name: row.name || 'Sem Nome', // Garante string
            cnpj: row.cnpj || '',          // Garante string
            responsible: row.responsible || 'Não informado', // Garante string
            email: row.email || '',
            phone: row.phone || '',
            city: row.cidade || '',
            state: row.estado || '',
            status: row.status || 'Inativo'
        }));
        
        console.log(`[OSC] Enviando ${safeRows.length} registros SEGUROS para o frontend.`);
        res.json(safeRows);

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