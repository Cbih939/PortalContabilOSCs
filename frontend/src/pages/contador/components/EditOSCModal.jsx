// src/pages/contador/components/EditOSCModal.jsx

import React, { useState, useEffect } from 'react';
import Modal from '../../../components/common/Modal.jsx'; // Importa Modal genérico
import Input from '../../../components/common/Input.jsx';   // Importa Input refatorado
import Button from '../../../components/common/Button.jsx'; // Importa Button refatorado
import Spinner from '../../../components/common/Spinner.jsx'; // Importa Spinner refatorado
import styles from './EditOSCModal.module.css'; // Importa CSS Module específico

// ID do formulário
const FORM_ID = 'edit-osc-form';

/**
 * Modal para Editar os detalhes de uma OSC (CSS Modules).
 */
export default function EditOSCModal({
  isOpen,
  onClose,
  oscData, // Dados da OSC a editar
  onSave, // Função chamada ao salvar
  isLoading = false, // Estado de carregamento do salvamento
}) {
  const [formData, setFormData] = useState(oscData);

  // Atualiza o formData se a oscData mudar
  useEffect(() => {
    setFormData(oscData || null); // Usa null se oscData for null/undefined
  }, [oscData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isLoading) {
      onSave(formData); // Chama a função onSave passada pelo pai
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
        form={FORM_ID} // Liga ao formulário
        disabled={isLoading}
      >
        {isLoading ? <Spinner size="sm" className="mr-2" /> : null} {/* mr-2 pode precisar de CSS global */}
        {isLoading ? 'Salvando...' : 'Salvar Alterações'}
      </Button>
    </>
  );

  // Não renderiza se não houver dados
  if (!formData) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Editar OSC: ${oscData?.name || ''}`} // Título dinâmico
      footer={modalFooter}
      size="2xl" // Tamanho grande
    >
      {/* Formulário */}
      <form id={FORM_ID} onSubmit={handleSubmit}>
        <div className={styles.formGrid}> {/* Usa grid do CSS Module */}
          <Input
            label="Nome da OSC" id="name" name="name"
            value={formData.name} onChange={handleChange} required
          />
          <Input
            label="CNPJ" id="cnpj" name="cnpj"
            value={formData.cnpj} onChange={handleChange} required
          />
          <Input
            label="Responsável" id="responsible" name="responsible"
            value={formData.responsible} onChange={handleChange}
          />
          <Input
            label="Email" id="email" name="email" type="email"
            value={formData.email} onChange={handleChange}
          />
          <Input
            label="Telefone" id="phone" name="phone"
            value={formData.phone} onChange={handleChange}
          />
{/* Select para Status (estilo básico) */}
<div>
  <label htmlFor="status" className={styles.selectLabel}>
    Status
  </label>
  {/* Comentário movido para cima */}
  {/* Classe do CSS Module aplicada abaixo */}
  <select
    id="status" name="status"
    value={formData.status} onChange={handleChange}
    className={styles.selectInput} // Sem comentário na linha
  >
    <option>Ativo</option>
    <option>Inativo</option>
  </select>
</div>
          <div className={styles.span2}> {/* Ocupa 2 colunas */}
            <Input
              label="Endereço" id="address" name="address"
              value={formData.address} onChange={handleChange}
            />
          </div>
        </div>
        {/* O botão de submit está no footer do Modal */}
      </form>
    </Modal>
  );
}