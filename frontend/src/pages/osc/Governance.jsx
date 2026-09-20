import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { IMaskInput } from 'react-imask';
import api from '../../services/api.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/ui/Button.jsx';
import Card, { CardBody } from '../../components/ui/Card.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { FiShield, FiPlus, FiEdit2, FiTrash2, FiUser } from 'react-icons/fi';
import styles from './Governance.module.css';

// Validação do Formulário
const schema = yup.object().shape({
  name: yup.string().required('O nome é obrigatório.'),
  role: yup.string().required('O cargo é obrigatório.'),
  cpf: yup.string().nullable(),
  start_date: yup.string().nullable(),
  end_date: yup.string().nullable(),
  status: yup.string().required('O status é obrigatório.')
});

export default function GovernancePage() {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState(null);

  const addNotification = useNotification();
  const { register, handleSubmit, control, reset, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { status: 'ATIVO', role: 'Presidente' }
  });

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/board');
      setMembers(response.data || []);
    } catch (error) {
      addNotification("Erro ao carregar diretoria.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleOpenCreate = () => {
    setMemberToEdit(null);
    reset({ name: '', role: 'Presidente', cpf: '', start_date: '', end_date: '', status: 'ATIVO' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member) => {
    setMemberToEdit(member);
    setValue('name', member.name);
    setValue('role', member.role);
    setValue('cpf', member.cpf || '');
    setValue('start_date', member.start_date ? member.start_date.split('T')[0] : '');
    setValue('end_date', member.end_date ? member.end_date.split('T')[0] : '');
    setValue('status', member.status);
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        start_date: data.start_date || null,
        end_date: data.end_date || null
      };

      if (memberToEdit) {
        await api.put(`/board/${memberToEdit.id}`, payload);
        addNotification(`Membro atualizado com sucesso!`, 'success');
      } else {
        await api.post('/board', payload);
        addNotification(`Membro adicionado à diretoria!`, 'success');
      }
      setIsModalOpen(false);
      fetchMembers();
    } catch (error) {
      addNotification("Erro ao salvar os dados.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (member) => {
    if (!window.confirm(`Tem certeza que deseja remover ${member.name} da diretoria?`)) return;
    try {
      await api.delete(`/board/${member.id}`);
      addNotification(`Membro removido com sucesso!`, 'success');
      fetchMembers();
    } catch (error) {
      addNotification("Erro ao remover membro.", "error");
    }
  };

  return (
    <div className={styles.pageContainer}>
      
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>
            <div className={styles.iconWrapper}><FiShield size={20} /></div>
            Governança e Diretoria
          </h1>
          <p className={styles.pageSubtitle}>
            Mantenha o quadro da diretoria atualizado para garantir a regularidade bancária e jurídica da organização.
          </p>
        </div>
        <Button onClick={handleOpenCreate} variant="primary" icon={<FiPlus />}>
          Adicionar Membro
        </Button>
      </div>

      <Card padding="none">
        <CardBody>
          {isLoading ? (
            <div className={styles.loadingContainer}><Spinner text="A carregar diretoria..." /></div>
          ) : members.length === 0 ? (
            <div className={styles.emptyState}>
              <FiUser className={styles.emptyIcon} />
              <h3 className={styles.emptyTitle}>Nenhum membro cadastrado</h3>
              <p className={styles.emptySubtitle}>Adicione os membros da diretoria atual (Presidente, Tesoureiro, etc).</p>
              <Button onClick={handleOpenCreate} variant="primary">Adicionar Primeiro Membro</Button>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Nome Completo</th>
                    <th>Cargo</th>
                    <th>Mandato</th>
                    <th>Status</th>
                    <th style={{textAlign: 'right'}}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id}>
                      <td>
                        <div className={styles.memberName}>{member.name}</div>
                        <div className={styles.memberCpf}>CPF: {member.cpf || 'Não informado'}</div>
                      </td>
                      <td>
                        <span className={styles.roleTag}>{member.role}</span>
                      </td>
                      <td>
                        <div className={styles.dateInfo}>
                          Início: {member.start_date ? new Date(member.start_date).toLocaleDateString('pt-BR') : '-'}
                        </div>
                        <div className={styles.dateInfo}>
                          Fim: <strong>{member.end_date ? new Date(member.end_date).toLocaleDateString('pt-BR') : '-'}</strong>
                        </div>
                      </td>
                      <td>
                        {member.status === 'ATIVO' ? (
                          <span className={styles.statusActive}>ATIVO</span>
                        ) : (
                          <span className={styles.statusInactive}>INATIVO</span>
                        )}
                      </td>
                      <td style={{textAlign: 'right'}}>
                        <button onClick={() => handleOpenEdit(member)} className={`${styles.actionButton} ${styles.btnEdit}`} title="Editar">
                          <FiEdit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(member)} className={`${styles.actionButton} ${styles.btnDelete}`} title="Remover">
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Modal de Criar/Editar Membro */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={memberToEdit ? "Editar Membro" : "Adicionar Membro da Diretoria"}>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.formGrid}>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Nome Completo *</label>
            <input {...register('name')} placeholder="Ex: João da Silva" className={styles.formInput} />
            {errors.name && <span className={styles.errorText}>{errors.name.message}</span>}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Cargo na Diretoria *</label>
              <select {...register('role')} className={styles.formInput}>
                <option value="Presidente">Presidente</option>
                <option value="Vice-Presidente">Vice-Presidente</option>
                <option value="Tesoureiro">Tesoureiro(a)</option>
                <option value="Secretário">Secretário(a)</option>
                <option value="Conselheiro Fiscal">Conselheiro(a) Fiscal</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>CPF</label>
              <Controller name="cpf" control={control} render={({ field }) => (
                <IMaskInput {...field} mask="000.000.000-00" className={styles.formInput} placeholder="000.000.000-00" />
              )} />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Início do Mandato</label>
              <input type="date" {...register('start_date')} className={styles.formInput} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Fim do Mandato (Previsão)</label>
              <input type="date" {...register('end_date')} className={styles.formInput} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Status Atual</label>
            <select {...register('status')} className={styles.formInput}>
              <option value="ATIVO">Ativo (No Cargo Atualmente)</option>
              <option value="INATIVO">Inativo (Ex-membro / Mandato Expirado)</option>
            </select>
          </div>

          <div className={styles.modalFooter}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">Cancelar</Button>
            <Button variant="primary" type="submit" loading={isSubmitting}>
              {memberToEdit ? 'Atualizar Membro' : 'Adicionar Membro'}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}