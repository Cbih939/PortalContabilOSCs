import pool from '../config/db.js';

// GET: Busca as configurações atuais
export const getStripeConfig = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM stripe_configs WHERE id = 1');
        
        if (rows.length === 0) {
            return res.json({
                stripePublishableKey: '',
                stripeSecretKey: '',
                stripeWebhookSecret: '',
                monthlyPriceId: '',
                packageValue: ''
            });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Erro ao buscar config Stripe:', error);
        res.status(500).json({ message: 'Erro ao carregar configurações.' });
    }
};

// POST: Salva ou atualiza as configurações
export const saveStripeConfig = async (req, res) => {
    try {
        const { 
            stripePublishableKey, 
            stripeSecretKey, 
            stripeWebhookSecret, 
            monthlyPriceId, 
            packageValue 
        } = req.body;

        // Tenta atualizar o registro ID 1. Se não existir, insere.
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

        res.json({ message: 'Configurações do Stripe salvas com sucesso!' });
    } catch (error) {
        console.error('Erro ao salvar config Stripe:', error);
        res.status(500).json({ message: 'Erro ao salvar configurações.' });
    }
};