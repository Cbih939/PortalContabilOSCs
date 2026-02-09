import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './OSCFinanceiro.module.css';
import { getMeusPagamentos } from '@/services/oscService';


const OSCFinanceiro = () => {
    const [recibos, setRecibos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
    const fetchRecibos = async () => {
      try {
        const res = await getMeusPagamentos();
        setRecibos(res.data);
      } catch (err) {
        console.error('Erro ao carregar recibos:', err);
        setError('Não foi possível carregar seus pagamentos.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecibos();
  }, []);

    const handlePagamento = () => {
    alert('Redirecionando para o Stripe Checkout...');
  };

  if (loading) {
    return <p className={styles.loading}>Carregando financeiro...</p>;
  }

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Financeiro</h1>

      <div className={styles.paymentCard}>
        <h3>Status da Assinatura</h3>
        <p>Mantenha sua contribuição em dia para acessar todos os recursos.</p>
        <button onClick={handlePagamento} className={styles.payButton}>
          Pagar Mensalidade Agora
        </button>
      </div>

      <div className={styles.historyCard}>
        <h3>Meus Recibos</h3>

        {recibos.length === 0 ? (
          <p>Nenhum pagamento encontrado.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Data</th>
                <th>Competência</th>
                <th>Valor</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {recibos.map(r => (
                <tr key={r.id}>
                  <td>{new Date(r.payment_date).toLocaleDateString()}</td>
                  <td>{r.competencia}</td>
                  <td>R$ {Number(r.amount).toFixed(2)}</td>
                  <td>
                    <button className={styles.btnSmall}>
                      Imprimir Recibo
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default OSCFinanceiro;