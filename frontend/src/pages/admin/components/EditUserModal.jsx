import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Modal from '../../../components/common/Modal.jsx';
import Input from '../../../components/common/Input.jsx';
import Button from '../../../components/common/Button.jsx';
import Spinner from '../../../components/common/Spinner.jsx';
import { ROLES } from '../../../utils/constants.js';
import styles from './CreateUserModal.module.css';

// --- SCHEMA ATUALIZADO PARA ACEITAR FINANCEIRO ---
const schema = yup.object().shape({
  name: yup.string().required('O nome é obrigatório.'),
  email: yup.string().email('Email inválido.').required('O email é obrigatório.'),
  role: yup.string()
    // Adicionamos 'FINANCEIRO' explicitamente aqui
    .oneOf([ROLES.ADMIN, ROLES.CONTADOR, ROLES.OSC, 'FINANCEIRO'], 'Perfil inválido.')
    .required('O perfil é obrigatório.'),
  status: yup.string()
    .oneOf(['Ativo', 'Inativo'], 'Status inválido.')
    .required('O status é obrigatório.'),
});

const FORM_ID = 'edit-user-form';

export default function EditUserModal({ isOpen, onClose, onSave, isLoading, userData }) {

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
        name: '',
        email: '',
        role: ROLES.CONTADOR,
        status: 'Ativo'
    }
  });

  useEffect(() => {
    if (userData) {
      reset({
        name: userData.name,
        email: userData.email,
        // Normalizamos para maiúsculas para bater com as opções do select
        role: userData.role?.toUpperCase(),
        status: userData.status,
      });
    }
  }, [userData, reset]);

  useEffect(() => {
    if (!isOpen) {
        setTimeout(() => reset(), 300);
    }
  }, [isOpen, reset]);

  const onSubmit = (data) => {
    if (!isLoading) {
      // Garantimos que a role vai em maiúsculas para o backend
      onSave(userData.id, { ...data, role: data.role.toUpperCase() });
    }
  };

  const modalFooter = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={isLoading}>
        Cancelar
      </Button>
      <Button
        variant="primary"
        type="submit"
        form={FORM_ID}
        disabled={isLoading || !isDirty}
      >
        {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
        {isLoading ? 'Salvando...' : 'Salvar Alterações'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Editar Utilizador: ${userData?.name || ''}`}
      footer={modalFooter}
      size="lg"
    >
      <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} className={styles.form}>

        <Input
          label="Nome Completo *"
          id="edit-name"
          {...register('name')}
          error={errors.name?.message}
        />

        <Input
          label="Email *"
          id="edit-email"
          type="email"
          {...register('email')}
          error={errors.email?.message}
        />

        {/* Select para Perfil (Role) */}
        <div>
          <label htmlFor="edit-role" className={styles.selectLabel}>Perfil *</label>
          <select id="edit-role" {...register('role')} className={styles.selectInput}>
            <option value={ROLES.CONTADOR}>Contador</option>
            <option value={ROLES.ADMIN}>Administrador</option>
            {/* NOVA OPÇÃO FINANCEIRO */}
            <option value="FINANCEIRO">Financeiro</option>
            <option value={ROLES.OSC} disabled>OSC (Gerido em "Gerenciar OSCs")</option>
          </select>
          {errors.role && <p className={styles.errorMessage}>{errors.role.message}</p>}
        </div>

        {/* Select para Status */}
         <div>
          <label htmlFor="edit-status" className={styles.selectLabel}>Status *</label>
          <select id="edit-status" {...register('status')} className={styles.selectInput}>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
          </select>
          {errors.status && <p className={styles.errorMessage}>{errors.status.message}</p>}
        </div>

      </form>
    </Modal>
  );
}