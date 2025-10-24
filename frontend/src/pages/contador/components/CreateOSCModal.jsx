// src/pages/contador/components/CreateOSCModal.jsx

import React, { useState } from 'react';
import Modal from '../../../components/common/Modal.jsx';
import Input from '../../../components/common/Input.jsx';
import Button from '../../../components/common/Button.jsx';
import Spinner from '../../../components/common/Spinner.jsx';
import styles from './CreateOSCModal.module.css'; // Usa o novo CSS

// ID do formulário
const FORM_ID = 'create-osc-form';

// Estado inicial do formulário
const initialFormData = {
    name: '',
    cnpj: '',
    responsible: '',
    email: '', // Email de LOGIN
    password: '',
    email_contato: '', // Email de CONTATO (opcional)
    phone: '',
    address: '',
    // Status será 'Ativo' por padrão no backend
    // assigned_contador_id será definido pelo backend/controller
};

/**
 * Modal para Criar uma nova OSC.
 */
export default function CreateOSCModal({
  isOpen,
  onClose,
  onSave, // Função chamada com (formData) ao salvar
  isLoading = false,
}) {
  const [formData, setFormData] = useState(initialFormData);
  const [formError, setFormError] = useState(null); // Erros específicos do form

  // Limpa o formulário ao fechar
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setFormData(initialFormData);
        setFormError(null);
      }, 300); // Delay para animação
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null); // Limpa erro anterior
    // Validação simples (pode ser melhorada)
    if (!formData.name || !formData.cnpj || !formData.email || !formData.password) {
        setFormError("Nome, CNPJ, Email de Login e Senha são obrigatórios.");
        return;
    }
    if (formData.password.length < 8) {
         setFormError("A senha deve ter no mínimo 8 caracteres.");
         return;
    }

    if (!isLoading) {
      // Passa apenas os dados preenchidos para a função onSave
      onSave(formData);
    }
  };

  // Rodapé do modal
  const modalFooter = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={isLoading}>
        Cancelar
      </Button>
      <Button variant="primary" type="submit" form={FORM_ID} disabled={isLoading}>
        {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
        {isLoading ? 'Criando...' : 'Criar OSC'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cadastrar Nova OSC"
      footer={modalFooter}
      size="2xl" // Tamanho grande
    >
      <form id={FORM_ID} onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <Input
            label="Nome da OSC *" id="name" name="name"
            value={formData.name} onChange={handleChange} required
          />
          <Input
            label="CNPJ *" id="cnpj" name="cnpj"
            value={formData.cnpj} onChange={handleChange} required
            // Adicionar máscara de CNPJ aqui no futuro
          />
          <Input
            label="Responsável" id="responsible" name="responsible"
            value={formData.responsible} onChange={handleChange}
          />
           <Input
            label="Email de Contato" id="email_contato" name="email_contato" type="email"
            placeholder="Email para comunicação (não login)"
            value={formData.email_contato} onChange={handleChange}
          />
          <Input
            label="Telefone" id="phone" name="phone"
            value={formData.phone} onChange={handleChange}
          />
         <div className={styles.span2}>
            <Input
              label="Endereço" id="address" name="address"
              value={formData.address} onChange={handleChange}
            />
          </div>

           {/* Secção para Credenciais de Login */}
           <h3 className={styles.sectionTitle}>Credenciais de Acesso da OSC</h3>
          <Input
            label="Email de Login *" id="email" name="email" type="email"
            placeholder="Email que a OSC usará para entrar"
            value={formData.email} onChange={handleChange} required
          />
           <Input
            label="Senha Provisória *" id="password" name="password" type="password"
            placeholder="Mínimo 8 caracteres"
            value={formData.password} onChange={handleChange} required
            // Poderia adicionar confirmação de senha
          />

        </div>
         {/* Mostra erro do formulário */}
        {formError && <p className="text-red-600 text-sm mt-4">{formError}</p>} {/* TODO: Mover para CSS Module */}
      </form>
    </Modal>
  );
}

// Import useEffect se ainda não o fez
import { useEffect } from 'react';