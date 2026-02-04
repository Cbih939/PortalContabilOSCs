import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import * as messageService from '../../services/messageService.js';
import styles from './Messages.module.css';

// Ícones SVG
const SendIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
  </svg>
);

const SupportIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

export default function OSCMessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Função para suporte via E-mail
  const handleSupportEmail = () => {
    const email = "relacionamento@redepapelsolidario.org.br";
    const subject = encodeURIComponent(`Dúvida sobre Governança - ${user?.name || 'Minha OSC'}`);
    const body = encodeURIComponent("Olá,\n\nGostaria de suporte a respeito da Governança da minha OSC.\n\nDetalhes da dúvida:\n");
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const fetchMessages = async () => {
    if (!user || !user.id) return;
    try {
      const response = await messageService.getMyMessages();
      let rawData = Array.isArray(response) ? response : (response?.data || []);
      
      const formattedMessages = rawData.map(msg => ({
        ...msg,
        text: msg.content || msg.message || msg.text || '',
        isMe: String(msg.sender_id) === String(user.id),
        created_at: msg.created_at || new Date().toISOString()
      }));

      const sorted = formattedMessages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      
      if (JSON.stringify(sorted) !== JSON.stringify(messages) || isLoading) {
        setMessages(sorted);
      }
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const textToSend = newMessage.trim();
    if (!textToSend) return;

    const targetId = user?.assigned_contador_id || 2;
    const optimisticMsg = {
      id: 'temp-' + Date.now(),
      text: textToSend,
      isMe: true,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, optimisticMsg]);
    setNewMessage('');

    try {
      await messageService.sendMessage({
        receiver_id: targetId,
        content: textToSend
      });
      fetchMessages();
    } catch (error) {
      alert("Falha ao enviar mensagem.");
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      setNewMessage(textToSend);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.headerSection}>
        <h1 className={styles.pageTitle}>Mensagens e Suporte</h1>
      </header>

      {/* NOVO CARD DE SUPORTE À GOVERNANÇA */}
      <div className={styles.supportCard}>
        <div className={styles.supportContent}>
          <div className={styles.supportText}>
            <h3>Ficou alguma dúvida?</h3>
            <p>Suporte a respeito da Governança da sua OSC. Conte-nos com detalhes e entraremos em contato em seguida.</p>
            <span className={styles.hours}>Horário de funcionamento: das 08:00 às 17:00.</span>
          </div>
          <button onClick={handleSupportEmail} className={styles.supportButton}>
            <SupportIcon className={styles.supportIcon} />
            Contatar Suporte
          </button>
        </div>
      </div>

      <div className={styles.chatCard}>
        <div className={styles.chatHeader}>
          <div className={styles.headerInfo}>
            <h2 className={styles.contactName}>Meu Contador Especialista</h2>
            <div className={styles.statusBox}>
              <span className={styles.statusIndicator}></span>
              <span className={styles.statusText}>Canal Direto</span>
            </div>
          </div>
        </div>

        <div className={styles.messagesArea}>
          {isLoading && messages.length === 0 ? (
            <div className={styles.loading}><div className={styles.spinner}></div></div>
          ) : messages.length === 0 ? (
            <div className={styles.emptyState}>Sem histórico de mensagens.</div>
          ) : (
            messages.map((msg, index) => (
              <div key={msg.id || index} className={`${styles.messageRow} ${msg.isMe ? styles.sent : styles.received}`}>
                <div className={styles.bubble}>
                  <p className={styles.messageText}>{msg.text}</p>
                  <span className={styles.timestamp}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
            placeholder="Digite sua dúvida aqui..."
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