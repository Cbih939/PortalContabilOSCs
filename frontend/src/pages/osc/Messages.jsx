// src/pages/contador/OSCs.jsx (ou onde ficar sua página de mensagens)
// Certifique-se de salvar este código no arquivo correto: src/pages/osc/Messages.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import * as messageService from '../../services/messageService.js';
import styles from './Messages.module.css';

// Ícones SVG
const SendIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>
);

export default function OSCMessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Busca e processa as mensagens
  const fetchMessages = async () => {
    if (!user || !user.id) return;

    try {
      const response = await messageService.getMyMessages();
      
      // LOG DE DEBUG: Abra o console (F12) para ver o que chega do backend
      console.log('📦 Mensagens recebidas do Backend:', response);

      let rawData = [];
      if (Array.isArray(response)) {
        rawData = response;
      } else if (response && Array.isArray(response.data)) {
        rawData = response.data;
      } else if (response && response.data && Array.isArray(response.data.data)) {
         rawData = response.data.data;
      }

      // Mapeamento
      const formattedMessages = rawData.map(msg => {
        const senderIdStr = String(msg.sender_id || msg.senderId);
        const myUserIdStr = String(user.id);
        
        // Verifica se a mensagem é minha
        const isMe = senderIdStr === myUserIdStr || (msg.sender_role === 'OSC');

        return {
          ...msg,
          // Tenta ler o texto de várias propriedades possíveis
          text: msg.content || msg.message || msg.text || msg.body || '',
          isMe: isMe,
          created_at: msg.created_at || msg.createdAt || new Date().toISOString()
        };
      });

      // Ordena por data
      const sortedMessages = formattedMessages.sort((a, b) => 
        new Date(a.created_at) - new Date(b.created_at)
      );

      setMessages(sortedMessages);
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Polling
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); 
    return () => clearInterval(interval);
  }, [user?.id]); 

  // Scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const textToSend = newMessage.trim();
    if (!textToSend) return;

    // ID do Contador (Fallback para 2 se não existir)
    const targetId = user?.assigned_contador_id || user?.contador_id || 2;

    // 1. ATUALIZAÇÃO OTIMISTA (Mostra na tela antes de enviar)
    const optimisticMsg = {
        id: 'temp-' + Date.now(),
        text: textToSend,
        isMe: true,
        created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setNewMessage(''); // Limpa o input

    try {
      // 2. Envia para o backend (Enviando múltiplos formatos para garantir compatibilidade)
      await messageService.sendMessage({
        receiver_id: targetId,  // Padrão snake_case
        receiverId: targetId,   // Padrão camelCase
        content: textToSend,    // Padrão comum
        message: textToSend     // Outro padrão comum
      });

      // 3. Recarrega as mensagens reais do banco
      await fetchMessages(); 
    } catch (error) {
      console.error("Erro ao enviar:", error);
      alert("Falha técnica ao enviar mensagem. Verifique o console.");
      // (Opcional) Poderíamos remover a mensagem otimista aqui se falhar
    }
  };

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Mensagens</h1>

      <div className={styles.chatCard}>
        <div className={styles.chatHeader}>
          <div className={styles.headerInfo}>
            <h2 className={styles.contactName}>Meu Contador</h2>
            <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
                <span className={styles.statusIndicator}></span>
                <span className={styles.status}>Online</span>
            </div>
          </div>
        </div>

        <div className={styles.messagesArea}>
          {isLoading && messages.length === 0 ? (
            <div className={styles.loading}>
                <div className={styles.spinner}></div> Carregando...
            </div>
          ) : messages.length === 0 ? (
            <div className={styles.emptyState}>
                <p>Nenhuma mensagem ainda.</p>
                <p style={{fontSize:'0.85rem', marginTop:'5px'}}>Envie uma mensagem para iniciar o atendimento.</p>
            </div>
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
                      : '...'}
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
            placeholder="Digite sua mensagem..."
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