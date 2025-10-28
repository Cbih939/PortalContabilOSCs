// src/pages/admin/components/CreateUserModal.jsx

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Modal from '../../../components/common/Modal.jsx';
import Input from '../../../components/common/Input.jsx';
import Button from '../../../components/common/Button.jsx';
import Spinner from '../../../components/common/Spinner.jsx';
import { ROLES } from '../../../utils/constants.js'; // Importa ROLES
import styles from './CreateUserModal.module.css'; // Importa CSS Module

// Schema de Validação (Yup)
const schema = yup.object().shape({
  name: yup.string().required('O nome é obrigatório.'),
  email: yup.string().email('Email inválido.').required('O email é obrigatório.'),
  password: yup.string().required('A senha é obrigatória.').min(8, 'A senha deve ter no mínimo 8 caracteres.'),
  role: yup.string()
    .oneOf([ROLES.ADMIN, ROLES.CONTADOR], 'Perfil inválido.') // Só permite criar Admin ou Contador
    .required('O perfil é obrigatório.'),
});

const FORM_ID = 'create-user-form';

export default function CreateUserModal({ isOpen, onClose, onSave, isLoading }) {
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
        name: '',
        email: '',
        password: '',
        role: ROLES.CONTADOR // Define 'Contador' como padrão
    }
  });

  // Limpa o formulário quando o modal é fechado
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => reset(), 300); // Reseta para os valores padrão após animação
    }
  }, [isOpen, reset]);

  // Função chamada pelo RHF ao submeter com sucesso
  const onSubmit = (data) => {
    if (!isLoading) {
      onSave(data); // Chama a função onSave (passada pela página pai) com os dados
    }
  };

  // Define o rodapé do modal
  const modalFooter = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={isLoading}>
        Cancelar
      </Button>
      <Button
        variant="primary"
        type="submit"
        form={FORM_ID} // Liga ao <form>
        disabled={isLoading}
      >
        {isLoading ? <Spinner size="sm" className="mr-2" /> : null} {/* mr-2 pode precisar CSS global */}
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
      size="lg" // Tamanho médio
    >
      <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        
        <Input
          label="Nome Completo *"
          id="name"
          {...register('name')} // Regista no RHF
          error={errors.name?.message} // Mostra erro do RHF
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
        
        {/* Select para Perfil (Role) */}
        <div>
          <label htmlFor="role" className={styles.selectLabel}>Perfil *</label>
          <select id="role" {...register('role')} className={styles.selectInput}>
            <option value={ROLES.CONTADOR}>Contador</option>
            <option value={ROLES.ADMIN}>Administrador</option>
          </select>
          {errors.role && <p className={styles.errorMessage}>{errors.role.message}</p>}
        </div>
        
      </form>
    </Modal>
  );
}