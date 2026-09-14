import React, { useState } from 'react';
import styles from './PrestacaoContas.module.css';

// Ícones básicos
const RevenueIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>;
const ExpenseIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>;
const BalanceIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const DownloadIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const FileIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;

const MOCK_DATA = [
  { id: 1, date: '2023-10-01', type: 'RECEITA', category: 'Doação Parceiro', description: 'Doação Fundação XPTO', amount: 15000.00 },
  { id: 2, date: '2023-10-05', type: 'DESPESA', category: 'Recursos Humanos', description: 'Pagamento Salários Outubro', amount: 8500.00 },
  { id: 3, date: '2023-10-12', type: 'DESPESA', category: 'Manutenção', description: 'Reparos no telhado sede', amount: 1200.50 },
  { id: 4, date: '2023-10-15', type: 'RECEITA', category: 'Edital Público', description: '1ª Parcela Edital Cultura', amount: 25000.00 },
  { id: 5, date: '2023-10-18', type: 'DESPESA', category: 'Materiais', description: 'Compra computadores', amount: 4300.00 },
];

export default function PrestacaoContas() {
  const [transactions, setTransactions] = useState(MOCK_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState('DESPESA'); // RECEITA or DESPESA
  
  // Form state
  const [formData, setFormData] = useState({ date: '', category: '', description: '', amount: '' });

  const totalReceitas = transactions.filter(t => t.type === 'RECEITA').reduce((acc, curr) => acc + curr.amount, 0);
  const totalDespesas = transactions.filter(t => t.type === 'DESPESA').reduce((acc, curr) => acc + curr.amount, 0);
  const saldoAtual = totalReceitas - totalDespesas;

  const handleOpenModal = (type) => {
    setTransactionType(type);
    setFormData({ date: new Date().toISOString().split('T')[0], category: '', description: '', amount: '' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTransaction = {
      id: transactions.length + 1,
      type: transactionType,
      date: formData.date,
      category: formData.category,
      description: formData.description,
      amount: parseFloat(formData.amount) || 0,
    };
    setTransactions([newTransaction, ...transactions]);
    handleCloseModal();
  };

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Prestação de Contas</h1>
        <p className={styles.subtitle}>Visão geral financeira e registo de comprovativos.</p>
      </header>

      {/* KPIs */}
      <div className={styles.statsGrid}>
        <div className={styles.card}>
          <div className={`${styles.iconCircle} ${styles.bgGreen}`}>
            <RevenueIcon />
          </div>
          <div className={styles.cardContent}>
            <span className={styles.cardLabel}>Total de Receitas</span>
            <span className={styles.cardValue}>{formatCurrency(totalReceitas)}</span>
          </div>
        </div>

        <div className={styles.card}>
          <div className={`${styles.iconCircle} ${styles.bgRed}`}>
            <ExpenseIcon />
          </div>
          <div className={styles.cardContent}>
            <span className={styles.cardLabel}>Total de Despesas</span>
            <span className={styles.cardValue}>{formatCurrency(totalDespesas)}</span>
          </div>
        </div>

        <div className={styles.card}>
          <div className={`${styles.iconCircle} ${styles.bgBlue}`}>
            <BalanceIcon />
          </div>
          <div className={styles.cardContent}>
            <span className={styles.cardLabel}>Saldo em Caixa</span>
            <span className={styles.cardValue}>{formatCurrency(saldoAtual)}</span>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className={styles.actionsBar}>
        <div className={styles.actionsLeft}>
          <button className={styles.btnPrimary} onClick={() => handleOpenModal('DESPESA')}>
            <ExpenseIcon /> Nova Despesa
          </button>
          <button className={styles.btnSecondary} onClick={() => handleOpenModal('RECEITA')}>
            <RevenueIcon /> Nova Receita
          </button>
        </div>
        <div className={styles.actionsRight}>
          <button className={styles.btnSecondary}>
            <DownloadIcon /> Exportar PDF
          </button>
        </div>
      </div>

      {/* Tabela de Lançamentos */}
      <div className={styles.tableContainer}>
        <h2 className={styles.tableTitle}>Últimos Lançamentos</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Data</th>
              <th>Tipo</th>
              <th>Categoria</th>
              <th>Descrição</th>
              <th>Valor</th>
              <th style={{ textAlign: 'center' }}>Comprovativo</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id}>
                <td>{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                <td>
                  <span className={`${styles.badge} ${t.type === 'RECEITA' ? styles.badgeReceita : styles.badgeDespesa}`}>
                    {t.type}
                  </span>
                </td>
                <td>{t.category}</td>
                <td>{t.description}</td>
                <td className={t.type === 'RECEITA' ? styles.textGreen : styles.textRed}>
                  {t.type === 'RECEITA' ? '+' : '-'}{formatCurrency(t.amount)}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button className={styles.actionBtn} title="Ver Comprovativo">
                    <FileIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para Adicionar Transação */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>
              Registar Nova {transactionType === 'RECEITA' ? 'Receita' : 'Despesa'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Data do Documento</label>
                <input 
                  type="date" 
                  className={styles.formInput} 
                  required 
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Categoria</label>
                <select 
                  className={styles.formSelect} 
                  required
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option value="">Selecione...</option>
                  <option value="Recursos Humanos">Recursos Humanos</option>
                  <option value="Manutenção">Manutenção e Obras</option>
                  <option value="Materiais">Compra de Materiais</option>
                  <option value="Impostos">Impostos e Taxas</option>
                  <option value="Doação">Doação/Patrocínio</option>
                  <option value="Edital">Edital Governamental</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Descrição / Histórico</label>
                <input 
                  type="text" 
                  className={styles.formInput} 
                  placeholder="Ex: Compra de tintas para a sede"
                  required
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Valor (R$)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0"
                  className={styles.formInput} 
                  placeholder="0.00"
                  required
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Anexar Comprovativo (Fatura/Recibo)</label>
                <input 
                  type="file" 
                  className={styles.formInput} 
                  accept=".pdf, .jpg, .png"
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.btnSecondary} onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  Salvar {transactionType === 'RECEITA' ? 'Receita' : 'Despesa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
