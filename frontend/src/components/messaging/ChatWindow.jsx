import React, { useState, useEffect, useRef } from 'react';
import MessageInput from './MessageInput.jsx';
import * as messageService from '../../services/messageService.js';
import styles from './ChatWindow.module.css';

// 1. Agora o componente recebe o 'onSendMessage' do ficheiro pai (Messages.jsx)
export default function ChatWindow({ contact, onSendMessage }) {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  // Função isolada para podermos recarregar as mensagens sempre que precisarmos
  const loadMessages = async () => {
    if (contact) {
      const msgs = await messageService.getMessages(contact.id);
      setMessages(msgs);
    }
  };

  // Carrega mensagens quando o contato muda e define um auto-refresh (polling)
  useEffect(() => {
    loadMessages();
    
    // Auto-atualiza a conversa a cada 5 segundos para receber novas mensagens
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [contact]);

  // Scroll para o fim da conversa
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (text, file) => {
    // 2. Cria a mensagem temporária para aparecer instantaneamente no ecrã
    // Atualizado para usar o padrão "isMe" e "time" que o nosso Backend usa!
    const newMessage = {
      id: Date.now(),
      text,
      isMe: true, 
      time: new Date().toISOString(),
      file: file ? { name: file.name } : null
    };

    // Coloca a mensagem no ecrã imediatamente
    setMessages(prev => [...prev, newMessage]);
    
    // 3. Comunica com o ficheiro pai para gravar a mensagem no banco de dados!
    if (onSendMessage) {
      try {
        await onSendMessage(text);
        // Após salvar com sucesso, recarrega a lista do banco para garantir o ID oficial
        loadMessages();
      } catch (error) {
        console.error("Falha ao enviar mensagem:", error);
        // Em um sistema mais complexo, poderíamos mostrar um aviso de "Falha no envio" aqui
      }
    }
  };

  return (
    <div className={styles.container}>
      {/* Cabeçalho do Chat */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h3>{contact.name}</h3>
          <span>{contact.role || 'OSC'}</span>
        </div>
      </div>

      {/* Lista de Mensagens */}
      <div className={styles.messagesList}>
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            // Atualizado para ler o "isMe" corretamente
            className={`${styles.messageRow} ${msg.isMe ? styles.sent : styles.received}`}
          >
            <div className={styles.bubble}>
              {msg.text}
              {msg.file && (
                <div style={{ marginTop: '0.5rem', fontStyle: 'italic', fontSize: '0.8rem' }}>
                  📎 {msg.file.name}
                </div>
              )}
              {/* Formata a data ISO que vem do backend para horas:minutos */}
              <span className={styles.timestamp}>
                {new Date(msg.time || msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
}