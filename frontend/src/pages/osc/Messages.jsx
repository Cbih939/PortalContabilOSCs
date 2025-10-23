// src/pages/osc/Messages.jsx

import React, { useState, useEffect } from 'react'; // Precisa importar useState e useEffect
import ChatWindow from '../../components/messaging/ChatWindow.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';
import useApi from '../../hooks/useApi.jsx'; // Precisa importar useApi
import { useNotification } from '../../contexts/NotificationContext.jsx'; // Para feedback de erro
import { mockMessages, mockUsers } from '../../utils/mockData.js'; // Precisa importar mocks
import { ROLES } from '../../utils/constants.js'; // Precisa importar ROLES
import Spinner from '../../components/common/Spinner.jsx'; // Precisa importar Spinner
import styles from './Messages.module.css'; // Importa estilos

// --- Mock API (Mantenha ou substitua pela real) ---
const mockSendMessageApi = (data) => new Promise(resolve => { /* ... */ });
// ---

export default function OSCMessagesPage() {
  const { user = mockUsers.osc } = useAuth(); // Assume OSC como fallback
  const contadorUser = mockUsers.contador; // Define o contador
  const addNotification = useNotification(); // Para feedback

  // --- Estados ---
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { request: sendMessage, isLoading: isSending } = useApi(mockSendMessageApi); // Hook da API

  // --- Efeito para buscar mensagens ---
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const chatHistory = mockMessages.filter(
        (m) =>
          (m.from === user.name && m.to === ROLES.CONTADOR) ||
          (m.from === ROLES.CONTADOR && m.to === user.name)
      );
      setMessages(chatHistory);
      setIsLoading(false);
    }, 500);
  }, [user.name]);

  // --- Handler para enviar mensagem ---
  const handleSendMessage = async (text) => {
    try {
      const newMessage = {
        id: Date.now(),
        from: user.name,
        to: ROLES.CONTADOR,
        text,
        date: new Date().toISOString(),
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      await sendMessage({
        from: user.id,
        to: contadorUser.id,
        text,
      });
    } catch (err) {
      // O hook useApi já deve mostrar notificação, mas podemos remover a msg otimista
      setMessages((prevMessages) =>
        prevMessages.filter((m) => m.id !== newMessage.id) // Cuidado: newMessage precisa estar acessível
      );
      console.error('Falha ao enviar mensagem:', err);
    }
  };

  // --- Renderização ---
  return (
    <div className={styles.pageContainer}> {/* Usa classe da página */}
      <div className={styles.chatWrapper}>   {/* Usa classe do wrapper */}
        {isLoading ? (
          <div className={styles.loadingContainer}> {/* Container para loading */}
            <Spinner text="Carregando histórico de mensagens..." />
          </div>
        ) : (
          // Passa as props necessárias para ChatWindow
          <ChatWindow
            otherParty={contadorUser}
            messages={messages}
            user={user}
            onSendMessage={handleSendMessage}
            // Pode passar isSending aqui no futuro para desabilitar input
          />
        )}
      </div>
    </div>
  );
}