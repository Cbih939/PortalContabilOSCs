// src/pages/admin/components/EditUserModal.jsx

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Modal from '../../../components/common/Modal.jsx';
import Input from '../../../components/common/Input.jsx';
import Button from '../../../components/common/Button.jsx';
import api from '../../../services/api.js';
import styles from './CreateUserModal.module.css';

const schema = yup.object().shape({
  name: yup.string().required('Obrigatório'),
  email: yup.string().email('Invalido').required('Obrigatório'),
  role: yup.string().required('Obrigatório'),
  status: yup.string().required('Obrigatório'),
  office_id: yup.string().nullable(),
});

export default function EditUserModal({ isOpen, onClose, onSave, isLoading, userData }) {
  const [offices, setOffices] = useState([]);
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const selectedRole = watch('role');

  useEffect(() => {
    if (isOpen) {
      api.get('/admin/offices').then(res => setOffices(res.data));
    }
  }, [isOpen]);

  useEffect(() => {
    if (userData) {
      reset({
        name: userData.name,
        email: userData.email,
        role: userData.role,
        status: userData.status,
        office_id: userData.office_id || ""
      });
    }
  }, [userData, reset]);

  const onSubmit = (data) => onSave(userData.id, data);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Utilizador">
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <Input label="Nome" {...register('name')} error={errors.name?.message} />
        <Input label="Email" {...register('email')} error={errors.email?.message} />
        
        <label className={styles.selectLabel}>Perfil</label>
        <select {...register('role')} className={styles.selectInput}>
          <option value="ADMIN">Administrador</option>
          <option value="CONTADOR">Contador</option>
          <option value="FINANCEIRO">Financeiro</option>
          <option value="OSC">OSC</option>
        </select>

        {(selectedRole === 'CONTADOR' || selectedRole === 'OSC' || selectedRole === 'FINANCEIRO') && (
          <div className={styles.formField}>
            <label className={styles.selectLabel}>Escritório / Grupo</label>
            <select {...register('office_id')} className={styles.selectInput}>
              <option value="">Nenhum</option>
              {offices.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
        )}

        <label className={styles.selectLabel}>Status</label>
        <select {...register('status')} className={styles.selectInput}>
          <option value="Ativo">Ativo</option>
          <option value="Inativo">Inativo</option>
        </select>

        <div className={styles.modalActions}>
          <Button type="submit" variant="primary" disabled={isLoading}>Salvar</Button>
        </div>
      </form>
    </Modal>
  );
}