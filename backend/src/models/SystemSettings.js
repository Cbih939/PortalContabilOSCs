import pool from '../config/db.js';

class SystemSettings {
    static async getSettings() {
        const [rows] = await pool.query('SELECT * FROM system_settings WHERE id = 1');
        return rows[0];
    }

    static async updateSettings(data) {
        const { stripePublishableKey, stripeSecretKey, stripeWebhookSecret, monthlyPriceId, packageValue } = data;
        const query = `
            UPDATE system_settings 
            SET stripe_publishable_key = ?, stripe_secret_key = ?, stripe_webhook_secret = ?, monthly_price_id = ?, package_value = ?
            WHERE id = 1`;
        return await pool.query(query, [stripePublishableKey, stripeSecretKey, stripeWebhookSecret, monthlyPriceId, packageValue]);
    }
}
export default SystemSettings;