import React, { useState, useEffect, useCallback } from 'react';
import ContactList from '../../components/messaging/ContactList.jsx';
import ChatWindow from '../../components/messaging/ChatWindow.jsx';
import api from '../../services/api.js'; // Atualizado para usar o axios diretamente
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

  // Busca as OSCs atribuídas a este contador
  const loadContacts = useCallback(async () => {
    try {
      // Endpoint que configuramos no backend para listar contatos com as últimas mensagens
      const response = await api.get('/messages/contacts');
      setContacts(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar contatos:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carrega os contatos na primeira renderização e atualiza a lista a cada 10 segundos
  useEffect(() => {
    loadContacts();
    
    // Polling: Mantém a barra lateral atualizada caso a OSC mande mensagem enquanto o contador está online
    const interval = setInterval(loadContacts, 10000); 
    
    return () => clearInterval(interval);
  }, [loadContacts]);

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
  };

  /**
   * Lógica de Envio para o Contador
   * Salva a mensagem no banco de dados vinculando-a à OSC selecionada.
   */
  const handleSendMessage = async (text) => {
    if (!selectedContact || !text.trim()) return;

    try {
      // Dispara diretamente para a rota do backend configurada
      const response = await api.post('/messages/send', {
        receiver_id: selectedContact.id,
        content: text
      });

      // Atualiza otimisticamente a visualização da última mensagem na barra lateral (UI)
      setContacts(prev => prev.map(c => 
        c.id === selectedContact.id 
          ? { ...c, lastMessage: text, updatedAt: new Date().toISOString() } 
          : c
      ));

      return response.data;
    } catch (error) {
      console.error("Erro ao persistir mensagem no banco:", error);
      throw error;
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentContainer}>
        
        {/* Barra lateral com a lista de OSCs */}
        <div className={styles.sidebar}>
          <ContactList 
            contacts={contacts} 
            selectedContact={selectedContact} 
            onSelectContact={handleSelectContact} 
            isLoading={isLoading}
          />
        </div>

        {/* Área Principal de Chat */}
        <div className={styles.chatArea}>
          {selectedContact ? (
            <ChatWindow 
              key={`${user?.id}-${selectedContact.id}`} // Reseta o chat ao trocar de contato
              contact={selectedContact} 
              onSendMessage={handleSendMessage}
            />
          ) : (
            <div className={styles.emptyState}>
              <EmptyChatIcon className={styles.emptyIcon} />
              <h3>Selecione uma conversa</h3>
              <p>Olá {user?.name}, escolha a OSC à esquerda para iniciar o atendimento e solicitar/enviar documentos.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}