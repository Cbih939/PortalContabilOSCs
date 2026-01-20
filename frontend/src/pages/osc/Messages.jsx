// src/pages/contador/OSCs.jsx (ou src/pages/osc/Messages.jsx)

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
      console.log('🔄 Polling Mensagens:', response); // Debug no console

      let rawData = [];
      if (Array.isArray(response)) {
        rawData = response;
      } else if (response && Array.isArray(response.data)) {
        rawData = response.data;
      } else if (response && response.data && Array.isArray(response.data.data)) {
         rawData = response.data.data;
      }

      const formattedMessages = rawData.map(msg => {
        const senderIdStr = String(msg.sender_id || msg.senderId);
        const myUserIdStr = String(user.id);
        
        // Verifica se fui eu quem mandei
        const isMe = senderIdStr === myUserIdStr || (msg.sender_role === 'OSC');

        return {
          ...msg,
          text: msg.content || msg.message || msg.text || '',
          isMe: isMe,
          created_at: msg.created_at || new Date().toISOString()
        };
      });

      const sortedMessages = formattedMessages.sort((a, b) => 
        new Date(a.created_at) - new Date(b.created_at)
      );

      // Só atualiza se houver mudança ou se for a primeira carga
      // Isso evita que a mensagem suma enquanto o backend não processa
      if (JSON.stringify(sortedMessages) !== JSON.stringify(messages) || isLoading) {
          setMessages(sortedMessages);
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

    // ID de fallback (2) se não houver vínculo
    const targetId = user?.assigned_contador_id || user?.contador_id || 2;

    // 1. ATUALIZAÇÃO OTIMISTA (Adiciona na tela na hora)
    const optimisticMsg = {
        id: 'temp-' + Date.now(),
        text: textToSend,
        isMe: true,
        created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, optimisticMsg]);
    setNewMessage('');

    try {
      console.log(`📤 Enviando para ID: ${targetId} | Msg: ${textToSend}`);

      // 2. Envia com payload completo para garantir que o backend aceite
      const payload = {
        receiver_id: targetId,
        content: textToSend,
        receiver_role: 'contador' // Adicionado para garantir roteamento no backend
      };

      await messageService.sendMessage(payload);
      
      // 3. Força atualização imediata
      await fetchMessages();

    } catch (error) {
      console.error("❌ Erro fatal ao enviar:", error);
      
      // Mostra o erro exato na tela para sabermos o que o backend respondeu
      const errorMsg = error.response?.data?.message || error.message;
      alert(`Falha ao enviar: ${errorMsg}. \nVerifique se o ID ${targetId} existe no banco.`);
      
      // Remove a mensagem otimista se falhou
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      setNewMessage(textToSend);
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
                <span className={styles.status}>Online (Suporte)</span>
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
                <p>Nenhuma mensagem no histórico.</p>
                <p style={{fontSize:'0.85rem', marginTop:'5px'}}>Envie um "Olá" para testar a conexão.</p>
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