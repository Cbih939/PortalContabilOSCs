// src/pages/contador/Messages.jsx

import React, { useState, useEffect } from 'react';
// Componentes de Mensagens (já refatorados)
import ContactList from '../../components/messaging/ContactList.jsx';
import ChatWindow from '../../components/messaging/ChatWindow.jsx';
// Mocks e Constantes
import { mockOSCs, mockMessages, mockUsers } from '../../utils/mockData.js';
import { ROLES } from '../../utils/constants.js';
// Hooks e UI
import { useAuth } from '../../hooks/useAuth.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import useApi from '../../hooks/useApi.jsx';
// import * as messageService from '../../services/messageService.js'; // API real
import styles from './Messages.module.css'; // Importa CSS Module da página

// --- Mock API ---
const mockSendMessageApi = (data) => new Promise(resolve => { /* ... */ });
// ---

/**
 * Página de Mensagens do Contador (CSS Modules).
 */
export default function ContadorMessagesPage() {
  // Usa fallback do mock se useAuth ainda não carregou (mas não deveria acontecer)
  const { user = mockUsers.contador } = useAuth();

  // --- Estados ---
  const [oscs, setOscs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOsc, setSelectedOsc] = useState(null); // OSC selecionada
  const { request: sendMessage, isLoading: isSending } = useApi(mockSendMessageApi);

  // --- Efeito para buscar dados ---
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      // API real: buscar OSCs associadas e todas as mensagens
      setOscs(mockOSCs); // Mock: Assume que o contador vê todas as OSCs
      setMessages(mockMessages);
      setIsLoading(false);
    }, 300);
  }, []);

  // --- Handler Enviar Mensagem ---
  const handleSendMessage = async (text) => {
    if (!selectedOsc) return;
    const newMessage = { /* ... (lógica otimista como antes) ... */ };
    setMessages((prev) => [...prev, newMessage]);
    try {
      await sendMessage({ toOscId: selectedOsc.id, text }); // Passa ID da OSC
    } catch (err) {
      setMessages((prev) => prev.filter(m => m.id !== newMessage.id));
      console.error('Falha ao enviar mensagem:', err);
    }
  };

  // Filtra mensagens da conversa selecionada
  const filteredMessages = selectedOsc
    ? messages.filter(
        m => (m.from === selectedOsc.name && m.to === user.name) ||
             (m.from === user.name && m.to === selectedOsc.name)
      )
    : [];

  // --- Renderização ---
  if (isLoading) { // Spinner ocupa toda a área da página
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spinner text="Carregando mensagens..." />
      </div>
    );
  }

  return (
    // Container Flex principal da página
    <div className={styles.pageContainer}>
      {/* Coluna da Lista de Contatos */}
      <ContactList
        contacts={oscs}
        selectedContact={selectedOsc}
        onSelectContact={setSelectedOsc}
        className={styles.contactListColumn} // Aplica classe de largura
      />

      {/* Coluna da Janela de Chat */}
      <div className={styles.chatWindowColumn}>
        {selectedOsc ? (
          <ChatWindow
            key={selectedOsc.id} // Força recriação ao mudar de OSC
            otherParty={selectedOsc}
            messages={filteredMessages}
            user={user}
            onSendMessage={handleSendMessage}
            // className="h-full" // O container pai já define a altura
          />
        ) : (
          // Placeholder
          <p className={styles.placeholderText}>
            Selecione uma OSC para iniciar a conversa
          </p>
        )}
      </div>
    </div>
  );
}