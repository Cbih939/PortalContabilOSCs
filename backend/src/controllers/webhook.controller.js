// Localização: src/controllers/webhook.controller.js
import Stripe from 'stripe';
import pool from '../config/db.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
    try {
        // Busca o plano ativo no banco de dados
        const [plans] = await pool.execute('SELECT * FROM plans WHERE is_active = true LIMIT 1');
        
        let activePlan = plans[0];

        // Se não tiver plano ativo, criar um fallback genérico (hardcoded fallback)
        if (!activePlan) {
            activePlan = {
                name: 'Assinatura Padrão',
                amount: 339.00, // valor fallback corrigido
                interval_type: 'month'
            };
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'brl',
                    product_data: {
                        name: activePlan.name,
                        description: 'Acesso ao Portal Contábil OSCs'
                    },
                    unit_amount: Math.round(activePlan.amount * 100), // Stripe usa centavos
                    recurring: {
                        interval: activePlan.interval_type || 'month',
                    },
                },
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: `${process.env.FRONTEND_URL}/dashboard/financeiro?success=true`,
            cancel_url: `${process.env.FRONTEND_URL}/dashboard/financeiro?canceled=true`,
            customer_email: req.user.email,
            metadata: { osc_id: req.user.id }
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error("Erro Stripe:", error);
        res.status(500).json({ message: "Erro ao criar sessão de pagamento" });
    }
};