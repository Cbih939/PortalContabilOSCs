// src/pages/admin/components/EditUserModal.jsx

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Modal from '../../../components/common/Modal.jsx';
import Input from '../../../components/common/Input.jsx';
import Button from '../../../components/common/Button.jsx';
import Spinner from '../../../components/common/Spinner.jsx';
import { ROLES } from '../../../utils/constants.js';
// Reutiliza os estilos do modal de criação
import styles from './CreateUserModal.module.css';

// Schema de Validação (Yup) - Sem senha obrigatória
const schema = yup.object().shape({
  name: yup.string().required('O nome é obrigatório.'),
  email: yup.string().email('Email inválido.').required('O email é obrigatório.'),
  role: yup.string()
    .oneOf([ROLES.ADMIN, ROLES.CONTADOR, ROLES.OSC], 'Perfil inválido.')
    .required('O perfil é obrigatório.'),
  status: yup.string()
    .oneOf(['Ativo', 'Inativo'], 'Status inválido.')
    .required('O status é obrigatório.'),
});

const FORM_ID = 'edit-user-form';

export default function EditUserModal({ isOpen, onClose, onSave, isLoading, userData }) {

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { // Define valores padrão
        name: '',
        email: '',
        role: ROLES.CONTADOR,
        status: 'Ativo'
    }
  });

  // Efeito para popular o formulário quando 'userData' (o utilizador a editar) muda
  useEffect(() => {
    if (userData) {
      // Preenche o formulário com os dados do utilizador
      reset({
        name: userData.name,
        email: userData.email,
        role: userData.role,
        status: userData.status,
      });
    }
  }, [userData, reset]); // Roda quando userData muda

  // Limpa o formulário ao fechar (embora o useEffect acima vá repopular na próxima abertura)
  useEffect(() => {
    if (!isOpen) {
        setTimeout(() => reset(), 300);
    }
  }, [isOpen, reset]);

  // Função chamada pelo RHF ao submeter com sucesso
  const onSubmit = (data) => {
    if (!isLoading) {
      // Passa os dados do formulário E o ID do utilizador original para a função onSave
      onSave(userData.id, data);
    }
  };

  // Rodapé do modal
  const modalFooter = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={isLoading}>
        Cancelar
      </Button>
      <Button
        variant="primary"
        type="submit"
        form={FORM_ID}
        disabled={isLoading || !isDirty} // Desabilita se estiver a carregar OU se nada mudou
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
          id="edit-name" // ID único
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

        {/* Nota: Não editamos a senha aqui. Isso deve ser uma ação separada (ex: "Resetar Senha") */}

        {/* Select para Perfil (Role) */}
        <div>
          <label htmlFor="edit-role" className={styles.selectLabel}>Perfil *</label>
          <select id="edit-role" {...register('role')} className={styles.selectInput}>
            <option value={ROLES.CONTADOR}>Contador</option>
            <option value={ROLES.ADMIN}>Administrador</option>
            {/* Desabilitamos a edição de/para OSC por aqui, pois OSCs são criadas/geridas noutro local */}
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