import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
        <div className="flex flex-col h-full bg-gray-50 p-4 md:p-8">
            {/* Header com estilo */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 no-print">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Histórico de Pagamentos</h1>
                    <p className="text-gray-500 text-sm">Consulte e emita recibos de mensalidades quitadas.</p>
                </div>
                <button 
                    onClick={imprimirLista}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all shadow-md flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                    Imprimir Lista
                </button>
            </div>

            {/* Tabela Formatada */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Nome da OSC</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">CNPJ</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase">Competência</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Data Pagto</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase">Valor</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase no-print">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan="6" className="p-10 text-center text-gray-400">Carregando histórico...</td></tr>
                            ) : historico.length === 0 ? (
                                <tr><td colSpan="6" className="p-10 text-center text-gray-400">Nenhum pagamento registrado.</td></tr>
                            ) : historico.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">{p.osc_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{p.cnpj}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600 font-medium">{p.competencia}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {new Date(p.payment_date).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-green-600">
                                        R$ {parseFloat(p.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium no-print">
                                        <button 
                                            onClick={() => gerarRecibo(p)}
                                            className="text-orange-600 hover:text-orange-900 border border-orange-200 px-3 py-1 rounded hover:bg-orange-50 transition-all"
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

            {/* CSS para Impressão do Relatório */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                    .bg-white { box-shadow: none !important; border: none !important; }
                    table { border: 1px solid #000 !important; width: 100% !important; }
                    th { background-color: #eee !important; border-bottom: 2px solid #000 !important; color: black !important; }
                    td { border-bottom: 1px solid #eee !important; }
                }
            `}} />
        </div>
    );
};

export default HistoricoFinanceiro;