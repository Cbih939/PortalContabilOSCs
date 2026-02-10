import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './OSCFinanceiro.module.css';
import { getMeusPagamentos } from '@/services/oscService';
import api from '@/services/api';

const OSCFinanceiro = () => {
    const [recibos, setRecibos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get('success')) {
            setMessage({ type: 'success', text: '✅ Pagamento realizado com sucesso! Sua assinatura está ativa.' });
        } else if (queryParams.get('canceled')) {
            setMessage({ type: 'warning', text: 'ℹ️ O pagamento foi cancelado. Você pode tentar novamente.' });
        }

        const fetchRecibos = async () => {
            try {
                const res = await getMeusPagamentos();
                setRecibos(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error('Erro ao carregar recibos:', err);
                setError('Não foi possível carregar seu histórico financeiro.');
            } finally {
                setLoading(false);
            }
        };
        fetchRecibos();
    }, [location]);

    const handlePagamento = async () => {
        try {
            setError(null);
            const response = await api.post('/webhooks/create-checkout-session');
            if (response.data && response.data.url) {
                window.location.href = response.data.url;
            } else {
                throw new Error("URL não recebida.");
            }
        } catch (err) {
            console.error("Erro Stripe:", err);
            alert("Erro ao conectar com o Stripe.");
        }
    };

    if (loading) return <p className={styles.loading}>Carregando financeiro...</p>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Financeiro</h1>

            {/* Centralização das mensagens */}
            {message.text && (
                <div className={styles.messageWrapper}>
                    <div className={`${styles.alert} ${styles[message.type]}`}>
                        {message.text}
                    </div>
                </div>
            )}

            {/* Card Compacto e Centralizado */}
            <div className={styles.centerWrapper}>
                <div className={styles.subscriptionCard}>
                    <div className={styles.cardHeader}>
                        <h2>Assinatura Mensal</h2>
                        <div className={styles.priceContainer}>
                            <span className={styles.currency}>R$</span>
                            <span className={styles.price}>50,00</span>
                        </div>
                        <p className={styles.subtitle}>Gestão completa para sua OSC</p>
                    </div>

                    <ul className={styles.featuresList}>
                        <li><span className={styles.checkIcon}>✔</span> Contabilidade (ITG 2002)</li>
                        <li><span className={styles.checkIcon}>✔</span> Relatórios Automáticos</li>
                        <li><span className={styles.checkIcon}>✔</span> Biblioteca de Modelos</li>
                        <li><span className={styles.checkIcon}>✔</span> Gestão de Voluntários</li>
                        <li><span className={styles.checkIcon}>✔</span> Guias de Regularização</li>
                    </ul>

                    <button onClick={handlePagamento} className={styles.payButton}>
                        Quero assinar agora
                    </button>
                    <p className={styles.footerNote}>Suporte incluso. Cancele quando quiser.</p>
                </div>
            </div>

            {/* Histórico de Assinaturas */}
            <div className={styles.historyCard}>
                <h3>Histórico de Assinaturas</h3>
                {error && <p className={styles.error}>{error}</p>}
                
                {recibos.length === 0 ? (
                    <p>Nenhum registro de pagamento encontrado.</p>
                ) : (
                    <div className={styles.tableWrapper}>
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
                                        <td>{new Date(r.created_at).toLocaleDateString()}</td>
                                        <td>{r.stripe_subscription_id || 'Pendente'}</td>
                                        <td>R$ {r.amount ? Number(r.amount).toFixed(2) : '0.00'}</td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${styles[`status_${r.status}`]}`}>
                                                {r.status === 'active' ? '✅ Ativo' : r.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OSCFinanceiro;