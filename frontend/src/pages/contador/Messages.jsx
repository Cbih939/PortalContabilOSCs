import React, { useState, useEffect, useCallback } from 'react';
import ContactList from '../../components/messaging/ContactList.jsx';
import ChatWindow from '../../components/messaging/ChatWindow.jsx';
import * as messageService from '../../services/messageService.js';
import { useAuth } from '../../hooks/useAuth.jsx'; // Importante para pegar o papel do usuário
import styles from './Messages.module.css';

export default function Messages() {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth(); // Pegamos o usuário logado

  const loadContacts = useCallback(async () => {
    try {
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

  const handleSendMessage = async (text) => {
    if (!selectedContact || !text.trim()) return;

    // DEBUG: Verifique se esses dados aparecem no console do navegador (F12)
    console.log("Tentando enviar mensagem...");
    console.log("Remetente (User):", user);
    console.log("Destinatário (Contact):", selectedContact);

    try {
      // Enviamos a mensagem
      const newMessage = await messageService.sendMessage(selectedContact.id, text);
      
      console.log("Sucesso ao salvar no banco:", newMessage);

      // Atualiza lista lateral
      setContacts(prev => prev.map(c => 
        c.id === selectedContact.id 
          ? { ...c, lastMessage: text, updatedAt: new Date().toISOString() } 
          : c
      ));

      return newMessage;
    } catch (error) {
      // Se cair aqui, o erro é no servidor ou na rede
      console.error("ERRO NO BANCO DE DADOS:", error.response?.data || error.message);
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
              key={`${user?.id}-${selectedContact.id}`} // Força reset ao trocar de usuário/chat
              contact={selectedContact} 
              onSendMessage={handleSendMessage}
            />
          ) : (
            <div className={styles.emptyState}>
              <h3>Selecione uma conversa</h3>
              <p>Olá {user?.name}, escolha um contato para conversar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}