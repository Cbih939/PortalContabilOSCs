// src/pages/admin/components/PaymentMessageModal.jsx

import React, { useState, useEffect } from 'react';
import Modal from '../../../components/common/Modal.jsx';
import Button from '../../../components/common/Button.jsx';
import Spinner from '../../../components/common/Spinner.jsx';
import api from '../../../services/api.js';
import styles from './PaymentMessageModal.module.css';
import { useNotification } from '../../../contexts/NotificationContext.jsx';

/**
 * Modal para seleção e envio de mensagens padronizadas de pagamento
 */
export default function PaymentMessageModal({ isOpen, onClose, userData }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const addNotification = useNotification();

  // Mapeia o status do utilizador (do banco de dados) para a categoria da tabela payment_messages
  const getCategoryFromStatus = (status) => {
    const s = status?.toLowerCase();
    if (s === 'ativo') return 'REGULAR';
    if (s === 'pendente' || s === 'aguardando') return 'AGUARDANDO';
    if (s === 'inativo') return 'INADIMPLENTE';
    return 'REGULAR'; // Fallback
  };

  // Carrega as mensagens sempre que o modal abre ou o utilizador selecionado muda
  useEffect(() => {
    const loadMessages = async () => {
      if (!userData?.status) return;
      
      setIsLoading(true);
      const category = getCategoryFromStatus(userData.status);
      
      try {
        // Rota que busca na tabela payment_messages filtrando por categoria
        const response = await api.get(`/admin/messages/${category}`);
        setMessages(response.data || []);
      } catch (err) {
        console.error("Erro ao carregar modelos:", err);
        addNotification("Erro ao carregar modelos de mensagem.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && userData) {
      loadMessages();
    } else {
      // Limpa estados ao fechar
      setMessages([]);
      setSelectedMessage(null);
    }
  }, [isOpen, userData, addNotification]);

  const handleSend = async () => {
    if (!selectedMessage) {
      addNotification("Por favor, selecione um tom de mensagem.", "info");
      return;
    }

    try {
      // Endpoint para processar o envio (ex: NodeMailer no backend)
      await api.post('/admin/messages/send', {
        userId: userData.id,
        email: userData.email,
        messageContent: selectedMessage.content,
        subject: selectedMessage.title
      });
      
      addNotification("Mensagem enviada com sucesso!", "success");
      onClose();
    } catch (err) {
      console.error("Erro ao enviar:", err);
      addNotification("Falha ao enviar e-mail.", "error");
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Comunicado de Pagamento - CONTA COMIGO"
    >
      <div className={styles.container}>
        <div className={styles.infoBox}>
          <p className={styles.subtitle}>
            Destinatário: <strong>{userData?.name}</strong>
          </p>
          <p className={styles.statusLabel}>
            Status Atual: <span className={styles.statusValue}>{userData?.status}</span>
          </p>
        </div>
        
        <label className={styles.label}>Selecione o tom da abordagem:</label>

        {isLoading ? (
          <div className={styles.loadingContainer}>
            <Spinner text="Carregando modelos..." />
          </div>
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
                      name="payment_msg"
                      checked={selectedMessage?.id === msg.id} 
                      onChange={() => setSelectedMessage(msg)}
                    />
                    <span className={styles.messageTitle}>{msg.title}</span>
                  </div>
                  <div className={styles.messagePreview}>
                    {msg.content}
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <p>Nenhum modelo de mensagem configurado para o status "{userData?.status}".</p>
              </div>
            )}
          </div>
        )}

        <div className={styles.actions}>
          <Button 
            variant="secondary" 
            onClick={onClose}
            className={styles.cancelBtn}
          >
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSend} 
            disabled={!selectedMessage || isLoading}
            className={styles.sendBtn}
          >
            Enviar para {userData?.email}
          </Button>
        </div>
      </div>
    </Modal>
  );
}