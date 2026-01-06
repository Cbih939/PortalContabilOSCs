import React, { useState, useEffect, useRef } from 'react';
import MessageInput from './MessageInput.jsx';
import * as messageService from '../../services/messageService.js';
import styles from './ChatWindow.module.css';

export default function ChatWindow({ contact }) {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  // Carrega mensagens quando o contato muda
  useEffect(() => {
    if (contact) {
      // Simulação de carregamento (substituir por chamada real da API)
      const loadMessages = async () => {
        const msgs = await messageService.getMessages(contact.id);
        setMessages(msgs);
      };
      loadMessages();
    }
  }, [contact]);

  // Scroll para o fim
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (text, file) => {
    // Cria objeto de mensagem temporário (otimista)
    const newMessage = {
      id: Date.now(),
      text,
      sender: 'me', // 'me' = contador, 'them' = osc
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      file: file ? { name: file.name } : null
    };

    setMessages([...messages, newMessage]);
    
    // Aqui você chamaria a API real: await messageService.sendMessage(...)
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
            className={`${styles.messageRow} ${msg.sender === 'me' ? styles.sent : styles.received}`}
          >
            <div className={styles.bubble}>
              {msg.text}
              {msg.file && (
                <div style={{ marginTop: '0.5rem', fontStyle: 'italic', fontSize: '0.8rem' }}>
                  📎 {msg.file.name}
                </div>
              )}
              <span className={styles.timestamp}>{msg.timestamp}</span>
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