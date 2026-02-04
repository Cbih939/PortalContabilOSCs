import React from 'react';
import styles from './Financeiro.module.css';

export default function FinanceiroPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Financeiro</h1>
      
      <div className={styles.retroactiveNote}>
        <span>ℹ️</span>
        <p><strong>Pagamento Retroativo:</strong> Se você possui pendências de meses anteriores, utilize o botão "Regularizar" na lista abaixo para quitar débitos passados.</p>
      </div>
      
      <div className={styles.summaryGrid}>
        <div className={`${styles.card} ${styles.cardPago}`}>
          <span>Último Pago:</span>
          <span>Jan/2026</span>
        </div>
        <div className={`${styles.card} ${styles.cardAberto}`}>
          <span>Pendente:</span>
          <span>Fev/2026</span>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Vencimento</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Mensalidade Contábil - Fev/2026</td>
              <td>10/02/2026</td>
              <td>R$ 450,00</td>
              <td><span className={`${styles.badge} ${styles.badgeAberto}`}>EM ABERTO</span></td>
              <td><button className={styles.payBtn}>Pagar Agora</button></td>
            </tr>
            <tr>
              <td>Mensalidade Contábil - Jan/2026</td>
              <td>10/01/2026</td>
              <td>R$ 450,00</td>
              <td><span className={`${styles.badge} ${styles.badgePago}`}>PAGO</span></td>
              <td>-</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}