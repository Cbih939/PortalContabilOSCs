import React, { useState, useEffect, useCallback } from 'react';
import ContactList from '../../components/messaging/ContactList.jsx';
import ChatWindow from '../../components/messaging/ChatWindow.jsx';
import * as messageService from '../../services/messageService.js';
import { useAuth } from '../../hooks/useAuth.jsx';
import styles from './Messages.module.css';

const EmptyChatIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

export default function Messages() {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const loadContacts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await messageService.getContacts();
      setContacts(data);
    } catch (error) {
      console.error("Erro ao carregar contatos:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
  };

  /**
   * Lógica de envio que garante a persistência no banco.
   * O receiver_id é extraído do selectedContact.id.
   */
  const handleSendMessage = async (text) => {
    if (!selectedContact || !text.trim()) return;

    try {
      // Chamada ao service com objeto estruturado
      const response = await messageService.sendMessage({
        receiver_id: selectedContact.id,
        content: text
      });

      // Atualiza a interface local (lista de contatos)
      setContacts(prev => prev.map(c => 
        c.id === selectedContact.id 
          ? { ...c, lastMessage: text, updatedAt: new Date().toISOString() } 
          : c
      ));

      return response;
    } catch (error) {
      console.error("Erro ao salvar mensagem no banco:", error);
      throw error;
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentContainer}>
        
        <div className={styles.sidebar}>
          <ContactList 
            contacts={contacts} 
            selectedContact={selectedContact} 
            onSelectContact={handleSelectContact} 
            isLoading={isLoading}
          />
        </div>

        <div className={styles.chatArea}>
          {selectedContact ? (
            <ChatWindow 
              key={`${user?.id}-${selectedContact.id}`} 
              contact={selectedContact} 
              onSendMessage={handleSendMessage}
            />
          ) : (
            <div className={styles.emptyState}>
              <EmptyChatIcon className={styles.emptyIcon} />
              <h3>Selecione uma conversa</h3>
              <p>Escolha um contato à esquerda para começar a trocar mensagens.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}