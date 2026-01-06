import React, { useState } from 'react';
import styles from './MessageInput.module.css';

// Ícones SVG
const PaperClipIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
  </svg>
);

const SendIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

export default function MessageInput({ onSendMessage }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text, null); // Envia texto e null para arquivo por enquanto
      setText('');
    }
  };

  return (
    <form className={styles.inputContainer} onSubmit={handleSubmit}>
      <button type="button" className={styles.attachButton} title="Anexar arquivo">
        <PaperClipIcon className={styles.icon} />
      </button>
      
      <input
        type="text"
        className={styles.textField}
        placeholder="Escreva uma mensagem..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      
      <button type="submit" className={styles.sendButton} disabled={!text.trim()}>
        <SendIcon className={styles.icon} />
      </button>
    </form>
  );
}