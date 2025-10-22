// src/pages/contador/components/EditOSCModal.js

import React, { useState, useEffect } from 'react';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Spinner from '../../../components/common/Spinner';

// O ID do formulário, usado para ligar o botão de submit no rodapé
// ao formulário no corpo do modal.
const FORM_ID = 'edit-osc-form';

/**
 * Modal para Editar os detalhes de uma OSC.
 *
 * Props:
 * - isOpen (boolean): Controla a visibilidade do modal.
 * - onClose (function): Função para fechar o modal.
 * - oscData (object): O objeto da OSC a ser editado (preenche o formulário).
 * - onSave (function): Função chamada com o (formData) ao salvar.
 * - isLoading (boolean): (Opcional) Mostra um spinner no botão de salvar.
 */
export default function EditOSCModal({
  isOpen,
  onClose,
  oscData,
  onSave,
  isLoading = false,
}) {
  // Estado interno do formulário
  const [formData, setFormData] = useState(oscData);

  // Efeito para resetar o estado do formulário
  // sempre que o 'oscData' (a OSC selecionada) mudar.
  useEffect(() => {
    if (oscData) {
      setFormData(oscData);
    } else {
      // Limpa o formulário se não houver OSC (ex: ao fechar)
      setFormData(null);
    }
  }, [oscData]); // Depende do 'oscData'

  // Handler genérico para atualizar o estado do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler para submeter o formulário
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isLoading) {
      onSave(formData);
    }
  };

  // Define os botões do rodapé para o Modal genérico
  const modalFooter = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={isLoading}>
        Cancelar
      </Button>
      <Button
        variant="primary"
        type="submit" // Define como submit
        form={FORM_ID} // Associa ao <form> pelo ID
        disabled={isLoading}
      >
        {isLoading ? (
          <Spinner size="sm" className="mr-2" />
        ) : null}
        {isLoading ? 'Salvando...' : 'Salvar Alterações'}
      </Button>
    </>
  );

  // Se o modal estiver aberto mas os dados ainda não chegaram
  // (ou se 'oscData' for null), não renderiza nada.
  if (!formData) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Editar OSC: ${oscData.name}`} // Título dinâmico
      footer={modalFooter}
      size="2xl" // Um modal maior para caber o formulário
    >
      {/* Usamos um <form> com ID. O 'onSubmit' é chamado
        pelo botão no 'footer' (que tem 'type="submit"'
        e 'form="edit-osc-form"').
      */}
      <form id={FORM_ID} onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Nome da OSC"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Input
            label="CNPJ"
            id="cnpj"
            name="cnpj"
            value={formData.cnpj}
            onChange={handleChange}
            required
          />
          <Input
            label="Responsável"
            id="responsible"
            name="responsible"
            value={formData.responsible}
            onChange={handleChange}
          />
          <Input
            label="Email"
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
          <Input
            label="Telefone"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />

          {/* O componente <Input> não cobre <select>,
              então usamos um <select> nativo estilizado
              com as classes do Tailwind. */}
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Ativo</option>
              <option>Inativo</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <Input
              label="Endereço"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}

/**
 * --- Como Usar (na página 'OSCs.js' do Contador) ---
 *
 * import { useState } from 'react';
 * import EditOSCModal from './components/EditOSCModal';
 * import { useApi } from '../../hooks/useApi';
 * import * as oscService from '../../services/oscService';
 *
 * function OSCsPage() {
 * const [oscToEdit, setOscToEdit] = useState(null); // (ex: { id: 3, ... })
 *
 * // Hook para a chamada de API
 * const { request: updateOSC, isLoading } = useApi(oscService.updateOSC);
 *
 * const handleSave = async (formData) => {
 * try {
 * await updateOSC(formData.id, formData);
 * // Sucesso! Fecha o modal e recarrega os dados.
 * setOscToEdit(null);
 * // (lógica para recarregar a lista de OSCs)
 * // addNotification('OSC salva com sucesso!', 'success');
 * } catch (err) {
 * // Erro! O useApi já mostrou a notificação.
 * // Não fechamos o modal, para o usuário tentar de novo.
 * }
 * };
 *
 * return (
 * <>
 * {/* ... Tabela de OSCs ... */}
 * {/* (Um botão na tabela chamaria 'setOscToEdit(osc)') */}
 *
 * <EditOSCModal
 * isOpen={!!oscToEdit} // !! transforma o objeto em booleano (true/false)
 * onClose={() => setOscToEdit(null)}
 * oscData={oscToEdit}
 * onSave={handleSave}
 * isLoading={isLoading}
 * />
 * </>
 * );
 * }
 */