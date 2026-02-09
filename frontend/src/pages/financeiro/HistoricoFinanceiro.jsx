import React, { useEffect, useState } from 'react';
import axios from 'axios';

const HistoricoFinanceiro = () => {
    const [historico, setHistorico] = useState([]);

    useEffect(() => {
        const fetchHistorico = async () => {
            const res = await axios.get('/api/admin/financeiro/historico');
            setHistorico(res.data);
        };
        fetchHistorico();
    }, []);

    // Função para Imprimir a Lista Completa
    const imprimirLista = () => {
        window.print();
    };

    // Função para Gerar o Recibo Individual
    const gerarRecibo = (p) => {
        const win = window.open('', '_blank');
        win.document.write(`
            <html>
                <head>
                    <title>Recibo - ${p.osc_name}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; }
                        .recibo-box { border: 5px double #333; padding: 30px; max-width: 700px; margin: auto; }
                        .header { text-align: center; border-bottom: 2px solid #333; margin-bottom: 20px; }
                        .valor { font-size: 24px; font-weight: bold; text-align: right; margin-bottom: 30px; }
                        .footer { margin-top: 50px; text-align: center; }
                        .assinatura { border-top: 1px solid #000; display: inline-block; width: 300px; margin-top: 40px; }
                    </style>
                </head>
                <body>
                    <div class="recibo-box">
                        <div class="header">
                            <h1>RECIBO DE PAGAMENTO</h1>
                            <p>Portal Contábil OSCs - Apoio à Gestão</p>
                        </div>
                        <div class="valor">R$ ${parseFloat(p.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        <p>Recebemos de <strong>${p.osc_name}</strong>, inscrito no CNPJ: <strong>${p.cnpj}</strong>.</p>
                        <p>A importância de <strong>R$ ${p.amount}</strong> referente à mensalidade de competência <strong>${p.competencia}</strong>.</p>
                        <p>Pagamento confirmado em: ${new Date(p.payment_date).toLocaleDateString('pt-BR')}</p>
                        <div class="footer">
                            <p>Brasil, ${new Date().toLocaleDateString('pt-BR')}</p>
                            <div class="assinatura">Responsável Financeiro</div>
                        </div>
                    </div>
                    <script>window.onload = function() { window.print(); window.close(); }</script>
                </body>
            </html>
        `);
        win.document.close();
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6 no-print">
                <h1 className="text-2xl font-bold">Histórico de Pagamentos</h1>
                <button onClick={imprimirLista} className="bg-blue-600 text-white px-4 py-2 rounded shadow">
                    Imprimir Lista Completa
                </button>
            </div>

            <table className="min-w-full bg-white border">
                <thead>
                    <tr className="bg-gray-100 text-left">
                        <th className="p-3 border">Nome da OSC</th>
                        <th className="p-3 border">CNPJ</th>
                        <th className="p-3 border">Mês Competência</th>
                        <th className="p-3 border">Data Pagto</th>
                        <th className="p-3 border">Valor</th>
                        <th className="p-3 border no-print">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {historico.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50">
                            <td className="p-3 border font-semibold">{p.osc_name}</td>
                            <td className="p-3 border">{p.cnpj}</td>
                            <td className="p-3 border text-center">{p.competencia}</td>
                            <td className="p-3 border">
                                {new Date(p.payment_date).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="p-3 border font-bold text-green-600">
                                R$ {parseFloat(p.amount).toFixed(2)}
                            </td>
                            <td className="p-3 border no-print text-center">
                                <button 
                                    onClick={() => gerarRecibo(p)}
                                    className="text-blue-600 underline text-sm"
                                >
                                    Gerar Recibo
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { padding: 0; margin: 0; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
                }
            `}</style>
        </div>
    );
};

export default HistoricoFinanceiro;