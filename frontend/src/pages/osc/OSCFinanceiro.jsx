import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './OSCFinanceiro.module.css';

const OSCFinanceiro = () => {
    const [recibos, setRecibos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Busca recibos pagos pelo usuário logado
        const fetchRecibos = async () => {
            const res = await axios.get('/api/oscs/financeiro/meus-pagamentos');
            setRecibos(res.data);
            setLoading(false);
        };
        fetchRecibos();
    }, []);

    const handlePagamento = async () => {
        // Aqui chamaremos a função de Checkout do Stripe que criaremos
        alert("Redirecionando para o Stripe Checkout...");
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Financeiro</h1>
            
            {/* Card de Alerta de Débito */}
            <div className={styles.paymentCard}>
                <h3>Status da Assinatura</h3>
                <p>Mantenha sua contribuição em dia para acessar todos os recursos.</p>
                <button onClick={handlePagamento} className={styles.payButton}>
                    Pagar Mensalidade Agora
                </button>
            </div>

            {/* Lista de Recibos */}
            <div className={styles.historyCard}>
                <h3>Meus Recibos</h3>
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
                                <td>R$ {r.amount}</td>
                                <td><button className={styles.btnSmall}>Imprimir Recibo</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OSCFinanceiro;