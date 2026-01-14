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
  const [noContador, setNoContador] = useState(false); 
  
  const messagesEndRef = useRef(null);

  // Função de busca movida para fora para ser reutilizada
  const fetchMessages = async () => {
    try {
      const data = await messageService.getMyMessages();
      // Mapeia os campos do banco (content) para o que o componente exibe (text)
      const formattedMessages = data.map(msg => ({
        ...msg,
        text: msg.content || msg.text,
        sender: msg.sender_id === user.id ? 'me' : 'other'
      }));
      setMessages(formattedMessages);
      setNoContador(false);
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
      if (error.response && error.response.status === 404) {
        setNoContador(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    
    let interval;
    if (!noContador) {
      interval = setInterval(fetchMessages, 5000); // Polling a cada 5s
    }
    return () => clearInterval(interval);
  }, [noContador]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // 1. Tenta pegar o ID do contador do usuário logado
    // 2. Se não existir, tenta o ID 2 (que é o Carlos Contador no seu banco) como teste
    const targetId = user?.assigned_contador_id || user?.contador_id || 2;

    if (!targetId) {
      alert("Erro: Você não está vinculado a um contador.");
      return;
    }

    try {
      // Chamada direta com os dois parâmetros esperados
      await messageService.sendMessage(targetId, newMessage);
      
      // Feedback visual
      const tempMsg = {
        id: Date.now(),
        text: newMessage,
        sender_role: 'OSC',
        sender_id: user.id,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, tempMsg]);
      setNewMessage('');
    } catch (error) {
      console.error("Erro ao enviar:", error);
    }
  };

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

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Mensagens</h1>

      <div className={styles.chatCard}>
        <div className={styles.chatHeader}>
          <div className={styles.headerInfo}>
            <h2 className={styles.contactName}>Meu Contador</h2>
            <span className={styles.status}>Canal Direto</span>
          </div>
        </div>

        <div className={styles.messagesArea}>
          {isLoading ? (
            <div className={styles.loading}>Carregando conversas...</div>
          ) : messages.length === 0 ? (
            <div className={styles.emptyState}> Mensagem direta com o contador </div>
          ) : (
            messages.map((msg, index) => {
              const isMe = msg.sender_role === 'OSC' || msg.sender_id === user.id;
              
              return (
                <div key={msg.id || index} className={`${styles.messageRow} ${isMe ? styles.sent : styles.received}`}>
                  <div className={styles.bubble}>
                    <p className={styles.messageText}>{msg.text}</p>
                    <span className={styles.timestamp}>
                        {msg.created_at 
                          ? new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
                          : msg.timestamp}
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