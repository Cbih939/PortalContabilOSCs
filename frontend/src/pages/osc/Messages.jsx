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
  const [isLoading, setIsLoading] = useState(true);
  const [noContador, setNoContador] = useState(false); 
  const messagesEndRef = useRef(null);

  // Função de busca robusta
  const fetchMessages = async () => {
    try {
      const data = await messageService.getMyMessages();
      
      // Mapeamento crucial: garante que 'content' do banco vire 'text' no componente
      const formattedMessages = data.map(msg => ({
        ...msg,
        text: msg.content || msg.text || '',
        // Define isMe baseado no ID do usuário logado ou role
        isMe: msg.sender_id === user.id || msg.sender_role === 'OSC'
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

  // Polling para manter o chat atualizado
  useEffect(() => {
    if (user?.id) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 4000); // Atualiza a cada 4s
      return () => clearInterval(interval);
    }
  }, [user?.id, noContador]);

  // Scroll automático para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const textToSend = newMessage.trim();
    if (!textToSend) return;

    // Identifica o destinatário (Contador Carlos ID 2 como fallback seguro)
    const targetId = user?.assigned_contador_id || user?.contador_id || 2;

    if (!targetId) {
      alert("Erro: Nenhum contador vinculado.");
      return;
    }

    try {
      // 1. Limpa o campo imediatamente para UX
      setNewMessage('');

      // 2. Envia para o serviço (usando o formato que o backend espera)
      await messageService.sendMessage({
        receiver_id: targetId,
        content: textToSend
      });

      // 3. Recarrega as mensagens do banco para confirmar o envio
      await fetchMessages();
      
    } catch (error) {
      console.error("Erro ao enviar:", error);
      // Caso falhe, devolve o texto ao input para o usuário não perder a mensagem
      setNewMessage(textToSend);
      alert("Não foi possível enviar a mensagem. Tente novamente.");
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
            <div className={styles.emptyState}>Inicie uma conversa com seu contador.</div>
          ) : (
            messages.map((msg, index) => (
              <div 
                key={msg.id || index} 
                className={`${styles.messageRow} ${msg.isMe ? styles.sent : styles.received}`}
              >
                <div className={styles.bubble}>
                  <p className={styles.messageText}>{msg.text}</p>
                  <span className={styles.timestamp}>
                    {msg.created_at 
                      ? new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
                      : 'Enviando...'}
                  </span>
                </div>
              </div>
            ))
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