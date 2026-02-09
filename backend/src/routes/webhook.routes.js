import express from 'express';
import Stripe from 'stripe';
import pool from '../config/db.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * 1. ROTA DE CRIAÇÃO (POST /api/webhooks/create-checkout-session)
 * Chamada pelo seu botão "Pagar Mensalidade Agora" no Frontend.
 */
router.post('/create-checkout-session', protect, async (req, res) => {
    try {
        // Busca as chaves de configuração no banco
        const [config] = await pool.query('SELECT stripeSecretKey FROM stripe_configs WHERE id = 1');
        if (!config.length) return res.status(400).json({ message: 'Stripe não configurado no painel administrativo.' });

        const stripe = new Stripe(config[0].stripeSecretKey);

        // Cria a sessão de checkout
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'brl',
                        product_data: {
                            name: 'Mensalidade Portal Contábil',
                            description: 'Acesso completo ao sistema',
                        },
                        unit_amount: 33900, // Valor em centavos (R$ 50,00)
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            // O id do usuário vai aqui para o Stripe devolver no webhook depois
            client_reference_id: req.user.id.toString(), 
            success_url: `https://contacomigo.org.br/dashboard/financeiro?success=true`,
            cancel_url: `https://contacomigo.org.br/dashboard/financeiro?canceled=true`,
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('[Stripe Session Error]:', error);
        res.status(500).json({ message: 'Erro ao gerar link de pagamento.' });
    }
});

/**
 * 2. ROTA DE RECEBIMENTO (POST /api/webhooks/stripe)
 * Chamada AUTOMATICAMENTE pelo Stripe quando o pagamento é aprovado.
 * NOTA: Esta rota NÃO deve ter o middleware 'protect' pois o Stripe não envia seu Token JWT.
 */
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    try {
        const [config] = await pool.query('SELECT stripeSecretKey, stripeWebhookSecret FROM stripe_configs WHERE id = 1');
        if (!config.length) return res.status(400).send('Webhook não configurado');

        const stripe = new Stripe(config[0].stripeSecretKey);
        const event = stripe.webhooks.constructEvent(req.body, sig, config[0].stripeWebhookSecret);

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const userId = session.client_reference_id;

            // 1. Remove o bloqueio do usuário
            await pool.query('UPDATE users SET is_in_debt = 0 WHERE id = ?', [userId]);
            
            // 2. Registra o pagamento na tabela subscriptions que criamos
            await pool.query(
                'INSERT INTO subscriptions (osc_id, stripe_customer_id, status, amount) VALUES (?, ?, ?, ?)',
                [userId, session.customer, 'active', session.amount_total / 100]
            );

            console.log(`✅ Usuário ${userId} desbloqueado e pagamento registrado.`);
        }

        res.json({ received: true });
    } catch (err) {
        console.error('[Webhook Error]:', err.message);
        res.status(400).send(`Erro: ${err.message}`);
    }
});

export default router;