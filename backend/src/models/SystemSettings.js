import db from '../config/db.js';

class SystemSettings {
    // Busca a única linha de configuração (ID 1)
    static async getSettings() {
        const [rows] = await db.query('SELECT * FROM system_settings WHERE id = 1');
        return rows[0];
    }

    // Atualiza ou insere as configurações
    static async updateSettings(data) {
        const { 
            stripePublishableKey, 
            stripeSecretKey, 
            stripeWebhookSecret, 
            monthlyPriceId, 
            packageValue 
        } = data;

        const query = `
            UPDATE system_settings 
            SET stripe_publishable_key = ?, 
                stripe_secret_key = ?, 
                stripe_webhook_secret = ?, 
                monthly_price_id = ?, 
                package_value = ?
            WHERE id = 1
        `;

        const [result] = await db.query(query, [
            stripePublishableKey,
            stripeSecretKey,
            stripeWebhookSecret,
            monthlyPriceId,
            packageValue
        ]);

        return result;
    }
}

export default SystemSettings;