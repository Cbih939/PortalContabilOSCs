import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import ds from '../../components/dashboard/dashboard.module.css';
import styles from './FinanceiroHub.module.css';
import OverviewTab from './tabs/OverviewTab.jsx';
import DebtsTab from './tabs/DebtsTab.jsx';
import HistoryTab from './tabs/HistoryTab.jsx';
import StripeTab from './tabs/StripeTab.jsx';

/**
 * Módulo Financeiro unificado (substitui o antigo perfil "Usuário Financeiro").
 *  - Administrador: visão global e configuração do Stripe.
 *  - ADM Contador: somente as OSCs do próprio escritório (o servidor aplica o filtro).
 */
export default function FinanceiroHub() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [params, setParams] = useSearchParams();

  const tabs = [
    { key: 'geral', label: 'Visão geral', Component: OverviewTab },
    { key: 'debitos', label: 'Débitos', Component: DebtsTab },
    { key: 'historico', label: 'Histórico', Component: HistoryTab },
    ...(isAdmin ? [{ key: 'stripe', label: 'Stripe', Component: StripeTab }] : []),
  ];

  const active = tabs.find((t) => t.key === params.get('aba')) || tabs[0];
  const Active = active.Component;

  return (
    <div className={ds.page}>
      <header className={ds.pageHead}>
        <div>
          <h1 className={ds.hello}>Financeiro</h1>
          <p className={ds.sub}>
            {isAdmin ? 'Visão global de todas as OSCs da plataforma.' : 'Situação financeira das OSCs do seu escritório.'}
          </p>
        </div>
      </header>

      <div className={styles.tabs} role="tablist" aria-label="Seções do financeiro">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            id={`tab-${t.key}`}
            aria-selected={active.key === t.key}
            aria-controls="painel-financeiro"
            className={`${styles.tab} ${active.key === t.key ? styles.tabActive : ''}`}
            onClick={() => setParams({ aba: t.key }, { replace: true })}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div id="painel-financeiro" role="tabpanel" aria-labelledby={`tab-${active.key}`}>
        <Active />
      </div>
    </div>
  );
}
