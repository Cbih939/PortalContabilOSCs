import React, { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FiBarChart2 } from 'react-icons/fi';
import EmptyState from './EmptyState.jsx';
import ErrorState from './ErrorState.jsx';
import styles from './dashboard.module.css';

const ORANGE = '#E85002';
const GRAY = '#A7A7A7';

const RANGES = [
  { key: '6', label: '6 meses' },
  { key: '12', label: '12 meses' },
  { key: 'custom', label: 'Personalizado' },
];

const toMonthValue = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

/**
 * Histórico de envios (barras). Dados REAIS: meses sem movimento aparecem com o zero rotulado.
 * O período é controlado pelo pai (`range`), que refaz a consulta.
 */
export default function HistoryChart({ history = [], current, range, onRangeChange, loading, error, onRetry, title = 'Histórico de envios' }) {
  const [custom, setCustom] = useState(() => {
    const now = new Date();
    return { from: toMonthValue(new Date(now.getFullYear(), now.getMonth() - 5, 1)), to: toMonthValue(now) };
  });

  const total = history.reduce((acc, m) => acc + m.count, 0);
  const emptyMonths = history.filter((m) => m.count === 0).length;
  const dense = history.length > 8;
  const currentKey = current ? `${current.year}-${current.month}` : null;
  const peak = history.reduce((best, m) => (m.count > (best?.count ?? -1) ? m : best), null);

  const pickRange = (key) => {
    if (key === 'custom') onRangeChange({ key, from: custom.from, to: custom.to });
    else onRangeChange({ key });
  };

  const applyCustom = (next) => {
    setCustom(next);
    if (next.from && next.to && next.from <= next.to) onRangeChange({ key: 'custom', ...next });
  };

  return (
    <section className={styles.card} aria-labelledby="hist-title" data-tour="history-chart">
      <div className={styles.cardHead}>
        <h2 id="hist-title" className={styles.cardTitle}>{title}</h2>
        <div className={styles.tabs} role="tablist" aria-label="Período">
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              role="tab"
              aria-selected={range.key === r.key}
              className={`${styles.tab} ${range.key === r.key ? styles.tabActive : ''}`}
              onClick={() => pickRange(r.key)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {range.key === 'custom' && (
        <div className={styles.customRange}>
          <label>De <input type="month" value={custom.from} max={custom.to} onChange={(e) => applyCustom({ ...custom, from: e.target.value })} /></label>
          <label>Até <input type="month" value={custom.to} min={custom.from} onChange={(e) => applyCustom({ ...custom, to: e.target.value })} /></label>
        </div>
      )}

      {error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : loading ? (
        <div className={styles.chartSkeleton} aria-label="Carregando gráfico" />
      ) : history.length === 0 ? (
        <EmptyState compact icon={FiBarChart2} title="Dados indisponíveis" text="Não há dados suficientes para este período." />
      ) : (
        <>
          <div className={styles.chartBox} role="img" aria-label={`Documentos enviados por mês. Total no período: ${total}.`}>
            <ResponsiveContainer width="100%" height={dense ? 240 : 220}>
              <BarChart data={history} margin={{ top: 22, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E4" />
                <XAxis
                  dataKey="label"
                  tickFormatter={(l) => (dense ? l.split('/')[0] : l)}
                  tick={{ fontSize: 12, fill: '#646464' }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#646464' }} axisLine={false} tickLine={false} width={38} />
                <Tooltip
                  cursor={{ fill: 'rgba(232,80,2,0.08)' }}
                  formatter={(value) => [`${value} documento${value === 1 ? '' : 's'}`, 'Enviados']}
                  contentStyle={{ borderRadius: 12, border: '1px solid #E4E4E4', fontSize: 13 }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={44} minPointSize={2} isAnimationActive={false}>
                  {history.map((m) => (
                    <Cell key={`${m.year}-${m.month}`} fill={`${m.year}-${m.month}` === currentKey ? ORANGE : GRAY} />
                  ))}
                  <LabelList dataKey="count" position="top" isAnimationActive={false} style={{ fontSize: 12, fontWeight: 700, fill: '#333333' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.chartLegend}>
            <span><i style={{ background: ORANGE }} /> Mês atual</span>
            <span><i style={{ background: GRAY }} /> Meses anteriores</span>
          </div>

          <p className={styles.mutedText}>
            {total === 0
              ? 'Nenhum documento enviado neste período.'
              : `${total} documento${total === 1 ? '' : 's'} no período${peak && peak.count > 0 ? ` · maior fluxo: ${peak.label} (${peak.count})` : ''}${emptyMonths > 0 ? ` · ${emptyMonths} mês${emptyMonths === 1 ? '' : 'es'} sem movimentação` : ''}.`}
          </p>

          <details className={styles.tableAlt}>
            <summary>Ver como tabela</summary>
            <table>
              <thead><tr><th scope="col">Mês</th><th scope="col">Enviados</th><th scope="col">Concluídos</th></tr></thead>
              <tbody>
                {history.map((m) => (
                  <tr key={`${m.year}-${m.month}`}><th scope="row">{m.label}</th><td>{m.count}</td><td>{m.concluded}</td></tr>
                ))}
              </tbody>
            </table>
          </details>
        </>
      )}
    </section>
  );
}
