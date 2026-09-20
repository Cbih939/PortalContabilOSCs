import React, { useEffect, useState, useCallback } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FiGrid, FiCheckCircle, FiAlertTriangle, FiDollarSign } from 'react-icons/fi';
import * as financeiroService from '../../../services/financeiroService.js';
import ds from '../../../components/dashboard/dashboard.module.css';
import StatCard from '../../../components/dashboard/StatCard.jsx';
import EmptyState from '../../../components/dashboard/EmptyState.jsx';
import ErrorState from '../../../components/dashboard/ErrorState.jsx';

const brl = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function OverviewTab() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setStats(await financeiroService.getStats());
    } catch (err) {
      setError(err?.response?.data?.message || 'Não foi possível carregar os dados financeiros.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (error) return <ErrorState message={error} onRetry={load} />;

  const total = stats?.totalOSCs ?? 0;
  const pct = total > 0 ? Math.round((stats.emDia / total) * 100) : 0;
  const history = stats?.pagamentosHistorico || [];
  const received = history.reduce((acc, m) => acc + (m.valor || 0), 0);

  return (
    <div className={ds.page}>
      <div className={ds.statGrid}>
        <StatCard className={ds.span2} tone="hero" label="Total de OSCs" value={total} hint={stats?.scope === 'office' ? 'Do seu escritório' : 'Em toda a plataforma'} icon={FiGrid} loading={loading} />
        <StatCard tone="success" label="Em dia" value={stats?.emDia ?? 0} icon={FiCheckCircle} loading={loading} />
        <StatCard tone={(stats?.inadimplentes ?? 0) > 0 ? 'warning' : 'default'} label="Inadimplentes" value={stats?.inadimplentes ?? 0} icon={FiAlertTriangle} loading={loading} />
      </div>

      {!loading && total === 0 ? (
        <EmptyState icon={FiGrid} title="Nenhuma OSC encontrada" text="Quando houver OSCs vinculadas, a situação financeira aparecerá aqui." />
      ) : (
        <div className={ds.twoCol}>
          <section className={ds.card} aria-labelledby="adimp-title">
            <div className={ds.cardHead}><h2 id="adimp-title" className={ds.cardTitle}>Adimplência</h2></div>
            <div className={ds.refRow}>
              <strong className={ds.refNumbers}>{stats?.emDia ?? 0} <span>/ {total}</span></strong>
              <strong className={ds.refPct}>{pct}%</strong>
            </div>
            <div className={ds.progress} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={`${pct}% das OSCs em dia`}>
              <span style={{ width: `${pct}%` }} />
            </div>
            <p className={ds.mutedText}>{stats?.inadimplentes > 0 ? `${stats.inadimplentes} OSC(s) com pagamento pendente. Veja a aba Débitos.` : 'Todas as OSCs estão em dia.'}</p>
          </section>

          <section className={ds.card} aria-labelledby="pag-title">
            <div className={ds.cardHead}>
              <h2 id="pag-title" className={ds.cardTitle}>Pagamentos recebidos (6 meses)</h2>
              <span className={ds.pill}><FiDollarSign aria-hidden="true" /> {brl(received)}</span>
            </div>
            {loading ? (
              <div className={ds.chartSkeleton} aria-label="Carregando" />
            ) : (
              <div role="img" aria-label={`Pagamentos por mês. Total no período: ${brl(received)}.`}>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={history} margin={{ top: 22, right: 8, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E4" />
                    <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#646464' }} axisLine={false} tickLine={false} interval={0} />
                    <YAxis tick={{ fontSize: 12, fill: '#646464' }} axisLine={false} tickLine={false} width={48} />
                    <Tooltip formatter={(v) => [brl(v), 'Recebido']} contentStyle={{ borderRadius: 12, border: '1px solid #E4E4E4' }} />
                    <Bar dataKey="valor" fill="#E85002" radius={[8, 8, 0, 0]} maxBarSize={44} minPointSize={2} isAnimationActive={false}>
                      <LabelList dataKey="valor" position="top" isAnimationActive={false} formatter={(v) => (v ? Math.round(v) : 0)} style={{ fontSize: 11, fontWeight: 700, fill: '#333333' }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {!loading && received === 0 && <p className={ds.mutedText}>Nenhum pagamento registrado nos últimos 6 meses.</p>}
          </section>
        </div>
      )}
    </div>
  );
}
