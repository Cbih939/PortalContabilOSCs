import React, { useEffect, useState, useCallback } from 'react';
import { FiPrinter, FiFileText, FiDollarSign } from 'react-icons/fi';
import * as financeiroService from '../../../services/financeiroService.js';
import ds from '../../../components/dashboard/dashboard.module.css';
import EmptyState from '../../../components/dashboard/EmptyState.jsx';
import ErrorState from '../../../components/dashboard/ErrorState.jsx';
import styles from '../FinanceiroHub.module.css';

const brl = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtDate = (v) => new Date(v).toLocaleDateString('pt-BR');

/** Escapa HTML: nomes de OSC vêm de cadastro público e NÃO podem ser interpolados crus no recibo. */
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const openReceipt = (p) => {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Recibo - ${esc(p.osc_name)}</title>
    <style>
      body { font-family: sans-serif; padding: 50px; line-height: 1.6; }
      .container { border: 2px solid #333; padding: 40px; max-width: 800px; margin: auto; position: relative; }
      .header { text-align: center; border-bottom: 2px solid #E85002; margin-bottom: 30px; padding-bottom: 10px; }
      .price { font-size: 28px; font-weight: bold; color: #E85002; text-align: right; margin: 20px 0; }
      .footer { margin-top: 60px; text-align: center; border-top: 1px solid #ccc; padding-top: 20px; }
    </style></head><body>
    <div class="container">
      <div class="header"><h1>RECIBO DE QUITAÇÃO</h1><p>Portal Conta Comigo - Soluções Contábeis</p></div>
      <div class="price">${esc(brl(p.amount))}</div>
      <p>Recebemos de <strong>${esc(p.osc_name)}</strong>, inscrito no CNPJ: <strong>${esc(p.cnpj || 'não informado')}</strong>.</p>
      <p>Referente à mensalidade de competência <strong>${esc(p.competencia)}</strong> conforme nossos registros.</p>
      <p>Data do pagamento: ${esc(fmtDate(p.payment_date))}</p>
      <div class="footer"><p>${esc(fmtDate(new Date()))}</p><br/><br/>__________________________________________<br/>Responsável Financeiro - Conta Comigo</div>
    </div></body></html>`);
  win.document.close();
  win.focus();
  win.print();
};

export default function HistoryTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(await financeiroService.getPaymentHistory());
    } catch (err) {
      setError(err?.response?.data?.message || 'Não foi possível carregar o histórico.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const total = rows.reduce((acc, r) => acc + Number(r.amount || 0), 0);

  return (
    <section className={ds.card} aria-labelledby="hist-pag-title">
      <div className={ds.cardHead}>
        <h2 id="hist-pag-title" className={ds.cardTitle}>Histórico de pagamentos</h2>
        <div className={ds.headActions}>
          <span className={ds.pill}><FiDollarSign aria-hidden="true" /> {brl(total)}</span>
          <button type="button" className={ds.secondaryBtn} onClick={() => window.print()} disabled={rows.length === 0}>
            <FiPrinter aria-hidden="true" /> Imprimir lista
          </button>
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading ? (
        <div className={ds.chartSkeleton} aria-label="Carregando histórico" />
      ) : rows.length === 0 ? (
        <EmptyState compact icon={FiFileText} title="Nenhum pagamento registrado" text="Os pagamentos confirmados pelo Stripe aparecerão aqui." />
      ) : (
        <>
          <div className={`${styles.tableWrap} hide-on-mobile`}>
            <table className={styles.table}>
              <thead>
                <tr><th scope="col">OSC</th><th scope="col">CNPJ</th><th scope="col">Competência</th><th scope="col">Data</th><th scope="col">Valor</th><th scope="col" className="no-print">Recibo</th></tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id}>
                    <td>{p.osc_name}</td><td>{p.cnpj || '—'}</td><td>{p.competencia}</td><td>{fmtDate(p.payment_date)}</td><td><strong>{brl(p.amount)}</strong></td>
                    <td className="no-print"><button type="button" className={ds.secondaryBtn} onClick={() => openReceipt(p)}>Emitir recibo</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className={`${ds.docList} hide-on-desktop`}>
            {rows.map((p) => (
              <li key={p.id} className={styles.mobileCard}>
                <div className={styles.mobileTop}><strong>{p.osc_name}</strong><strong>{brl(p.amount)}</strong></div>
                <small>Competência {p.competencia} · Pago em {fmtDate(p.payment_date)}</small>
                <button type="button" className={ds.secondaryBtn} onClick={() => openReceipt(p)}>Emitir recibo</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
