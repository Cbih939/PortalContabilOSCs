import Stripe from 'stripe';
import pool from '../config/db.js';

export const createCheckoutSession = async (req, res) => {
    try {
        // 1. Busca as chaves configuradas pelo financeiro no banco
        const [configRows] = await pool.query('SELECT * FROM stripe_configs WHERE id = 1');
        
        if (configRows.length === 0 || !configRows[0].stripeSecretKey) {
            return res.status(500).json({ message: 'Stripe não configurado pelo administrador.' });
        }

        const config = configRows[0];
        const stripe = new Stripe(config.stripeSecretKey);

        // 2. Cria a sessão de checkout usando os dados dinâmicos
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'boleto'],
            line_items: [{
                price_data: {
                    currency: 'brl',
                    product_data: { name: 'Mensalidade Portal Conta Comigo' },
                    unit_amount: Math.round(config.packageValue * 100), // Converte R$ para centavos
                },
                quantity: 1,
            }],
            mode: 'payment',
            client_reference_id: req.user.id.toString(), // ID da OSC para o Webhook identificar
            success_url: `${process.env.FRONTEND_URL}/osc/financeiro?success=true`,
            cancel_url: `${process.env.FRONTEND_URL}/osc/financeiro?canceled=true`,
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Erro no Checkout Stripe:', error);
        res.status(500).json({ message: 'Erro ao processar pagamento.' });
    }
};