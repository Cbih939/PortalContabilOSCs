import pool from '../config/db.js';

export const getMyOSCs = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        console.log('--- DEBUG INÍCIO ---');
        console.log(`1. Quem está pedindo? ID: ${userId}, Role: ${userRole}`);

        // TESTE 1: Verificar se existem OSCs no banco (sem filtros)
        const [total] = await pool.execute('SELECT COUNT(*) as t FROM oscs');
        console.log(`2. Total absoluto de OSCs no banco: ${total[0].t}`);

        // TESTE 2: Verificar quantas pertencem a este contador especificamente
        const [doContador] = await pool.execute('SELECT COUNT(*) as t FROM oscs WHERE assigned_contador_id = ?', [userId]);
        console.log(`3. Total vinculado ao Contador ID ${userId}: ${doContador[0].t}`);

        // A Query Real
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

        // Lógica de Filtro
        if (userRole === 'Contador') {
            console.log('4. Aplicando filtro de Contador');
            query += ' WHERE o.assigned_contador_id = ?';
            params.push(userId);
        } else if (userRole === 'OSC') {
            console.log('4. Aplicando filtro de OSC');
            query += ' WHERE o.user_id = ?';
            params.push(userId);
        } else {
            console.log('4. Sem filtro (Admin ou outro)');
        }

        const [rows] = await pool.execute(query, params);

        console.log(`5. Resultado da query final: ${rows.length} registros encontrados.`);

        const safeRows = rows.map(row => ({
            id: row.id,
            name: row.name || 'Sem Nome',
            cnpj: row.cnpj || '',
            responsible: row.responsible || 'Não informado',
            status: row.status || 'Inativo'
        }));

        res.json(safeRows);
        console.log('--- DEBUG FIM ---');

    } catch (error) {
        console.error('ERRO FATAL:', error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
};

/**
 * @desc    Lista todas as OSCs (para o Admin)
 * @route   GET /api/oscs
 */
export const getAllOSCs = async (req, res) => {
    try {
        console.log('[Admin] Buscando lista de OSCs...');

        // Query direta para buscar OSCs e o nome do contador associado (se houver)
        const [rows] = await pool.execute(`
            SELECT 
                o.id, 
                o.razao_social, 
                o.cnpj, 
                o.status, 
                u.name as contador_responsavel
            FROM oscs o
            LEFT JOIN users u ON o.user_id = u.id
        `);

        res.status(200).json(rows);
    } catch (error) {
        console.error('[OSC Controller Error]:', error);
        res.status(500).json({ message: 'Erro ao buscar OSCs no servidor.' });
    }
};

/**
 * @desc    Busca uma OSC específica
 * @route   GET /api/oscs/:id
 */
export const getOSCById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute('SELECT * FROM oscs WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'OSC não encontrada.' });
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('[OSC Controller Error]:', error);
        res.status(500).json({ message: 'Erro ao buscar detalhes da OSC.' });
    }
};