// src/pages/contador/components/SendAlertModal.jsx

import React, { useState, useEffect } from 'react';
import Modal from '../../../components/common/Modal.jsx';
import Input from '../../../components/common/Input.jsx';
import Button from '../../../components/common/Button.jsx';
import Spinner from '../../../components/common/Spinner.jsx';
import styles from './SendAlertModal.module.css'; // Importa CSS Module

// ID do formulário
const FORM_ID = 'send-alert-form';

/**
 * Modal para Enviar Alerta para uma OSC (CSS Modules).
 */
export default function SendAlertModal({
  isOpen,
  onClose,
  osc, // OSC que receberá o alerta
  onSend, // Função chamada ao enviar
  isLoading = false,
}) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  // Limpa o formulário ao fechar
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setTitle('');
        setMessage('');
      }, 300); // Delay para animação
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !message) {
      alert('Por favor, preencha o título e a mensagem.'); // Use useNotification no futuro
      return;
    }
    if (isLoading) return;
    onSend({ title, message, oscId: osc?.id }); // Inclui oscId
  };

  const modalFooter = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={isLoading}>
        Cancelar
      </Button>
      <Button
        variant="danger" // Botão vermelho
        type="submit"
        form={FORM_ID}
        disabled={isLoading}
      >
        {isLoading ? <Spinner size="sm" className="mr-2" /> : null} {/* mr-2 pode precisar de CSS global */}
        {isLoading ? 'Enviando...' : 'Enviar Alerta'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Enviar Alerta para ${osc?.name || ''}`}
      footer={modalFooter}
      size="lg" // Tamanho médio-grande
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className={styles.formContainer}>
        <Input
          label="Título do Alerta"
          id="alert-title"
          name="alert-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Pendência Urgente"
          required
          // Aplica classe do CSS Module se necessário para espaçamento
          // className={styles.formInput}
        />

        {/* Textarea (estilo básico) */}
        <div>
          <label htmlFor="alert-message" className={styles.textAreaLabel}>
            Mensagem
          </label>
          <textarea
            id="alert-message"
            name="alert-message"
            rows="5"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={styles.textAreaInput} // Classe do CSS Module
            placeholder="Descreva o aviso ou a pendência..."
            required
          ></textarea>
        </div>
      </form>
    </Modal>
  );
}