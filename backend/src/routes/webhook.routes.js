import express from 'express';
import Stripe from 'stripe';
import pool from '../config/db.js';

const router = express.Router();

// Rota para o Stripe avisar que o pagamento caiu
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    try {
        // Busca chaves salvas pelo usuário financeiro
        const [config] = await pool.query('SELECT stripeSecretKey, stripeWebhookSecret FROM stripe_configs WHERE id = 1');
        
        if (!config.length) return res.status(400).send('Webhook não configurado');

        const stripe = new Stripe(config[0].stripeSecretKey);
        const event = stripe.webhooks.constructEvent(req.body, sig, config[0].stripeWebhookSecret);

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const userId = session.client_reference_id;

            // REMOVE O BLOQUEIO AUTOMATICAMENTE
            await pool.query('UPDATE users SET is_in_debt = 0 WHERE id = ?', [userId]);
            console.log(`Usuário ${userId} desbloqueado via Stripe.`);
        }

        res.json({ received: true });
    } catch (err) {
        res.status(400).send(`Erro: ${err.message}`);
    }
});

export default router;