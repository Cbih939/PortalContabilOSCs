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