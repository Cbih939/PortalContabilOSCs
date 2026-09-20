import React, { useState, useEffect } from 'react';
import * as planService from '../../services/planService.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import Button from '../../components/ui/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import Modal from '../../components/common/Modal.jsx';
import styles from './ManagePlans.module.css';
import { FiPlus, FiEdit2, FiTrash2, FiCheckCircle } from 'react-icons/fi';

export default function ManagePlans() {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    interval_type: 'month',
    is_active: false
  });

  const addNotification = useNotification();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const data = await planService.getPlans();
      setPlans(data || []);
    } catch (error) {
      addNotification("Erro ao carregar os planos.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (plan = null) => {
    if (plan) {
      setCurrentPlan(plan);
      setFormData({
        name: plan.name,
        amount: plan.amount,
        interval_type: plan.interval_type,
        is_active: Boolean(plan.is_active)
      });
    } else {
      setCurrentPlan(null);
      setFormData({
        name: '',
        amount: '',
        interval_type: 'month',
        is_active: false
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentPlan(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentPlan) {
        await planService.updatePlan(currentPlan.id, formData);
        addNotification("Plano atualizado com sucesso!", "success");
      } else {
        await planService.createPlan(formData);
        addNotification("Plano criado com sucesso!", "success");
      }
      handleCloseModal();
      fetchPlans();
    } catch (error) {
      addNotification("Erro ao salvar o plano.", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este plano?')) return;
    try {
      await planService.deletePlan(id);
      addNotification("Plano excluído!", "success");
      fetchPlans();
    } catch (error) {
      addNotification("Erro ao excluir plano.", "error");
    }
  };

  const handleActivate = async (id) => {
    try {
      await planService.activatePlan(id);
      addNotification("Plano ativado com sucesso!", "success");
      fetchPlans();
    } catch (error) {
      addNotification("Erro ao ativar plano.", "error");
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  if (isLoading) {
    return <div style={{display: 'flex', justifyContent: 'center', padding: '50px'}}><Spinner text="Carregando planos..." /></div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Planos e Preços</h1>
          <p style={{ color: 'var(--text-muted)' }}>Gerencie os planos de assinatura disponíveis para a Stripe.</p>
        </div>
        <Button variant="primary" icon={<FiPlus />} onClick={() => handleOpenModal()}>
          Novo Plano
        </Button>
      </div>

      <div className={styles.grid}>
        {plans.length === 0 ? (
          <div className={styles.emptyState}>
            Nenhum plano cadastrado. Clique em "Novo Plano" para criar um.
          </div>
        ) : (
          plans.map(plan => (
            <div key={plan.id} className={`${styles.card} ${plan.is_active ? styles.cardActive : ''}`}>
              {Boolean(plan.is_active) && <span className={styles.activeBadge}>Ativo</span>}
              
              <h3 className={styles.planName}>{plan.name}</h3>
              <div className={styles.planPrice}>
                {formatCurrency(plan.amount)}
                <span className={styles.planInterval}> / {plan.interval_type === 'month' ? 'mês' : 'ano'}</span>
              </div>
              
              <div className={styles.cardActions}>
                {!plan.is_active && (
                  <Button variant="secondary" icon={<FiCheckCircle />} onClick={() => handleActivate(plan.id)} style={{ flex: 1, justifyContent: 'center' }}>
                    Ativar
                  </Button>
                )}
                <Button variant="outline" icon={<FiEdit2 />} onClick={() => handleOpenModal(plan)} aria-label="Editar" />
                <Button variant="danger" icon={<FiTrash2 />} onClick={() => handleDelete(plan.id)} aria-label="Excluir" />
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentPlan ? 'Editar Plano' : 'Novo Plano'}>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Nome do Plano</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
              className={styles.input}
              placeholder="Ex: Assinatura Mensal"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Valor (R$)</label>
            <input 
              type="number" 
              step="0.01" 
              name="amount" 
              value={formData.amount} 
              onChange={handleChange} 
              required 
              className={styles.input}
              placeholder="Ex: 99.90"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Intervalo de Cobrança</label>
            <select 
              name="interval_type" 
              value={formData.interval_type} 
              onChange={handleChange} 
              className={styles.select}
            >
              <option value="month">Mensal</option>
              <option value="year">Anual</option>
            </select>
          </div>

          <div className={styles.checkboxGroup}>
            <input 
              type="checkbox" 
              id="is_active" 
              name="is_active" 
              checked={formData.is_active} 
              onChange={handleChange} 
            />
            <label htmlFor="is_active" className={styles.checkboxLabel}>
              Tornar este o plano ativo atual
            </label>
          </div>

          <div className={styles.formActions}>
            <Button type="button" variant="outline" onClick={handleCloseModal}>Cancelar</Button>
            <Button type="submit" variant="primary">Salvar Plano</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
