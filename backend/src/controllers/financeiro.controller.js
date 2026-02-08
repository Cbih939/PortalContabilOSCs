import SystemSettings from '../models/SystemSettings.js';

export const getStripeConfig = async (req, res) => {
    try {
        const settings = await SystemSettings.getSettings();
        // Mapeamos para camelCase para o frontend
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

export const getFinanceiroStats = async (req, res) => {
    try {
        // Busca contagem de usuários OSC
        const [counts] = await db.query(`
            SELECT 
                COUNT(*) as totalOSCs,
                SUM(CASE WHEN is_in_debt = 0 THEN 1 ELSE 0 END) as emDia,
                SUM(CASE WHEN is_in_debt = 1 THEN 1 ELSE 0 END) as inadimplentes
            FROM users WHERE role = 'osc'
        `);

        // Busca histórico de faturamento real
        const [history] = await db.query(`
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

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao listar OSCs" });
  }
};

export const updateDebtStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_in_debt } = req.body;

    await db.query("UPDATE users SET is_in_debt = ? WHERE id = ?", [is_in_debt ? 1 : 0, id]);
    
    res.json({ message: "Status atualizado com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar status" });
  }
};