import pool from '../config/db.js';

// --- 1. CONFIGURAÇÕES DO STRIPE ---

/**
 * Busca as configurações do Stripe na tabela stripe_configs
 */
export const getStripeConfig = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM stripe_configs WHERE id = 1');
        
        if (rows.length === 0) {
            // Retorna objeto vazio para não quebrar o formulário no Frontend
            return res.json({
                stripePublishableKey: '',
                stripeSecretKey: '',
                stripeWebhookSecret: '',
                monthlyPriceId: '',
                packageValue: ''
            });
        }

        const settings = rows[0];
        const config = {
            stripePublishableKey: settings.stripePublishableKey,
            stripeSecretKey: settings.stripeSecretKey,
            stripeWebhookSecret: settings.stripeWebhookSecret,
            monthlyPriceId: settings.monthlyPriceId,
            packageValue: settings.packageValue
        };
        res.json(config);
    } catch (error) {
        console.error("Erro ao buscar configurações Stripe:", error);
        res.status(500).json({ message: "Erro ao buscar configurações" });
    }
};

/**
 * Atualiza ou Insere as configurações do Stripe (Upsert)
 */
export const updateStripeConfig = async (req, res) => {
    try {
        const { 
            stripePublishableKey, 
            stripeSecretKey, 
            stripeWebhookSecret, 
            monthlyPriceId, 
            packageValue 
        } = req.body;

        const query = `
            INSERT INTO stripe_configs (id, stripePublishableKey, stripeSecretKey, stripeWebhookSecret, monthlyPriceId, packageValue)
            VALUES (1, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                stripePublishableKey = VALUES(stripePublishableKey),
                stripeSecretKey = VALUES(stripeSecretKey),
                stripeWebhookSecret = VALUES(stripeWebhookSecret),
                monthlyPriceId = VALUES(monthlyPriceId),
                packageValue = VALUES(packageValue)
        `;

        await pool.execute(query, [
            stripePublishableKey, 
            stripeSecretKey, 
            stripeWebhookSecret, 
            monthlyPriceId, 
            packageValue
        ]);

        res.json({ message: "Configurações atualizadas com sucesso!" });
    } catch (error) {
        console.error("Erro ao salvar configurações Stripe:", error);
        res.status(500).json({ message: "Erro ao salvar configurações" });
    }
};

// --- 2. ESTATÍSTICAS DO DASHBOARD ---

export const getFinanceiroStats = async (req, res) => {
    try {
        const [counts] = await pool.query(`
            SELECT 
                COUNT(*) as totalOSCs,
                SUM(CASE WHEN is_in_debt = 0 THEN 1 ELSE 0 END) as emDia,
                SUM(CASE WHEN is_in_debt = 1 THEN 1 ELSE 0 END) as inadimplentes
            FROM users WHERE role = 'osc'
        `);

        const [history] = await pool.query(`
            SELECT 
                DATE_FORMAT(payment_date, '%b') as mes, 
                SUM(amount) as valor
            FROM payments 
            WHERE status = 'succeeded'
            GROUP BY mes, DATE_FORMAT(payment_date, '%m')
            ORDER BY DATE_FORMAT(payment_date, '%m') ASC
            LIMIT 6
        `);

        res.json({
            totalOSCs: counts[0].totalOSCs || 0,
            emDia: counts[0].emDia || 0,
            inadimplentes: counts[0].inadimplentes || 0,
            pagamentosHistorico: history || []
        });
    } catch (error) {
        console.error("Erro SQL Stats:", error);
        res.status(500).json({ message: "Erro ao processar dados financeiros" });
    }
};

// --- 3. GESTÃO DE OSCS (LISTAGEM E STATUS) ---

export const listOSCsFinanceiro = async (req, res) => {
    try {
        const { query } = req.query;
        
        let sql = "SELECT id, name, COALESCE(cnpj, '') as cnpj, is_in_debt, email FROM users WHERE role = 'osc'";
        let params = [];

        if (query) {
            sql += " AND (name LIKE ? OR cnpj LIKE ?)";
            params.push(`%${query}%`, `%${query}%`);
        }

        sql += " ORDER BY name ASC";
        
        const [rows] = await pool.query(sql, params); 
        res.json(rows);
    } catch (error) {
        console.error("ERRO NA LISTAGEM DE OSCS:", error);
        res.status(500).json({ message: "Erro ao listar OSCs" });
    }
};

export const updateDebtStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_in_debt } = req.body;
        
        // Converte para 1 ou 0 para garantir compatibilidade com o MySQL TinyInt
        const status = is_in_debt ? 1 : 0;
        
        await pool.query("UPDATE users SET is_in_debt = ? WHERE id = ?", [status, id]);
        res.json({ message: "Status atualizado com sucesso" });
    } catch (error) {
        console.error("Erro ao atualizar débito:", error);
        res.status(500).json({ message: "Erro ao atualizar status" });
    }
};