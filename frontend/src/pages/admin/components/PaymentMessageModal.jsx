// src/pages/admin/components/PaymentMessageModal.jsx

import React, { useState, useEffect } from 'react';
import Modal from '../../../components/common/Modal.jsx';
import Button from '../../../components/common/Button.jsx';
import Spinner from '../../../components/common/Spinner.jsx';
import api from '../../../services/api.js';
import styles from './PaymentMessageModal.module.css'; // Crie este CSS para estilizar os cards
import { useNotification } from '../../../contexts/NotificationContext.jsx';

export default function PaymentMessageModal({ isOpen, onClose, userData }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const addNotification = useNotification();

  // Mapeamento interno para garantir que o status do usuário bata com o ENUM do SQL
  const getCategoryFromStatus = (status) => {
    const s = status?.toLowerCase();
    if (s === 'ativo') return 'REGULAR';
    if (s === 'pendente' || s === 'aguardando') return 'AGUARDANDO';
    return 'INADIMPLENTE';
  };

  useEffect(() => {
    if (isOpen && userData) {
      const category = getCategoryFromStatus(userData.status);
      loadMessages(category);
    } else {
      setMessages([]);
      setSelectedMessage(null);
    }
  }, [isOpen, userData]);

  const loadMessages = async (category) => {
    setIsLoading(true);
    try {
      // Ajuste a rota conforme seu backend (ex: GET /api/admin/messages/:category)
      const response = await api.get(`/admin/messages/${category}`);
      setMessages(response.data || []);
    } catch (err) {
      addNotification("Erro ao carregar modelos de mensagem.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!selectedMessage) {
      addNotification("Por favor, selecione um tom de mensagem.", "info");
      return;
    }

    try {
      await api.post('/admin/messages/send', {
        userId: userData.id,
        email: userData.email,
        messageContent: selectedMessage.content,
        subject: selectedMessage.title
      });
      addNotification("Mensagem enviada com sucesso!", "success");
      onClose();
    } catch (err) {
      addNotification("Falha ao enviar e-mail.", "error");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Enviar Mensagem de Cobrança/Status">
      <div className={styles.container}>
        <p className={styles.subtitle}>
          Enviando para: <strong>{userData?.name}</strong> ({userData?.email})
        </p>
        
        <label className={styles.label}>Escolha o tom da mensagem:</label>

        {isLoading ? (
          <Spinner text="Buscando modelos..." />
        ) : (
          <div className={styles.messageList}>
            {messages.length > 0 ? (
              messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`${styles.messageCard} ${selectedMessage?.id === msg.id ? styles.selected : ''}`}
                  onClick={() => setSelectedMessage(msg)}
                >
                  <div className={styles.cardHeader}>
                    <input 
                      type="radio" 
                      checked={selectedMessage?.id === msg.id} 
                      readOnly 
                    />
                    <strong>{msg.title}</strong>
                  </div>
                  <p className={styles.messagePreview}>{msg.content}</p>
                </div>
              ))
            ) : (
              <p className={styles.empty}>Nenhum modelo encontrado para este status.</p>
            )}
          </div>
        )}

        <div className={styles.actions}>
          <Button 
            variant="primary" 
            onClick={handleSend} 
            disabled={!selectedMessage || isLoading}
            fullWidth
          >
            Enviar para {userData?.email}
          </Button>
        </div>
      </div>
    </Modal>
  );
}