import React, { useState, useEffect } from 'react';
import styles from './Financeiro.module.css';

export default function FinanceiroPage() {
  const [faturas, setFaturas] = useState([]);
  
  // Exemplo de nota para pagamento retroativo
  const NotaRetroativa = () => (
    <div className={styles.retroactiveNote}>
      <p><strong>Atenção:</strong> Possui pendências de meses anteriores? Selecione a fatura em aberto abaixo para gerar o boleto/PIX de regularização retroativa.</p>
    </div>
  );

  return (
    <div className={styles.container}>
      <h2>Financeiro</h2>
      <NotaRetroativa />
      
      <div className={styles.summaryGrid}>
        <div className={styles.cardPago}>Status: Pago (Ref. Jan/2026)</div>
        <div className={styles.cardAberto}>Status: Em Aberto (Ref. Fev/2026)</div>
      </div>

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
          {/* Mapear faturas do banco aqui */}
          <tr>
            <td>Mensalidade Contabilidade</td>
            <td>10/02/2026</td>
            <td>R$ 450,00</td>
            <td><span className={styles.badgeAberto}>ABERTO</span></td>
            <td><button className={styles.payBtn}>Pagar Agora</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}