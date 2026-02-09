import express from 'express';
import Stripe from 'stripe';
import pool from '../config/db.js';

const router = express.Router();

// O Stripe precisa do corpo bruto (raw) para validar a assinatura do Webhook
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    try {
        // 1. Busca as chaves dinâmicas no banco de dados
        const [config] = await pool.query('SELECT stripeSecretKey, stripeWebhookSecret FROM stripe_configs WHERE id = 1');
        
        if (!config.length || !config[0].stripeWebhookSecret) {
            console.error('Webhook Secret não configurado no banco.');
            return res.status(400).send('Webhook Secret missing');
        }

        const stripe = new Stripe(config[0].stripeSecretKey);
        const event = stripe.webhooks.constructEvent(req.body, sig, config[0].stripeWebhookSecret);

        // 2. Lógica quando o pagamento é aprovado
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const userId = session.client_reference_id; // ID que passamos na criação do checkout

            if (userId) {
                // DESBLOQUEIO AUTOMÁTICO NO BANCO
                await pool.query('UPDATE users SET is_in_debt = 0 WHERE id = ?', [userId]);
                console.log(`>>> PAGAMENTO CONFIRMADO: Usuário ${userId} liberado.`);
            }
        }

        res.json({ received: true });
    } catch (err) {
        console.error(`Erro Webhook Stripe: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
});

export default router;