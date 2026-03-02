
// src/pages/admin/components/PaymentMessageModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../../../components/common/Modal.jsx';
import Button from '../../../components/common/Button.jsx';
import api from '../../../services/api.js';

export default function PaymentMessageModal({ isOpen, onClose, userStatus, userEmail }) {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Mapeia o status do usuário para a categoria da mensagem
      const categoryMap = {
        'Ativo': 'REGULAR',
        'Pendente': 'AGUARDANDO',
        'Inativo': 'INADIMPLENTE'
      };
      api.get(`/messages/${categoryMap[userStatus] || 'REGULAR'}`)
         .then(res => setMessages(res.data));
    }
  }, [isOpen, userStatus]);

  const handleSendMessage = async () => {
    try {
      await api.post('/messages/send', {
        email: userEmail,
        message: selectedMessage
      });
      alert('Mensagem enviada com sucesso!');
      onClose();
    } catch (error) {
      alert('Erro ao enviar mensagem.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Enviar Mensagem de Cobrança/Status">
      <div>
        <label>Escolha o tom da mensagem:</label>
        {messages.map((m, index) => (
          <div key={m.id} style={{ marginBottom: '10px', border: '1px solid #ddd', padding: '10px' }}>
            <input 
              type="radio" 
              name="msg" 
              onChange={() => setSelectedMessage(m.content)} 
            />
            <strong> {m.title}</strong>
            <p style={{ fontSize: '0.8rem' }}>{m.content}</p>
          </div>
        ))}
      </div>
      <Button onClick={handleSendMessage} variant="primary">Enviar para {userEmail}</Button>
    </Modal>
  );
}