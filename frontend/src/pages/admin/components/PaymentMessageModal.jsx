import React, { useState, useEffect } from 'react';
import Modal from '../../../components/common/Modal.jsx';
import Button from '../../../components/common/Button.jsx';
import Spinner from '../../../components/common/Spinner.jsx';
import api from '../../../services/api.js';
import styles from './PaymentMessageModal.module.css';
import { useNotification } from '../../../contexts/NotificationContext.jsx';

export default function PaymentMessageModal({ isOpen, onClose, userData }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const addNotification = useNotification();

  const getCategoryFromStatus = (status) => {
    if (!status) return 'Ativo';
    // Converte 'ativo' para 'Ativo' para bater com o SQL
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  useEffect(() => {
    const loadMessages = async () => {
      if (!userData?.status) return;
      setIsLoading(true);
      const category = getCategoryFromStatus(userData.status);
      try {
        const response = await api.get(`/admin/messages/${category}`);
        setMessages(response.data || []);
      } catch (err) {
        addNotification("Erro ao carregar modelos.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && userData) loadMessages();
    else { setMessages([]); setSelectedMessage(null); }
  }, [isOpen, userData]);

  const handleSend = async () => {
    if (!selectedMessage) return addNotification("Selecione um modelo.", "info");
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
      addNotification("Falha ao enviar.", "error");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mensagens de Pagamento">
      <div className={styles.container}>
        <p>Destinatário: <strong>{userData?.name}</strong> | Status: <strong>{userData?.status}</strong></p>
        {isLoading ? <Spinner /> : (
          <div className={styles.messageList}>
            {messages.length > 0 ? messages.map(msg => (
              <div 
                key={msg.id} 
                className={`${styles.messageCard} ${selectedMessage?.id === msg.id ? styles.selected : ''}`}
                onClick={() => setSelectedMessage(msg)}
              >
                <strong>{msg.title}</strong>
                <p className={styles.messagePreview}>{msg.content}</p>
              </div>
            )) : <p>Nenhum modelo para o status {userData?.status}</p>}
          </div>
        )}
        <div className={styles.actions}>
          <Button variant="primary" onClick={handleSend} disabled={!selectedMessage || isLoading} fullWidth>
            Enviar para {userData?.email}
          </Button>
        </div>
      </div>
    </Modal>
  );
}