import React, { useEffect, useState } from 'react';
import { FiLock, FiCheckCircle } from 'react-icons/fi';
import * as financeiroService from '../../../services/financeiroService.js';
import ds from '../../../components/dashboard/dashboard.module.css';
import ErrorState from '../../../components/dashboard/ErrorState.jsx';
import styles from '../FinanceiroHub.module.css';

/**
 * Configuração do Stripe (somente Administrador).
 * As chaves secretas NUNCA são exibidas: o servidor devolve apenas "configurada" + 4 últimos caracteres.
 * Deixar um campo secreto em branco mantém o valor atual.
 */
export default function StripeTab() {
  const [cfg, setCfg] = useState(null);
  const [form, setForm] = useState({ stripePublishableKey: '', stripeSecretKey: '', stripeWebhookSecret: '', monthlyPriceId: '', packageValue: '' });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await financeiroService.getStripeConfig();
        setCfg(data);
        setForm((f) => ({ ...f, stripePublishableKey: data.stripePublishableKey || '', monthlyPriceId: data.monthlyPriceId || '', packageValue: data.packageValue ?? '' }));
      } catch (err) {
        setError(err?.response?.data?.message || 'Não foi possível carregar a configuração.');
      }
    })();
  }, []);

  const change = (e) => { setSaved(false); setForm((f) => ({ ...f, [e.target.name]: e.target.value })); };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await financeiroService.saveStripeConfig(form);
      setSaved(true);
      setForm((f) => ({ ...f, stripeSecretKey: '', stripeWebhookSecret: '' }));
      setCfg(await financeiroService.getStripeConfig());
    } catch (err) {
      setError(err?.response?.data?.message || 'Erro ao salvar no servidor.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={ds.card} aria-labelledby="stripe-title">
      <div className={ds.cardHead}>
        <h2 id="stripe-title" className={ds.cardTitle}>Configuração do Stripe</h2>
        <span className={ds.pill}><FiLock aria-hidden="true" /> Somente Administrador</span>
      </div>

      {error && <ErrorState message={error} />}

      <form onSubmit={submit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="stripePublishableKey">Chave publicável (Publishable Key)</label>
          <input id="stripePublishableKey" name="stripePublishableKey" value={form.stripePublishableKey} onChange={change} placeholder="pk_live_…" autoComplete="off" />
        </div>

        <div className={styles.field}>
          <label htmlFor="stripeSecretKey">Chave secreta (Secret Key)</label>
          <input id="stripeSecretKey" name="stripeSecretKey" type="password" value={form.stripeSecretKey} onChange={change} autoComplete="new-password"
            placeholder={cfg?.stripeSecretKeySet ? `Configurada (${cfg.stripeSecretKeyMasked}) — deixe em branco para manter` : 'sk_live_…'} />
          {cfg?.stripeSecretKeySet && <small className={styles.ok}><FiCheckCircle aria-hidden="true" /> Chave já configurada</small>}
        </div>

        <div className={styles.field}>
          <label htmlFor="stripeWebhookSecret">Segredo do webhook</label>
          <input id="stripeWebhookSecret" name="stripeWebhookSecret" type="password" value={form.stripeWebhookSecret} onChange={change} autoComplete="new-password"
            placeholder={cfg?.stripeWebhookSecretSet ? `Configurado (${cfg.stripeWebhookSecretMasked}) — deixe em branco para manter` : 'whsec_…'} />
        </div>

        <div className={styles.row2}>
          <div className={styles.field}>
            <label htmlFor="monthlyPriceId">Price ID</label>
            <input id="monthlyPriceId" name="monthlyPriceId" value={form.monthlyPriceId} onChange={change} placeholder="price_…" />
          </div>
          <div className={styles.field}>
            <label htmlFor="packageValue">Valor do pacote (R$)</label>
            <input id="packageValue" name="packageValue" type="number" step="0.01" min="0" value={form.packageValue} onChange={change} />
          </div>
        </div>

        <button type="submit" className={ds.primaryBtn} disabled={saving}>{saving ? 'Salvando…' : 'Salvar configurações'}</button>
        {saved && <p className={styles.ok} role="status"><FiCheckCircle aria-hidden="true" /> Configurações salvas com sucesso.</p>}
      </form>
    </section>
  );
}
