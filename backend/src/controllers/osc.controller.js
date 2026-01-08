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

export const getOSCById = async (req, res) => {
    // ... manter igual ...
    res.json({});
};