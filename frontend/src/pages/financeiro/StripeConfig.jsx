import React, { useState, useEffect } from 'react';
import styles from './StripeConfig.module.css';
import api from '../../services/api';

export default function StripeConfig() {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    stripePublishableKey: '',
    stripeSecretKey: '',
    stripeWebhookSecret: '',
    monthlyPriceId: '',
    packageValue: ''
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await api.get('/admin/financeiro/config');
        if (response.data) setConfig(response.data);
      } catch (err) {
        console.error("Erro ao carregar configurações:", err);
      }
    };
    fetchConfig();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/admin/financeiro/config', config);
      alert('Configurações salvas com sucesso!');
    } catch (err) {
      alert('Erro ao salvar no servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Configuração do Stripe</h1>
        <p className={styles.subtitle}>Gerencie as chaves de API e IDs de preços para assinaturas.</p>
      </header>

      <form className={styles.configForm} onSubmit={handleSubmit}>
        <div className={styles.section}>
          <h3>Chaves de API</h3>
          <div className={styles.inputGroup}>
            <label>Stripe Publishable Key</label>
            <input 
              type="text" 
              name="stripePublishableKey" 
              value={config.stripePublishableKey}
              onChange={handleChange}
              placeholder="pk_test_..."
              required 
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Stripe Secret Key</label>
            <input 
              type="password" 
              name="stripeSecretKey" 
              value={config.stripeSecretKey}
              onChange={handleChange}
              placeholder="sk_test_..."
              required 
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Webhook Secret</label>
            <input 
              type="password" 
              name="stripeWebhookSecret" 
              value={config.stripeWebhookSecret}
              onChange={handleChange}
              placeholder="whsec_..."
            />
          </div>
        </div>

        <div className={styles.section}>
          <h3>Configuração do Plano</h3>
          <div className={styles.gridInputs}>
            <div className={styles.inputGroup}>
              <label>Stripe Price ID</label>
              <input 
                type="text" 
                name="monthlyPriceId" 
                value={config.monthlyPriceId}
                onChange={handleChange}
                placeholder="price_..."
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Valor Mensal (R$)</label>
              <input 
                type="number" 
                name="packageValue" 
                value={config.packageValue}
                onChange={handleChange}
                step="0.01"
              />
            </div>
          </div>
        </div>

        <button type="submit" className={styles.saveButton} disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </form>
    </div>
  );
}