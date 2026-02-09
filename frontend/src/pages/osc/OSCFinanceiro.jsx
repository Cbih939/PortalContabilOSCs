import React, { useState, useEffect } from 'react';
import styles from './OSCFinanceiro.module.css';
import { getMeusPagamentos } from '@/services/oscService';
import api from '@/services/api'; // Certifica-te que tens o axios configurado aqui

const OSCFinanceiro = () => {
    const [recibos, setRecibos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecibos = async () => {
            try {
                const res = await getMeusPagamentos();
                // O axios geralmente retorna os dados diretamente em res.data
                setRecibos(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error('Erro ao carregar recibos:', err);
                setError('Não foi possível carregar seu histórico financeiro.');
            } finally {
                setLoading(false);
            }
        };
        fetchRecibos();
    }, []);

    // --- LÓGICA REAL DE PAGAMENTO ---
    const handlePagamento = async () => {
        try {
            setError(null);
            // 1. Chama o endpoint que criámos no backend para o Stripe
            const response = await api.post('/webhooks/create-checkout-session');
            
            if (response.data && response.data.url) {
                // 2. Redireciona o utilizador para o Stripe Checkout oficial
                window.location.href = response.data.url;
            } else {
                throw new Error("URL de checkout não recebida.");
            }
        } catch (err) {
            console.error("Erro ao iniciar Stripe:", err);
            alert("Erro ao conectar com o Stripe. Verifique se o backend está online.");
        }
    };

    if (loading) return <p className={styles.loading}>Carregando financeiro...</p>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Financeiro</h1>

            <div className={styles.paymentCard}>
                <h3>Status da Assinatura</h3>
                <p>Mantenha sua contribuição em dia para acessar todos os recursos.</p>
                {error && <p className={styles.error} style={{color: 'red'}}>{error}</p>}
                <button onClick={handlePagamento} className={styles.payButton}>
                    Pagar Mensalidade Agora
                </button>
            </div>

            <div className={styles.historyCard}>
                <h3>Histórico de Assinaturas</h3>

                {recibos.length === 0 ? (
                    <p>Nenhum registro de pagamento encontrado.</p>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>ID Transação</th>
                                <th>Valor</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recibos.map(r => (
                                <tr key={r.id}>
                                    {/* Ajustado para os nomes das colunas da tabela 'subscriptions' */}
                                    <td>{new Date(r.created_at).toLocaleDateString()}</td>
                                    <td>{r.stripe_subscription_id || 'Pendente'}</td>
                                    <td>R$ {r.amount ? Number(r.amount).toFixed(2) : '0.00'}</td>
                                    <td>
                                        <span className={styles[`status_${r.status}`]}>
                                            {r.status === 'active' ? '✅ Ativo' : '⏳ ' + r.status}
                                        </span>
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