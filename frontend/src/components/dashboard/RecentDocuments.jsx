import React from 'react';
import { Link } from 'react-router-dom';
import { FiFileText } from 'react-icons/fi';
import StatusBadge from './StatusBadge.jsx';
import EmptyState from './EmptyState.jsx';
import styles from './dashboard.module.css';

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const fmtDate = (value) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR');
};

/** Últimos documentos, em cards (funciona igual em celular e desktop). */
export default function RecentDocuments({ items = [], showOsc = false, viewAllTo, uploadTo }) {
  return (
    <section className={styles.card} aria-labelledby="recent-title" data-tour="recent-docs">
      <div className={styles.cardHead}>
        <h2 id="recent-title" className={styles.cardTitle}>Documentos recentes</h2>
        {viewAllTo && items.length > 0 && <Link to={viewAllTo} className={styles.linkBtn}>Ver todos</Link>}
      </div>

      {items.length === 0 ? (
        <EmptyState
          compact
          icon={FiFileText}
          title="Nenhum documento enviado"
          text="Você ainda não enviou documentos neste período."
          action={uploadTo ? { label: 'Enviar documento', to: uploadTo } : undefined}
        />
      ) : (
        <ul className={styles.docList}>
          {items.map((doc) => (
            <li key={doc.id} className={styles.docItem}>
              <span className={styles.docIcon}><FiFileText aria-hidden="true" /></span>
              <div className={styles.docInfo}>
                <strong title={doc.original_name}>{doc.original_name}</strong>
                <small>
                  {showOsc && doc.osc_name ? `${doc.osc_name} · ` : ''}
                  {doc.ref_month ? `Ref. ${MONTHS[doc.ref_month - 1]}/${doc.ref_year} · ` : ''}
                  {fmtDate(doc.created_at)}
                </small>
              </div>
              <StatusBadge status={doc.status} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

