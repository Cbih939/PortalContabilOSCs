// src/pages/contador/components/SendAlertModal.js

import React, { useState, useEffect } from 'react';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Spinner from '../../../components/common/Spinner';

// ID do formulário para ligar o botão de submit no rodapé
const FORM_ID = 'send-alert-form';

/**
 * Modal para o Contador enviar um Alerta/Aviso
 * específico para uma única OSC.
 *
 * Props:
 * - isOpen (boolean): Controla a visibilidade do modal.
 * - onClose (function): Função para fechar o modal.
 * - osc (object): A OSC que receberá o alerta (ex: { id, name }).
 * - onSend (function): Função chamada com ({ title, message, oscId }) ao enviar.
 * - isLoading (boolean): (Opcional) Mostra um spinner no botão de enviar.
 */
export default function SendAlertModal({
  isOpen,
  onClose,
  osc,
  onSend,
  isLoading = false,
}) {
  // --- Estado Interno do Formulário ---
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  // Limpa o formulário sempre que o modal for fechado
  // (ou quando 'isOpen' mudar de 'true' para 'false')
  useEffect(() => {
    if (!isOpen) {
      // Pequeno delay para não ver o formulário sumindo
      // durante a animação de 'fade-out' do modal
      setTimeout(() => {
        setTitle('');
        setMessage('');
      }, 300); // 300ms (tempo da animação)
    }
  }, [isOpen]);

  // Handler para submeter o formulário
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validação
    if (!title || !message) {
      alert('Por favor, preencha o título e a mensagem.'); // (No futuro, use o useNotification)
      return;
    }

    if (isLoading) return; // Previne duplo clique

    // Chama a função do pai com os dados
    onSend({
      title,
      message,
      oscId: osc.id,
    });
  };

  // Define os botões do rodapé para o Modal genérico
  const modalFooter = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={isLoading}>
        Cancelar
      </Button>
      <Button
        variant="danger" // Botão vermelho para "Alerta"
        type="submit"
        form={FORM_ID} // Associa ao <form>
        disabled={isLoading}
      >
        {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
        {isLoading ? 'Enviando...' : 'Enviar Alerta'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      // Título dinâmico (usa '?.' para evitar erro se 'osc' for null)
      title={`Enviar Alerta para ${osc?.name || ''}`}
      footer={modalFooter}
      size="lg" // Médio-grande para o formulário
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className="space-y-4">
        {/* Input: Título */}
        <Input
          label="Título do Alerta"
          id="alert-title"
          name="alert-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Pendência Urgente"
          required
        />

        {/* Textarea: Mensagem */}
        <div>
          <label
            htmlFor="alert-message"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Mensagem
          </label>
          <textarea
            id="alert-message"
            name="alert-message"
            rows="5"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Descreva o aviso ou a pendência..."
            required
          ></textarea>
        </div>
      </form>
    </Modal>
  );
}

/**
 * --- Como Usar (na página 'OSCs.js' do Contador) ---
 *
 * import { useState } from 'react';
 * import SendAlertModal from './components/SendAlertModal';
 * import { useApi } from '../../hooks/useApi';
 * import * as alertService from '../../services/alertService';
 * import { useNotification } from '../../contexts/NotificationContext';
 *
 * function OSCsPage() {
 * const [alertOsc, setAlertOsc] = useState(null); // (ex: { id: 3, name: '...'})
 * const addNotification = useNotification();
 *
 * // Hook para a chamada de API
 * const { request: sendAlert, isLoading } = useApi(alertService.sendAlertToOSC);
 *
 * const handleSendAlert = async (formData) => {
 * try {
 * // 'formData' é { title, message, oscId }
 * await sendAlert(formData);
 *
 * // Sucesso!
 * addNotification('Alerta enviado com sucesso!', 'success');
 * setAlertOsc(null); // Fecha o modal
 *
 * } catch (err) {
 * // Erro! O useApi já mostrou a notificação de falha.
 * }
 * };
 *
 * return (
 * <>
 * {/* ... Tabela de OSCs ... */}
 * {/* (Um botão na tabela chamaria 'setAlertOsc(osc)') */}
 *
 * <SendAlertModal
 * isOpen={!!alertOsc}
 * onClose={() => setAlertOsc(null)}
 * osc={alertOsc}
 * onSend={handleSendAlert}
 * isLoading={isLoading}
 * />
 * </>
 * );
 * }
 */