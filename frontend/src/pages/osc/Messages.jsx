import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import * as messageService from '../../services/messageService.js';
import styles from './Messages.module.css';

// Ícones
const SendIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>
);
const UnlinkIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
  </svg>
);

export default function OSCMessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Estados de controle
  const [isLoading, setIsLoading] = useState(true);
  const [noContador, setNoContador] = useState(false); // <--- Estado para "Não Vinculado"
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await messageService.getMyMessages();
        setMessages(data);
        setNoContador(false);
      } catch (error) {
        console.error("Erro ao carregar mensagens:", error);
        // Verifica se o erro é "Sem Contador" (404)
        if (error.response && error.response.status === 404) {
             setNoContador(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
    
    // Só faz polling se tiver contador
    let interval;
    if (!noContador) {
        interval = setInterval(fetchMessages, 10000);
    }
    return () => clearInterval(interval);
  }, [noContador]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const tempMsg = {
      id: Date.now(),
      text: newMessage,
      sender: 'me',
      sender_role: 'OSC',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, tempMsg]);
    setNewMessage('');

    try {
      await messageService.sendMessage(null, tempMsg.text, null);
    } catch (error) {
      console.error("Erro ao enviar:", error);
    }
  };

  // --- RENDERIZAÇÃO: CASO NÃO TENHA CONTADOR ---
  if (!isLoading && noContador) {
    return (
      <div className={styles.pageContainer}>
        <h1 className={styles.pageTitle}>Mensagens</h1>
        <div className={styles.errorCard}>
          <div className={styles.errorContent}>
            <UnlinkIcon className={styles.errorIcon} />
            <h2 className={styles.errorTitle}>Usuário não vinculado</h2>
            <p className={styles.errorText}>
              O seu perfil ainda não foi vinculado a um escritório de contabilidade.
              <br />
              Entre em contato com o suporte ou aguarde a vinculação para enviar mensagens.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDERIZAÇÃO: CHAT NORMAL ---
  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Mensagens</h1>

      <div className={styles.chatCard}>
        <div className={styles.chatHeader}>
          <div className={styles.headerInfo}>
            <h2 className={styles.contactName}>Meu Contador</h2>
            <span className={styles.status}>Online</span>
          </div>
        </div>

        <div className={styles.messagesArea}>
          {isLoading ? (
            <div className={styles.loading}>Carregando conversas...</div>
          ) : messages.length === 0 ? (
            <div className={styles.emptyState}> Nenhuma mensagem ainda. Comece a conversa! </div>
          ) : (
            messages.map((msg, index) => {
              // Verifica se fui eu que enviei
              const isMe = msg.sender_role === 'OSC' || msg.sender_id === user.id;
              
              return (
                <div key={index} className={`${styles.messageRow} ${isMe ? styles.sent : styles.received}`}>
                  <div className={styles.bubble}>
                    <p className={styles.messageText}>{msg.text}</p>
                    <span className={styles.timestamp}>
                        {/* Tenta formatar se vier do banco, senão usa como está */}
                        {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

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