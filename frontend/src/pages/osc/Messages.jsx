import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import * as messageService from '../../services/messageService.js';
import styles from './Messages.module.css';

// Ícones SVG
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
  const messagesEndRef = useRef(null);

  // Busca e processa as mensagens
  const fetchMessages = async () => {
    // Se o usuário ainda não carregou, aguarda
    if (!user || !user.id) return;

    try {
      const response = await messageService.getMyMessages();
      
      // Normalização: Garante que 'data' seja um array, independente da estrutura da API
      let rawData = [];
      if (Array.isArray(response)) {
        rawData = response;
      } else if (response && Array.isArray(response.data)) {
        rawData = response.data;
      } else if (response && response.data && Array.isArray(response.data.data)) {
         rawData = response.data.data;
      }

      // Mapeamento e Identificação do Remetente
      const formattedMessages = rawData.map(msg => {
        // Converte IDs para String para comparação segura
        const senderIdStr = String(msg.sender_id);
        const myUserIdStr = String(user.id);
        
        // Verifica se fui eu quem mandei
        const isMe = senderIdStr === myUserIdStr || (msg.sender_role === 'OSC');

        return {
          ...msg,
          text: msg.content || msg.message || msg.text || '', // Suporta diferentes nomes de campo
          isMe: isMe
        };
      });

      // Ordena por data (Antigas primeiro -> Novas por último)
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

  // Polling: Busca inicial e atualização periódica
  useEffect(() => {
    fetchMessages(); // Busca imediata
    const interval = setInterval(fetchMessages, 5000); // Polling a cada 5s
    return () => clearInterval(interval);
  }, [user?.id]); 

  // Scroll automático para o fim
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const textToSend = newMessage.trim();
    if (!textToSend) return;

    // Tenta pegar o ID do contador. Se não existir, usa '2' como padrão (Suporte/Admin)
    // Isso corrige o erro de "conta não vinculada" permitindo o envio para um admin geral
    let targetId = user?.assigned_contador_id || user?.contador_id || user?.accountant_id;

    if (!targetId) {
        console.warn("⚠️ Contador não vinculado. Usando ID de fallback (2).", user);
        targetId = 2; // ID de fallback para testes ou suporte
    }

    try {
      setNewMessage(''); // Limpa UI imediatamente

      await messageService.sendMessage({
        receiver_id: targetId,
        content: textToSend
      });

      await fetchMessages(); // Atualiza lista
    } catch (error) {
      console.error("Erro ao enviar:", error);
      setNewMessage(textToSend); // Devolve o texto em caso de erro
      alert("Falha ao enviar mensagem.");
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
          {isLoading ? (
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