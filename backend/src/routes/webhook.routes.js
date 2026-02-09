import express from 'express';
import Stripe from 'stripe';
import pool from '../config/db.js';

const router = express.Router();

// O Webhook precisa receber o corpo bruto (raw body) para validar a assinatura
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    try {
        // Busca o Webhook Secret no banco
        const [config] = await pool.query('SELECT stripeSecretKey, stripeWebhookSecret FROM stripe_configs WHERE id = 1');
        const stripe = new Stripe(config[0].stripeSecretKey);

        const event = stripe.webhooks.constructEvent(req.body, sig, config[0].stripeWebhookSecret);

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const userId = session.client_reference_id;

            // --- DESBLOQUEIO AQUI ---
            await pool.query('UPDATE users SET is_in_debt = 0 WHERE id = ?', [userId]);
            console.log(`Usuário ${userId} desbloqueado com sucesso.`);
        }

        res.json({ received: true });
    } catch (err) {
        console.error(`Erro Webhook: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
});

export default router;