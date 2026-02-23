import React from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../../../components/common/Modal.jsx';
import Input from '../../../components/common/Input.jsx';
import Button from '../../../components/common/Button.jsx';

export default function CreateOfficeModal({ isOpen, onClose, onSave, isLoading }) {
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = (data) => {
    onSave(data);
    reset();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Escritório / Grupo">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input 
          label="Nome do Escritório (Ex: Flora Contabilidade)" 
          {...register('name', { required: true })} 
        />
        <div style={{ marginTop: '1rem', display: 'flex', gap: '10px' }}>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Cadastrar Escritório'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
        </div>
      </form>
    </Modal>
  );
}