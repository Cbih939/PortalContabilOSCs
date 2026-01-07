import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import * as messageService from '../../services/messageService.js';
import styles from './Messages.module.css';

// Ícone de Enviar (Aviãozinho)
const SendIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
  </svg>
);

export default function OSCMessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Carrega as mensagens
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await messageService.getMyMessages();
        setMessages(data);
      } catch (error) {
        console.error("Erro ao carregar mensagens:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
    // Opcional: Polling para atualizar mensagens a cada X segundos
    const interval = setInterval(fetchMessages, 10000); 
    return () => clearInterval(interval);
  }, []);

  // Scroll automático para o fim
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Otimista: Adiciona na tela antes de confirmar
    const tempMsg = {
      id: Date.now(),
      text: newMessage,
      sender: 'me', // Front-end flag
      sender_role: 'OSC',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, tempMsg]);
    setNewMessage('');

    try {
      await messageService.sendMessage(null, tempMsg.text, null);
      // Recarrega para garantir sincronia (opcional)
      // const data = await messageService.getMyMessages();
      // setMessages(data);
    } catch (error) {
      console.error("Erro ao enviar:", error);
      // Opcional: mostrar erro visual
    }
  };

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Mensagens</h1>

      <div className={styles.chatCard}>
        {/* Cabeçalho do Chat */}
        <div className={styles.chatHeader}>
          <div className={styles.headerInfo}>
            <h2 className={styles.contactName}>Meu Contador</h2>
            <span className={styles.status}>Online</span>
          </div>
        </div>

        {/* Área de Mensagens */}
        <div className={styles.messagesArea}>
          {isLoading ? (
            <div className={styles.loading}>Carregando conversas...</div>
          ) : messages.length === 0 ? (
            <div className={styles.emptyState}> Nenhuma mensagem ainda. Comece a conversa! </div>
          ) : (
            messages.map((msg, index) => {
              // Verifica se a mensagem é minha (OSC)
              // O backend retorna 'sender_role' ou verificamos pelo ID
              const isMe = msg.sender === 'me' || msg.sender_role === 'OSC' || msg.sender_id === user.id;
              
              return (
                <div key={index} className={`${styles.messageRow} ${isMe ? styles.sent : styles.received}`}>
                  <div className={styles.bubble}>
                    <p className={styles.messageText}>{msg.text}</p>
                    <span className={styles.timestamp}>{msg.timestamp}</span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form className={styles.inputArea} onSubmit={handleSendMessage}>
          <input
            type="text"
            className={styles.inputField}
            placeholder="Digite uma mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit" className={styles.sendButton} disabled={!newMessage.trim()}>
            <SendIcon className={styles.icon} />
          </button>
        </form>
      </div>
    </div>
  );
}