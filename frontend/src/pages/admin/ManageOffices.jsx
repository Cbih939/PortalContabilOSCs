import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import * as officeService from '../../services/officeService.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/ui/Button.jsx';
import Card, { CardBody } from '../../components/ui/Card.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { FiPlus, FiBriefcase, FiEdit2, FiTrash2 } from 'react-icons/fi';
import styles from './ManageOffices.module.css';

const schema = yup.object().shape({
  name: yup.string().required('O nome do escritório é obrigatório.'),
  email: yup.string().email('E-mail inválido.').nullable(),
  document: yup.string().nullable(),
  phone: yup.string().nullable(),
});

export default function ManageOffices() {
  const [offices, setOffices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [officeToEdit, setOfficeToEdit] = useState(null);

  const addNotification = useNotification();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const fetchOffices = async () => {
    setIsLoading(true);
    try {
      const data = await officeService.getOffices();
      setOffices(Array.isArray(data) ? data : (data?.data || []));
    } catch (error) {
      console.error("Erro ao buscar escritórios:", error);
      addNotification("Erro ao carregar a lista de escritórios.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOffices();
  }, []);

  const handleOpenCreate = () => {
    setOfficeToEdit(null);
    reset(); 
    setIsModalOpen(true);
  };

  const handleOpenEdit = (office) => {
    setOfficeToEdit(office);
    setValue('name', office.name);
    setValue('document', office.document || '');
    setValue('email', office.email || '');
    setValue('phone', office.phone || '');
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (officeToEdit) {
        await officeService.updateOffice(officeToEdit.id, data);
        addNotification(`Escritório "${data.name}" atualizado com sucesso!`, 'success');
      } else {
        await officeService.createOffice(data);
        addNotification(`Escritório "${data.name}" criado com sucesso!`, 'success');
      }
      setIsModalOpen(false);
      fetchOffices(); 
    } catch (error) {
      addNotification(error.response?.data?.message || 'Erro ao processar a solicitação.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (office) => {
    if (!window.confirm(`Tem a certeza que deseja excluir o escritório "${office.name}"?\nEsta ação não pode ser desfeita.`)) return;
    
    try {
      await officeService.deleteOffice(office.id);
      addNotification(`Escritório excluído com sucesso!`, 'success');
      fetchOffices();
    } catch (error) {
      addNotification(error.response?.data?.message || 'Erro ao excluir o escritório.', 'error');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Gestão de Escritórios (SaaS)</h1>
          <p className={styles.pageSubtitle}>Administre os escritórios contábeis cadastrados no sistema.</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="primary" onClick={handleOpenCreate} icon={<FiPlus />}>
            Novo Escritório
          </Button>
        </div>
      </div>

      <Card padding="none">
        <CardBody className={styles.tableBody}>
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <Spinner text="Carregando escritórios..." />
            </div>
          ) : offices.length === 0 ? (
            <div className={styles.emptyState}>
              <FiBriefcase size={32} color="var(--text-muted)" />
              <p>Nenhum escritório cadastrado. Clique no botão acima para criar o primeiro!</p>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome do Escritório</th>
                    <th>Documento (CNPJ)</th>
                    <th>Contatos</th>
                    <th style={{ textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {offices.map((office) => (
                    <tr key={office.id}>
                      <td className={styles.idCol}>#{office.id}</td>
                      <td className={styles.nameCol}>{office.name}</td>
                      <td>{office.document || '-'}</td>
                      <td>
                        <div className={styles.contactMain}>{office.email || '-'}</div>
                        <div className={styles.contactSub}>{office.phone}</div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className={styles.actionsContainer}>
                          <button onClick={() => handleOpenEdit(office)} className={styles.actionBtn} title="Editar Escritório">
                            <FiEdit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(office)} className={`${styles.actionBtn} ${styles.actionBtnDanger}`} title="Excluir Escritório">
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

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={officeToEdit ? "Editar Escritório" : "Cadastrar Novo Escritório"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Nome do Escritório *</label>
            <input 
              {...register('name')} 
              placeholder="Ex: Flora Contabilidade" 
              className={styles.formInput}
            />
            {errors.name && <span className={styles.errorMessage}>{errors.name.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Documento (CNPJ)</label>
            <input 
              {...register('document')} 
              placeholder="Ex: 00.000.000/0000-00" 
              className={styles.formInput}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>E-mail</label>
              <input 
                {...register('email')} 
                type="email"
                placeholder="contato@escritorio.com" 
                className={styles.formInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Telefone</label>
              <input 
                {...register('phone')} 
                placeholder="(00) 00000-0000" 
                className={styles.formInput}
              />
            </div>
          </div>

          <div className={styles.modalActions}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">Cancelar</Button>
            <Button type="submit" variant="primary" loading={isSubmitting}>
              {isSubmitting ? 'Salvando...' : (officeToEdit ? 'Atualizar Escritório' : 'Criar Escritório')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}