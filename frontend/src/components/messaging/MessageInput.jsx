// src/components/messaging/MessageInput.jsx

import React, { useState } from 'react';
import { SendIcon } from '../common/Icons.jsx'; // Importa ícone
import styles from './MessageInput.module.css'; // Importa CSS Module

/**
 * Componente para input de mensagem (CSS Modules).
 */
export default function MessageInput({ onSendMessage }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedText = text.trim();
    if (trimmedText) {
      onSendMessage(trimmedText);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <div className={styles.inputGroup}>
        <input
          type="text"
          className={styles.textInput}
          placeholder="Digite uma mensagem..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          className={styles.sendButton}
          disabled={!text.trim()}
          aria-label="Enviar mensagem"
        >
          <SendIcon /> {/* CSS Module estiliza o SVG */}
        </button>
      </div>
    </form>
  );
}