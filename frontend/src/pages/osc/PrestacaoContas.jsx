import React, { useState, useEffect } from 'react';
import styles from './PrestacaoContas.module.css';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '@/services/oscService';
import Card, { CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/common/Modal';
import Spinner from '@/components/common/Spinner';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiDownload, FiFileText, FiEdit2, FiTrash2 } from 'react-icons/fi';

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
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Prestação de Contas</h1>
          <p className={styles.pageSubtitle}>Visão geral financeira e registo de comprovativos reais.</p>
        </div>
      </header>

      {/* KPIs */}
      <div className={styles.statsGrid}>
        <Card padding="md" className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={`${styles.iconCircle} ${styles.bgGreen}`}>
              <FiTrendingUp size={24} />
            </div>
            <div className={styles.statText}>
              <span className={styles.statLabel}>Total de Receitas</span>
              <span className={styles.statValue}>{formatCurrency(totalReceitas)}</span>
            </div>
          </div>
        </Card>

        <Card padding="md" className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={`${styles.iconCircle} ${styles.bgRed}`}>
              <FiTrendingDown size={24} />
            </div>
            <div className={styles.statText}>
              <span className={styles.statLabel}>Total de Despesas</span>
              <span className={styles.statValue}>{formatCurrency(totalDespesas)}</span>
            </div>
          </div>
        </Card>

        <Card padding="md" className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={`${styles.iconCircle} ${styles.bgBlue}`}>
              <FiDollarSign size={24} />
            </div>
            <div className={styles.statText}>
              <span className={styles.statLabel}>Saldo em Caixa</span>
              <span className={styles.statValue}>{formatCurrency(saldoAtual)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Ações */}
      <div className={styles.actionsBar}>
        <div className={styles.actionsLeft}>
          <Button variant="danger" icon={<FiTrendingDown />} onClick={() => handleOpenModal('DESPESA')}>
            Nova Despesa
          </Button>
          <Button variant="primary" icon={<FiTrendingUp />} onClick={() => handleOpenModal('RECEITA')}>
            Nova Receita
          </Button>
        </div>
        <div className={styles.actionsRight}>
          <Button variant="secondary" icon={<FiDownload />}>
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Tabela de Lançamentos */}
      <Card padding="none">
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Lançamentos Registados</h2>
        </div>
        <CardBody className={styles.tableBody}>
          {loading ? (
            <div className={styles.loadingContainer}><Spinner text="A carregar transações..." /></div>
          ) : transactions.length === 0 ? (
            <div className={styles.emptyState}>Ainda não existem registos lançados.</div>
          ) : (
            <div className={styles.tableWrapper}>
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
                          <a href={`http://localhost:5000/uploads/${t.receipt_filename}`} target="_blank" rel="noopener noreferrer" className={styles.iconLink} title="Ver Comprovativo">
                            <FiFileText size={18} />
                          </a>
                        ) : (
                          <span className={styles.noFile}>-</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className={styles.actionButtons}>
                          <button className={styles.actionBtn} onClick={() => handleOpenModal(t.type, t)} title="Editar Lançamento">
                            <FiEdit2 size={16} />
                          </button>
                          <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={() => confirmDelete(t.id)} title="Apagar Lançamento">
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Modal para Adicionar/Editar Transação */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={`${editingTransaction ? 'Editar' : 'Registar Nova'} ${transactionType === 'RECEITA' ? 'Receita' : 'Despesa'}`}>
        <form onSubmit={handleSubmit} className={styles.formGrid}>
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
              className={styles.formInput} 
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
            <label className={styles.formLabel}>Anexar Comprovativo {editingTransaction && "(Opcional)"}</label>
            <input 
              type="file" 
              className={styles.formInput} 
              accept=".pdf, .jpg, .png"
              onChange={e => setFile(e.target.files[0])}
            />
          </div>

          <div className={styles.modalActions}>
            <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
            <Button type="submit" variant="primary">
              Salvar {transactionType === 'RECEITA' ? 'Receita' : 'Despesa'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Tem certeza?">
        <p className={styles.deleteConfirmText}>
          Esta ação é irreversível. O lançamento financeiro será apagado permanentemente da sua prestação de contas.
        </p>
        <div className={styles.modalActions}>
          <Button type="button" variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
          <Button type="button" variant="danger" icon={<FiTrash2 />} onClick={handleDelete}>Sim, Apagar</Button>
        </div>
      </Modal>

    </div>
  );
}
