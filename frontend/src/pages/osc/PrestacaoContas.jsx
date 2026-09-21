import React, { useState, useEffect, useMemo } from 'react';
import styles from './PrestacaoContas.module.css';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '@/services/oscService';
import Card, { CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/common/Modal';
import Spinner from '@/components/common/Spinner';
import api from '@/services/api';
import { useNotification } from '@/contexts/NotificationContext';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiDownload, FiFileText, FiEdit2, FiTrash2, FiChevronDown } from 'react-icons/fi';

const MONTH_NAMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const pad = (n) => String(n).padStart(2, '0');
const daysIn = (year, month) => new Date(year, month, 0).getDate();
/** Lê a data (AAAA-MM-DD) sem deslocamento de fuso horário. */
const parseDate = (value) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value || ''));
  if (m) return { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };
  const d = new Date(value);
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
};
const csvCell = (v) => {
  const text = String(v ?? '');
  return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export default function PrestacaoContas() {
  const addNotification = useNotification();
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
  const today = new Date();
  const [formData, setFormData] = useState({ year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate(), category: '', description: '', amount: '' });
  const [openYears, setOpenYears] = useState(() => new Set([today.getFullYear()]));
  const [openMonths, setOpenMonths] = useState(() => new Set([`${today.getFullYear()}-${today.getMonth() + 1}`]));
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

  // Lançamentos organizados por ano > mês (mais recente primeiro)
  const grouped = useMemo(() => {
    const years = new Map();
    for (const t of transactions) {
      const { year, month } = parseDate(t.transaction_date);
      if (!years.has(year)) years.set(year, new Map());
      const months = years.get(year);
      if (!months.has(month)) months.set(month, []);
      months.get(month).push(t);
    }
    const byDateDesc = (a, b) => String(b.transaction_date).localeCompare(String(a.transaction_date)) || b.id - a.id;
    return [...years.entries()].sort((a, b) => b[0] - a[0]).map(([year, months]) => ({
      year,
      months: [...months.entries()].sort((a, b) => b[0] - a[0]).map(([month, items]) => {
        const receitas = items.filter((t) => t.type === 'RECEITA').reduce((n, t) => n + Number(t.amount), 0);
        const despesas = items.filter((t) => t.type === 'DESPESA').reduce((n, t) => n + Number(t.amount), 0);
        return { month, items: [...items].sort(byDateDesc), receitas, despesas };
      }),
    }));
  }, [transactions]);

  const toggle = (setter, key) => setter((prev) => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });

  const handleExportCsv = () => {
    const rows = [...transactions].sort((a, b) => String(a.transaction_date).localeCompare(String(b.transaction_date)) || a.id - b.id);
    const header = ['Data', 'Ano', 'Mês', 'Tipo', 'Categoria', 'Descrição', 'Valor (R$)', 'Comprovante'];
    const lines = rows.map((t) => {
      const d = parseDate(t.transaction_date);
      const signed = (t.type === 'RECEITA' ? 1 : -1) * Number(t.amount);
      return [`${pad(d.day)}/${pad(d.month)}/${d.year}`, d.year, MONTH_NAMES[d.month - 1], t.type, t.category, t.description,
        signed.toFixed(2).replace('.', ','), t.receipt_filename ? 'Sim' : 'Não'];
    });
    // BOM + ";" para abrir corretamente (acentos e colunas) no Excel em português
    const csv = '\uFEFF' + [header, ...lines].map((r) => r.map(csvCell).join(';')).join('\r\n');
    const url = window.URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `prestacao-de-contas-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleOpenModal = (type, transaction = null) => {
    setTransactionType(type);
    if (transaction) {
      setEditingTransaction(transaction);
      const d = parseDate(transaction.transaction_date);
      setFormData({
        year: d.year, month: d.month, day: d.day,
        category: transaction.category,
        description: transaction.description,
        amount: transaction.amount,
      });
    } else {
      setEditingTransaction(null);
      const now = new Date();
      setFormData({ year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate(), category: '', description: '', amount: '' });
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
    const day = Math.min(Number(formData.day) || 1, daysIn(formData.year, formData.month));
    data.append('transaction_date', `${formData.year}-${pad(formData.month)}-${pad(day)}`);
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

  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear();
    const fromData = transactions.map((t) => parseDate(t.transaction_date).year);
    const min = Math.min(current - 5, ...fromData);
    const max = Math.max(current + 1, ...fromData);
    return Array.from({ length: max - min + 1 }, (_, i) => max - i);
  }, [transactions]);

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // Comprovantes são privados: abre pela API autenticada, nunca por URL pública/localhost.
  const openReceipt = async (transactionId) => {
    try {
      const { data } = await api.get(`/transactions/${transactionId}/receipt`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(data);
      window.open(url, '_blank', 'noopener');
      setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
    } catch {
      addNotification('Não foi possível abrir o comprovante.', 'error');
    }
  };

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
          <Button variant="secondary" icon={<FiDownload />} onClick={handleExportCsv} disabled={transactions.length === 0}>
            Exportar CSV
          </Button>
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
            <div className={styles.groups}>
              {grouped.map(({ year, months }) => {
                const yOpen = openYears.has(year);
                const yTotal = months.reduce((n, m) => n + m.items.length, 0);
                return (
                  <section key={year} className={styles.yearGroup}>
                    <button type="button" className={styles.groupBtn} aria-expanded={yOpen} onClick={() => toggle(setOpenYears, year)}>
                      <span className={styles.groupTitle}>{year}</span>
                      <span className={styles.groupCount}>{yTotal} {yTotal === 1 ? 'lançamento' : 'lançamentos'}</span>
                      <FiChevronDown className={`${styles.groupChevron} ${yOpen ? styles.groupChevronOpen : ''}`} aria-hidden="true" />
                    </button>

                    {yOpen && months.map(({ month, items, receitas, despesas }) => {
                      const key = `${year}-${month}`;
                      const mOpen = openMonths.has(key);
                      return (
                        <div key={key} className={styles.monthGroup}>
                          <button type="button" className={styles.monthBtn} aria-expanded={mOpen} onClick={() => toggle(setOpenMonths, key)}>
                            <span className={styles.monthTitle}>{MONTH_NAMES[month - 1]}</span>
                            <span className={styles.monthTotals}>
                              <span className={styles.textGreen}>+{formatCurrency(receitas)}</span>
                              <span className={styles.textRed}>-{formatCurrency(despesas)}</span>
                              <strong>{formatCurrency(receitas - despesas)}</strong>
                            </span>
                            <FiChevronDown className={`${styles.groupChevron} ${mOpen ? styles.groupChevronOpen : ''}`} aria-hidden="true" />
                          </button>

                          {mOpen && (
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
                                  {items.map((t) => (
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
                                          <button type="button" onClick={() => openReceipt(t.id)} className={styles.iconLink} title="Ver Comprovativo" aria-label="Ver comprovante" style={{ background: 'none', border: 0, cursor: 'pointer' }}>
                                            <FiFileText size={18} />
                                          </button>
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
                        </div>
                      );
                    })}
                  </section>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Modal para Adicionar/Editar Transação */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={`${editingTransaction ? 'Editar' : 'Registar Nova'} ${transactionType === 'RECEITA' ? 'Receita' : 'Despesa'}`}>
        <form onSubmit={handleSubmit} className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="pc-ano">Ano</label>
            <select id="pc-ano" className={styles.formInput} required value={formData.year}
              onChange={e => setFormData({ ...formData, year: Number(e.target.value) })}>
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="pc-mes">Mês</label>
            <select id="pc-mes" className={styles.formInput} required value={formData.month}
              onChange={e => setFormData({ ...formData, month: Number(e.target.value) })}>
              {MONTH_NAMES.map((name, i) => <option key={name} value={i + 1}>{name}</option>)}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="pc-dia">Dia</label>
            <input id="pc-dia" type="number" min="1" max={daysIn(formData.year, formData.month)} className={styles.formInput} required
              value={formData.day} onChange={e => setFormData({ ...formData, day: e.target.value })} />
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
