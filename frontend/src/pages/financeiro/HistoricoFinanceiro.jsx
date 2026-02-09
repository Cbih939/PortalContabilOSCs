import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './HistoricoFinanceiro.module.css';

const HistoricoFinanceiro = () => {
    const [historico, setHistorico] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistorico = async () => {
            try {
                const res = await axios.get('/api/admin/financeiro/historico');
                setHistorico(res.data);
            } catch (err) {
                console.error("Erro ao carregar dados", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistorico();
    }, []);

    const imprimirLista = () => window.print();

    const gerarRecibo = (p) => {
        const win = window.open('', '_blank');
        win.document.write(`
            <html>
                <head>
                    <title>Recibo - ${p.osc_name}</title>
                    <style>
                        body { font-family: sans-serif; padding: 50px; line-height: 1.6; }
                        .container { border: 2px solid #333; padding: 40px; max-width: 800px; margin: auto; position: relative; }
                        .header { text-align: center; border-bottom: 2px solid #f27405; margin-bottom: 30px; padding-bottom: 10px; }
                        .price { font-size: 28px; font-weight: bold; color: #f27405; text-align: right; margin: 20px 0; }
                        .footer { margin-top: 60px; text-align: center; border-top: 1px solid #ccc; padding-top: 20px; }
                        .stamp { position: absolute; top: 20px; right: 20px; opacity: 0.1; transform: rotate(-20deg); font-size: 40px; font-weight: bold; border: 5px solid red; color: red; padding: 10px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="stamp">PAGO</div>
                        <div class="header">
                            <h1>RECIBO DE QUITAÇÃO</h1>
                            <p>Portal Conta Comigo - Soluções Contábeis</p>
                        </div>
                        <div class="price">R$ ${parseFloat(p.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        <p>Recebemos de <strong>${p.osc_name}</strong>, inscrito no CNPJ: <strong>${p.cnpj}</strong>.</p>
                        <p>Referente à mensalidade de competência <strong>${p.competencia}</strong> conforme nossos registros.</p>
                        <p>Data do pagamento: ${new Date(p.payment_date).toLocaleDateString('pt-BR')}</p>
                        <div class="footer">
                            <p>${new Date().toLocaleDateString('pt-BR')}</p>
                            <br/><br/>
                            __________________________________________<br/>
                            Responsável Financeiro - Conta Comigo
                        </div>
                    </div>
                    <script>window.onload = () => { window.print(); window.close(); }</script>
                </body>
            </html>
        `);
        win.document.close();
    };

    return (
        <div className={styles.container}>
            {/* Header com estilo */}
            <div className={`${styles.headerSection} no-print`}>
                <div>
                    <h1 className={styles.title}>Histórico de Pagamentos</h1>
                    <p className={styles.subtitle}>Consulte e emita recibos de mensalidades quitadas.</p>
                </div>
                <button 
                    onClick={imprimirLista}
                    className={styles.printButton}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                    </svg>
                    Imprimir Lista
                </button>
            </div>

            {/* Tabela Formatada */}
            <div className={styles.tableCard}>
                <div className={styles.responsiveWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Nome da OSC</th>
                                <th>CNPJ</th>
                                <th style={{ textAlign: 'center' }}>Competência</th>
                                <th>Data Pagto</th>
                                <th style={{ textAlign: 'right' }}>Valor</th>
                                <th className="no-print" style={{ textAlign: 'center' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className={styles.emptyState}>Carregando histórico...</td></tr>
                            ) : historico.length === 0 ? (
                                <tr><td colSpan="6" className={styles.emptyState}>Nenhum pagamento registrado.</td></tr>
                            ) : historico.map((p) => (
                                <tr key={p.id}>
                                    <td className={styles.oscName}>{p.osc_name}</td>
                                    <td>{p.cnpj}</td>
                                    <td style={{ textAlign: 'center' }}>{p.competencia}</td>
                                    <td>{new Date(p.payment_date).toLocaleDateString('pt-BR')}</td>
                                    <td className={styles.value}>
                                        R$ {parseFloat(p.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="no-print" style={{ textAlign: 'center' }}>
                                        <button 
                                            onClick={() => gerarRecibo(p)}
                                            className={styles.receiptButton}
                                        >
                                            Ver Recibo
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* CSS para Impressão do Relatório incorporado para segurança do layout */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; padding: 0 !important; }
                    .${styles.container} { padding: 0 !important; }
                    .${styles.tableCard} { border: none !important; box-shadow: none !important; }
                    table { border: 1px solid #000 !important; width: 100% !important; border-collapse: collapse !important; }
                    th { background-color: #eee !important; border: 1px solid #000 !important; color: black !important; padding: 8px !important; }
                    td { border: 1px solid #ddd !important; padding: 8px !important; }
                }
            `}} />
        </div>
    );
};

export default HistoricoFinanceiro;