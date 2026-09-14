import React, { useState, useEffect } from 'react';
import styles from './PrestacaoContas.module.css';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '@/services/oscService';

// Ícones básicos
const RevenueIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>;
const ExpenseIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>;
const BalanceIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const DownloadIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const FileIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const EditIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const DeleteIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

export default function PrestacaoContas() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // States
  const [transactionType, setTransactionType] = useState('DESPESA'); // RECEITA or DESPESA
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingTransactionId, setDeletingTransactionId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({ date: '', category: '', description: '', amount: '' });
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await getTransactions();
      setTransactions(data);
    } catch (err) {
      console.error('Erro ao buscar transações', err);
      // Fallback gracioso para a lista local caso a tabela não exista ainda no servidor local
      if (transactions.length === 0) setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const totalReceitas = transactions.filter(t => t.type === 'RECEITA').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalDespesas = transactions.filter(t => t.type === 'DESPESA').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const saldoAtual = totalReceitas - totalDespesas;

  const handleOpenModal = (type, transaction = null) => {
    setTransactionType(type);
    if (transaction) {
      setEditingTransaction(transaction);
      setFormData({
        date: new Date(transaction.transaction_date).toISOString().split('T')[0],
        category: transaction.category,
        description: transaction.description,
        amount: transaction.amount,
      });
    } else {
      setEditingTransaction(null);
      setFormData({ date: new Date().toISOString().split('T')[0], category: '', description: '', amount: '' });
    }
    setFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const confirmDelete = (id) => {
    setDeletingTransactionId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await deleteTransaction(deletingTransactionId);
      await fetchTransactions();
      setIsDeleteModalOpen(false);
      setDeletingTransactionId(null);
    } catch (err) {
      console.error("Erro ao apagar:", err);
      alert("Erro ao apagar a transação.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('type', transactionType);
    data.append('transaction_date', formData.date);
    data.append('category', formData.category);
    data.append('description', formData.description);
    data.append('amount', formData.amount);
    
    if (file) {
      data.append('receipt', file);
    }

    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, data);
      } else {
        await createTransaction(data);
      }
      await fetchTransactions();
      handleCloseModal();
    } catch (error) {
      console.error("Erro ao guardar transação:", error);
      alert("Erro ao salvar os dados.");
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Prestação de Contas</h1>
        <p className={styles.subtitle}>Visão geral financeira e registo de comprovativos reais.</p>
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
        <h2 className={styles.tableTitle}>Lançamentos Registados</h2>
        {loading ? (
          <p>Carregando dados reais...</p>
        ) : transactions.length === 0 ? (
          <p style={{color: '#6b7280', padding: '2rem 0'}}>Ainda não existem registos lançados.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Categoria</th>
                <th>Descrição</th>
                <th>Valor</th>
                <th style={{ textAlign: 'center' }}>Comprovativo</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td>{new Date(t.transaction_date).toLocaleDateString('pt-BR')}</td>
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
                    {t.receipt_filename ? (
                      <a href={`http://localhost:5000/uploads/${t.receipt_filename}`} target="_blank" rel="noopener noreferrer" className={styles.actionBtn} title="Ver Comprovativo">
                        <FileIcon />
                      </a>
                    ) : (
                      <span style={{color: '#ccc'}}>-</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button className={styles.actionBtn} onClick={() => handleOpenModal(t.type, t)} title="Editar Lançamento">
                      <EditIcon />
                    </button>
                    <button className={`${styles.actionBtn} ${styles.textRed}`} onClick={() => confirmDelete(t.id)} title="Apagar Lançamento">
                      <DeleteIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal para Adicionar/Editar Transação */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>
              {editingTransaction ? 'Editar' : 'Registar Nova'} {transactionType === 'RECEITA' ? 'Receita' : 'Despesa'}
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
                <label className={styles.formLabel}>Anexar Comprovativo {editingTransaction && "(Opcional, substitui o anterior)"}</label>
                <input 
                  type="file" 
                  className={styles.formInput} 
                  accept=".pdf, .jpg, .png"
                  onChange={e => setFile(e.target.files[0])}
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

      {/* Modal de Confirmação de Exclusão */}
      {isDeleteModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ maxWidth: '400px', textAlign: 'center' }}>
            <h2 className={styles.modalTitle}>Tem certeza?</h2>
            <p style={{ color: '#4b5563', marginBottom: '2rem' }}>
              Esta ação é irreversível. O lançamento financeiro será apagado permanentemente da sua prestação de contas.
            </p>
            <div className={styles.modalActions} style={{ justifyContent: 'center' }}>
              <button type="button" className={styles.btnSecondary} onClick={() => setIsDeleteModalOpen(false)}>
                Cancelar
              </button>
              <button type="button" className={styles.btnDanger} onClick={handleDelete}>
                <DeleteIcon /> Sim, Apagar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
