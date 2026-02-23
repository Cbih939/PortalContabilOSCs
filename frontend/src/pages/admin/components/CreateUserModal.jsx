// src/pages/admin/components/CreateUserModal.jsx

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Modal from '../../../components/common/Modal.jsx';
import Input from '../../../components/common/Input.jsx';
import Button from '../../../components/common/Button.jsx';
import Spinner from '../../../components/common/Spinner.jsx';
import { ROLES } from '../../../utils/constants.js'; 
import styles from './CreateUserModal.module.css';
import api from '../../../services/api.js'; // Para buscar escritórios

const schema = yup.object().shape({
  name: yup.string().required('O nome é obrigatório.'),
  email: yup.string().email('Email inválido.').required('O email é obrigatório.'),
  password: yup.string().required('A senha é obrigatória.').min(8, 'A senha deve ter no mínimo 8 caracteres.'),
  role: yup.string()
    .oneOf([ROLES.ADMIN, ROLES.CONTADOR, 'FINANCEIRO'], 'Perfil inválido.') 
    .required('O perfil é obrigatório.'),
  office_id: yup.string().nullable(), // Novo campo para escritório
});

const FORM_ID = 'create-user-form';

export default function CreateUserModal({ isOpen, onClose, onSave, isLoading }) {
  const [offices, setOffices] = useState([]);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
        name: '',
        email: '',
        password: '',
        role: ROLES.CONTADOR,
        office_id: ''
    }
  });

  const selectedRole = watch('role');

  // Busca escritórios cadastrados ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      api.get('/admin/offices')
        .then(res => setOffices(res.data))
        .catch(() => console.error("Erro ao carregar escritórios"));
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => reset(), 300);
    }
  }, [isOpen, reset]);

  const onSubmit = (data) => {
    if (!isLoading) {
      onSave({ 
        ...data, 
        role: data.role.toUpperCase(),
        office_id: data.office_id === "" ? null : data.office_id 
      }); 
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
        disabled={isLoading}
      >
        {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
        {isLoading ? 'Criando...' : 'Criar Utilizador'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Criar Novo Utilizador"
      footer={modalFooter}
      size="lg"
    >
      <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        
        <Input
          label="Nome Completo *"
          id="name"
          {...register('name')}
          error={errors.name?.message}
        />
        
        <Input
          label="Email *"
          id="email"
          type="email"
          {...register('email')}
          error={errors.email?.message}
        />
        
        <Input
          label="Senha Provisória (Mín. 8 caracteres) *"
          id="password"
          type="password"
          {...register('password')}
          error={errors.password?.message}
        />
        
        <div className={styles.formField}>
          <label htmlFor="role" className={styles.selectLabel}>Perfil *</label>
          <select id="role" {...register('role')} className={styles.selectInput}>
            <option value={ROLES.CONTADOR}>Contador</option>
            <option value={ROLES.ADMIN}>Administrador</option>
            <option value="FINANCEIRO">Financeiro</option>
          </select>
          {errors.role && <p className={styles.errorMessage}>{errors.role.message}</p>}
        </div>

        {/* Campo de Escritório - Aparece apenas se for Contador ou Financeiro */}
        {(selectedRole === ROLES.CONTADOR || selectedRole === 'FINANCEIRO') && (
          <div className={styles.formField}>
            <label htmlFor="office_id" className={styles.selectLabel}>Escritório / Grupo</label>
            <select id="office_id" {...register('office_id')} className={styles.selectInput}>
              <option value="">Nenhum (Utilizador Independente)</option>
              {offices.map(off => (
                <option key={off.id} value={off.id}>{off.name}</option>
              ))}
            </select>
          </div>
        )}
        
      </form>
    </Modal>
  );
}