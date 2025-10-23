// src/components/messaging/ChatWindow.jsx

import React, { useEffect, useRef } from 'react';
// import { clsx } from 'clsx'; // Não mais necessário
import MessageInput from './MessageInput.jsx'; // Importa Input refatorado
import styles from './ChatWindow.module.css'; // Importa CSS Module
import { formatTime } from '../../utils/formatDate.js'; // Importa helper de data

/**
 * Componente ChatWindow (CSS Modules).
 */
export default function ChatWindow({
  otherParty,
  messages = [], // Garante que é um array
  user,
  onSendMessage,
  className = '',
}) {
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Garante que otherParty e user existem para evitar erros
  if (!otherParty || !user) {
    return <div className={styles.chatContainer}>Carregando dados...</div>; // Ou um placeholder melhor
  }

  return (
    <div className={`${styles.chatContainer} ${className}`}>
      {/* Cabeçalho */}
      <div className={styles.header}>
        <div className={styles.avatarPlaceholder}>
          {otherParty.name?.charAt(0) || '?'}
        </div>
        <h3 className={styles.headerName}>
          {otherParty.name || 'Desconhecido'}
        </h3>
      </div>

      {/* Área de Mensagens */}
      <div className={styles.messagesArea}>
        <div className={styles.messagesList}>
          {messages
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map((msg) => {
              const isSentByUser = msg.from === user.name; // Verifica se a mensagem foi enviada pelo utilizador logado
              return (
                <div
                  key={msg.id}
                  className={`
                    ${styles.messageRow}
                    ${isSentByUser ? styles.messageRowSent : styles.messageRowReceived}
                  `}
                >
                  {/* Avatar (só para mensagens recebidas) */}
                  {!isSentByUser && (
                    <div className={styles.messageAvatar}>
                      {msg.from?.charAt(0) || '?'}
                    </div>
                  )}

                  {/* Balão da Mensagem */}
                  <div
                    className={`
                      ${styles.messageBubble}
                      ${isSentByUser ? styles.bubbleSent : styles.bubbleReceived}
                    `}
                  >
                    <p className={styles.messageText}>{msg.text}</p>
                    <p
                      className={`
                        ${styles.messageTimestamp}
                        ${isSentByUser ? styles.timestampSent : styles.timestampReceived}
                      `}
                    >
                      {formatTime(msg.date)} {/* Usa helper para formatar */}
                    </p>
                  </div>
                </div>
              );
            })}
          {/* Âncora para scroll */}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input de Mensagem */}
      <div className={styles.inputContainer}>
        <MessageInput onSendMessage={onSendMessage} />
      </div>
    </div>
  );
}