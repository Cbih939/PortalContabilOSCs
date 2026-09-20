import React, { useEffect, useState, useCallback } from 'react';
import { FiSearch, FiCheckCircle, FiAlertTriangle, FiGrid } from 'react-icons/fi';
import * as financeiroService from '../../../services/financeiroService.js';
import { useNotification } from '../../../contexts/NotificationContext.jsx';
import ds from '../../../components/dashboard/dashboard.module.css';
import EmptyState from '../../../components/dashboard/EmptyState.jsx';
import ErrorState from '../../../components/dashboard/ErrorState.jsx';
import styles from '../FinanceiroHub.module.css';

function DebtBadge({ inDebt }) {
  return inDebt ? (
    <span className={`${ds.badge} ${ds.badge_danger}`}><FiAlertTriangle aria-hidden="true" />Inadimplente</span>
  ) : (
    <span className={`${ds.badge} ${ds.badge_success}`}><FiCheckCircle aria-hidden="true" />Em dia</span>
  );
}

export default function DebtsTab() {
  const addNotification = useNotification();
  const [oscs, setOscs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async (term) => {
    setLoading(true);
    setError(null);
    try {
      setOscs(await financeiroService.listOscs(term));
    } catch (err) {
      setError(err?.response?.data?.message || 'Não foi possível listar as OSCs.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Busca com pequeno atraso para não consultar o servidor a cada tecla
  useEffect(() => {
    const t = setTimeout(() => load(search), 350);
    return () => clearTimeout(t);
  }, [search, load]);

  const toggle = async (osc) => {
    const next = !osc.is_in_debt;
    if (!window.confirm(`${next ? 'Marcar como INADIMPLENTE' : 'Marcar como EM DIA'}: ${osc.razao_social || osc.name}?`)) return;
    setBusyId(osc.id);
    try {
      await financeiroService.setDebtStatus(osc.id, next);
      addNotification('Situação financeira atualizada.', 'success');
      await load(search);
    } catch (err) {
      addNotification(err?.response?.data?.message || 'Erro ao alterar a situação financeira.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const actionLabel = (osc) => (osc.is_in_debt ? 'Marcar como em dia' : 'Marcar inadimplente');

  return (
    <section className={ds.card} aria-labelledby="deb-title">
      <div className={ds.cardHead}>
        <h2 id="deb-title" className={ds.cardTitle}>Controle de débitos</h2>
      </div>

      <div className={styles.search}>
        <FiSearch aria-hidden="true" />
        <label className="sr-only" htmlFor="busca-osc">Buscar OSC por nome ou CNPJ</label>
        <input id="busca-osc" type="search" placeholder="Buscar por nome ou CNPJ…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {error ? (
        <ErrorState message={error} onRetry={() => load(search)} />
      ) : loading ? (
        <div className={ds.chartSkeleton} aria-label="Carregando organizações" />
      ) : oscs.length === 0 ? (
        <EmptyState compact icon={FiGrid} title="Nenhuma OSC encontrada" text={search ? 'Tente outro nome ou CNPJ.' : 'Não há OSCs para exibir.'} />
      ) : (
        <>
          {/* Desktop: tabela */}
          <div className={`${styles.tableWrap} hide-on-mobile`}>
            <table className={styles.table}>
              <thead>
                <tr><th scope="col">OSC</th><th scope="col">CNPJ</th><th scope="col">Situação</th><th scope="col">Ação</th></tr>
              </thead>
              <tbody>
                {oscs.map((osc) => (
                  <tr key={osc.id}>
                    <td>{osc.razao_social || osc.name}</td>
                    <td>{osc.cnpj || 'Não informado'}</td>
                    <td><DebtBadge inDebt={!!osc.is_in_debt} /></td>
                    <td>
                      <button type="button" className={ds.secondaryBtn} disabled={busyId === osc.id} onClick={() => toggle(osc)}>
                        {actionLabel(osc)}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards */}
          <ul className={`${ds.docList} hide-on-desktop`}>
            {oscs.map((osc) => (
              <li key={osc.id} className={styles.mobileCard}>
                <div className={styles.mobileTop}>
                  <strong>{osc.razao_social || osc.name}</strong>
                  <DebtBadge inDebt={!!osc.is_in_debt} />
                </div>
                <small>CNPJ: {osc.cnpj || 'Não informado'}</small>
                <button type="button" className={ds.secondaryBtn} disabled={busyId === osc.id} onClick={() => toggle(osc)}>
                  {actionLabel(osc)}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
