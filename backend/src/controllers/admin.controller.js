import pool from '../config/db.js';

export const getDashboardStats = async (req, res) => {
    try {
        // Conta TODOS os utilizadores
        const [users] = await pool.execute('SELECT COUNT(*) as total FROM users');
        
        // Conta TODAS as OSCs
        const [oscs] = await pool.execute('SELECT COUNT(*) as total FROM oscs');
        
        // Conta TODOS os documentos do sistema
        const [docs] = await pool.execute('SELECT COUNT(*) as total FROM documents');
        
        // Conta TODOS os Escritórios Contábeis
        const [offices] = await pool.execute('SELECT COUNT(*) as total FROM offices');

        res.json({
            totalUsers: users[0].total || 0,
            totalOscs: oscs[0].total || 0,
            totalDocs: docs[0].total || 0,
            totalOffices: offices[0].total || 0
        });
    } catch (error) {
        console.error('[Admin Dashboard Error]:', error);
        res.status(500).json({ message: 'Erro ao carregar estatísticas do sistema.' });
    }
};