import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getMeusPagamentos } from '@/services/oscService';
import api from '@/services/api';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/common/Spinner';
import { FiCheckCircle, FiInfo, FiCreditCard, FiCheck } from 'react-icons/fi';
import styles from './OSCFinanceiro.module.css';

const OSCFinanceiro = () => {
    const [recibos, setRecibos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isProcessing, setIsProcessing] = useState(false);

    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get('success')) {
            setMessage({ type: 'success', text: 'Pagamento realizado com sucesso! Sua assinatura está ativa.' });
        } else if (queryParams.get('canceled')) {
            setMessage({ type: 'warning', text: 'O pagamento foi cancelado. Você pode tentar novamente.' });
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
        setIsProcessing(true);
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
            setError("Erro ao conectar com a plataforma de pagamento.");
            setIsProcessing(false);
        }
    };

    if (loading) return <div className={styles.loadingContainer}><Spinner text="A carregar dados financeiros..." /></div>;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>Financeiro</h1>
                <p className={styles.pageSubtitle}>Gerencie sua assinatura e histórico de pagamentos.</p>
            </div>

            {message.text && (
                <div className={`${styles.alert} ${styles[message.type]}`}>
                    {message.type === 'success' ? <FiCheckCircle size={20} /> : <FiInfo size={20} />}
                    {message.text}
                </div>
            )}

            <div className={styles.contentGrid}>
                {/* Card de Assinatura */}
                <div className={styles.planCol}>
                    <Card padding="none" className={styles.subscriptionCard}>
                        <CardBody className={styles.subscriptionBody}>
                            <h2 className={styles.planTitle}>Assinatura Mensal</h2>
                            <div className={styles.priceContainer}>
                                <span className={styles.currency}>R$</span>
                                <span className={styles.price}>339,00</span>
                            </div>
                            <p className={styles.planSubtitle}>Gestão completa para sua OSC</p>
                            
                            <ul className={styles.featuresList}>
                                <li><FiCheck className={styles.checkIcon} /> Contabilidade (ITG 2002)</li>
                                <li><FiCheck className={styles.checkIcon} /> Relatórios Automáticos</li>
                                <li><FiCheck className={styles.checkIcon} /> Biblioteca de Modelos</li>
                                <li><FiCheck className={styles.checkIcon} /> Gestão de Voluntários</li>
                                <li><FiCheck className={styles.checkIcon} /> Guias de Regularização</li>
                            </ul>

                            <Button 
                                variant="primary" 
                                size="lg" 
                                block 
                                onClick={handlePagamento}
                                loading={isProcessing}
                                icon={!isProcessing && <FiCreditCard />}
                            >
                                {isProcessing ? 'Processando...' : 'Quero assinar agora'}
                            </Button>
                            <p className={styles.footerNote}>Suporte incluso. Cancele quando quiser.</p>
                        </CardBody>
                    </Card>
                </div>

                {/* Histórico */}
                <div className={styles.historyCol}>
                    <Card padding="none">
                        <CardHeader title="Histórico de Assinaturas" />
                        <CardBody className={styles.historyBody}>
                            {error && <div className={styles.errorText}>{error}</div>}
                            
                            {recibos.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <FiCreditCard className={styles.emptyIcon} />
                                    <p>Nenhum registro de pagamento encontrado.</p>
                                </div>
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
                                                    <td>{new Date(r.created_at).toLocaleDateString('pt-BR')}</td>
                                                    <td className={styles.txId}>{r.stripe_subscription_id || 'Pendente'}</td>
                                                    <td className={styles.amount}>R$ {r.amount ? Number(r.amount).toFixed(2) : '0.00'}</td>
                                                    <td>
                                                        <span className={`${styles.statusBadge} ${r.status === 'active' ? styles.statusActive : styles.statusInactive}`}>
                                                            {r.status === 'active' ? 'Ativo' : r.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default OSCFinanceiro;