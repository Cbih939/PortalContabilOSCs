// Localização: src/controllers/webhook.controller.js
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: 'ID_DO_PRECO_STRIPE', // Use o ID do produto/preço do seu Dashboard Stripe
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