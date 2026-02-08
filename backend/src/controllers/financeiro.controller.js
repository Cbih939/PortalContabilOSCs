import pool from '../config/db.js';
import SystemSettings from '../models/SystemSettings.js';

// 1. Configurações do Stripe
export const getStripeConfig = async (req, res) => {
    try {
        const settings = await SystemSettings.getSettings();
        const config = {
            stripePublishableKey: settings?.stripe_publishable_key,
            stripeSecretKey: settings?.stripe_secret_key,
            stripeWebhookSecret: settings?.stripe_webhook_secret,
            monthlyPriceId: settings?.monthly_price_id,
            packageValue: settings?.package_value
        };
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar configurações" });
    }
};

export const updateStripeConfig = async (req, res) => {
    try {
        await SystemSettings.updateSettings(req.body);
        res.json({ message: "Configurações atualizadas com sucesso!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao salvar configurações" });
    }
};

// 2. Estatísticas do Dashboard
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
            pagamentosHistorico: history
        });
    } catch (error) {
        console.error("Erro SQL Stats:", error);
        res.status(500).json({ message: "Erro ao processar dados financeiros" });
    }
};

// 3. Gestão de OSCs
export const listOSCsFinanceiro = async (req, res) => {
  try {
    const { query } = req.query;
    let sql = "SELECT id, name, cnpj, is_in_debt, email FROM users WHERE role = 'osc'";
    let params = [];

    if (query) {
      sql += " AND (name LIKE ? OR cnpj LIKE ?)";
      params.push(`%${query}%`, `%${query}%`);
    }

    sql += " ORDER BY name ASC";
    
    // CORREÇÃO: Certifica-te que aqui diz 'pool' e não 'db'
    const [rows] = await pool.query(sql, params); 
    res.json(rows);
  } catch (error) {
    // IMPORTANTE: Este console.log vai mostrar o erro real no 'pm2 logs'
    console.error("ERRO REAL NA QUERY:", error); 
    res.status(500).json({ message: "Erro ao listar OSCs", details: error.message });
  }
};

export const updateDebtStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_in_debt } = req.body;
    await pool.query("UPDATE users SET is_in_debt = ? WHERE id = ?", [is_in_debt ? 1 : 0, id]);
    res.json({ message: "Status atualizado com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar status" });
  }
};