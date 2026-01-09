// backend/src/controllers/osc.controller.js
import pool from '../config/db.js';

/**
 * @desc    Lista todas as OSCs para o Administrador (Mapeado para ManageOSCs.jsx)
 * @route   GET /api/oscs
 */
export const getAllOSCs = async (req, res) => {
    try {
        console.log('[Admin] Iniciando busca global de OSCs...');

        // Query utilizando as colunas reais confirmadas pelo DESCRIBE
        // Note: Removemos o.status pois a coluna não existe na tabela oscs
        const [rows] = await pool.execute(`
            SELECT 
                o.id, 
                o.razao_social, 
                o.cnpj, 
                u.name as contador_extenso
            FROM oscs o
            LEFT JOIN users u ON o.assigned_contador_id = u.id
        `);

        // MAPEAMENTO EXATO para o Frontend (ManageOSCs.jsx)
        const formattedRows = rows.map(osc => ({
            id: osc.id,
            cnpj: osc.cnpj || '00.000.000/0000-00',
            // O Frontend espera 'name' para exibir e filtrar (ManageOSCs.jsx:82, 117)
            name: osc.razao_social || 'Sem Razão Social', 
            // O Frontend espera 'contadorName' para exibir e filtrar (ManageOSCs.jsx:83, 119)
            contadorName: osc.contador_extenso || 'Nenhum',
            // O Frontend espera 'status' para renderizar o badge (ManageOSCs.jsx:123)
            status: 'Ativo' 
        }));

        console.log(`[Admin] Sucesso: ${formattedRows.length} OSCs enviadas com chaves compatíveis.`);
        return res.status(200).json(formattedRows);

    } catch (error) {
        console.error('[OSC Admin Error]:', error.sqlMessage || error.message);
        return res.status(500).json({ 
            message: 'Erro interno ao carregar lista de OSCs.',
            error: error.sqlMessage 
        });
    }
};

/**
 * @desc    Lista OSCs vinculadas ao utilizador logado (Contador ou OSC)
 * @route   GET /api/oscs/my
 */
export const getMyOSCs = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        console.log(`[OSC My] Buscando para UserID: ${userId}, Role: ${userRole}`);

        let query = `
            SELECT o.id, o.razao_social, o.cnpj, o.responsible, o.email
            FROM oscs o
        `;
        const params = [];

        // Lógica de filtro baseada no papel do utilizador
        if (userRole === 'Contador') {
            query += ' WHERE o.assigned_contador_id = ?';
            params.push(userId);
        } else if (userRole === 'OSC') {
            query += ' WHERE o.user_id = ?';
            params.push(userId);
        }

        const [rows] = await pool.execute(query, params);
        
        const formatted = rows.map(r => ({
            ...r,
            name: r.razao_social || 'Sem Nome',
            status: 'Ativo'
        }));

        return res.json(formatted);
    } catch (error) {
        console.error('[OSC MyOSCs Error]:', error);
        return res.status(500).json({ message: 'Erro ao buscar OSCs vinculadas.' });
    }
};

/**
 * @desc    Busca detalhes de uma OSC específica por ID
 * @route   GET /api/oscs/:id
 */
export const getOSCById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[OSC Detail] Buscando ID: ${id}`);

        const [rows] = await pool.execute('SELECT * FROM oscs WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'OSC não encontrada.' });
        }

        // Retorna o objeto completo da OSC
        return res.status(200).json(rows[0]);
    } catch (error) {
        console.error('[OSC Detail Error]:', error);
        return res.status(500).json({ message: 'Erro ao buscar detalhes da OSC.' });
    }
};

/**
 * @desc    Associa um contador a uma OSC
 * @route   PATCH /api/oscs/:id/assign
 */
export const assignContador = async (req, res) => {
    try {
        const { id } = req.params;
        const { contadorId } = req.body; // Espera { contadorId: X }

        console.log(`[Admin] Associando OSC ${id} ao Contador ${contadorId}`);

        const [result] = await pool.execute(
            'UPDATE oscs SET assigned_contador_id = ? WHERE id = ?',
            [contadorId, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'OSC não encontrada.' });
        }

        // Busca a OSC atualizada para devolver ao frontend
        const [updatedRows] = await pool.execute('SELECT * FROM oscs WHERE id = ?', [id]);
        
        return res.json({
            message: 'Contador associado com sucesso!',
            osc: updatedRows[0]
        });
    } catch (error) {
        console.error('[OSC Assign Error]:', error);
        return res.status(500).json({ message: 'Erro ao associar contador.' });
    }
};