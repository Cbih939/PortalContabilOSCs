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
        // Detectar parâmetros de retorno do Stripe
        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get('success')) {
            setMessage({ type: 'success', text: '✅ Pagamento realizado com sucesso! Sua assinatura está ativa.' });
        } else if (queryParams.get('canceled')) {
            setMessage({ type: 'warning', text: 'ℹ️ O pagamento foi cancelado. Você pode tentar novamente quando quiser.' });
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
                throw new Error("URL de checkout não recebida.");
            }
        } catch (err) {
            console.error("Erro ao iniciar Stripe:", err);
            alert("Erro ao conectar com o Stripe. Verifique sua conexão ou chaves API.");
        }
    };

    if (loading) return <p className={styles.loading}>Carregando financeiro...</p>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Financeiro</h1>

            {message.text && (
                <div className={`${styles.alert} ${styles[message.type]}`}>
                    {message.text}
                </div>
            )}

            {/* Novo Card de Assinatura baseado na Imagem 2 */}
            <div className={styles.subscriptionCard}>
                <div className={styles.cardHeader}>
                    <h2>Assinatura Mensal</h2>
                    <div className={styles.priceContainer}>
                        <span className={styles.currency}>R$</span>
                        <span className={styles.price}>50,00</span>
                    </div>
                    <p className={styles.subtitle}>Gestão completa e segura para sua OSC</p>
                </div>

                <ul className={styles.featuresList}>
                    <li><span>check</span> Contabilidade completa (ITG 2002)</li>
                    <li><span>check</span> Relatórios e documentos automáticos</li>
                    <li><span>check</span> Biblioteca de E-books e Modelos</li>
                    <li><span>check</span> Gestão de voluntários e projetos</li>
                    <li><span>check</span> Guias de abertura e regularização</li>
                </ul>

                <button onClick={handlePagamento} className={styles.payButton}>
                    Quero assinar agora
                </button>
                <p className={styles.footerNote}>Cancelamento a qualquer momento. Suporte incluso.</p>
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
                )}
            </div>
        </div>
    );
};

export default OSCFinanceiro;