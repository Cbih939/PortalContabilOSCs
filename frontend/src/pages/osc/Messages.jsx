// src/pages/osc/Messages.jsx

import React, { useState, useEffect } from 'react';
// Componentes
import ChatWindow from '../../components/messaging/ChatWindow.jsx';
// Hooks
import { useAuth } from '../../hooks/useAuth.jsx';
import useApi from '../../hooks/useApi.jsx'; // Hook para API
import { useNotification } from '../../contexts/NotificationContext.jsx'; // Para feedback
// Serviços API REAIS
import * as messageService from '../../services/messageService.js';
// Mocks (apenas para fallback/placeholder) e Constantes
import { mockUsers } from '../../utils/mockData.js'; 
import { ROLES } from '../../utils/constants.js';
// UI
import Spinner from '../../components/common/Spinner.jsx';
import styles from './Messages.module.css';
import { formatDate } from '../../utils/formatDate.js'; // Importar formatDate (se não estiver em ChatWindow)

/**
 * Página de Mensagens da OSC (Conectada à API).
 */
export default function OSCMessagesPage() {
  const { user } = useAuth();
  const currentUser = user || mockUsers.osc; // Fallback
  const addNotification = useNotification();

  // --- Estados ---
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // Estado para guardar os dados do contador (para o cabeçalho do chat)
  const [contadorUser, setContadorUser] = useState(null); 

  // Hook para a API de *envio* (agora usa o serviço real)
  const { request: sendMessageRequest, isLoading: isSending } = useApi(messageService.sendMessage);

  // --- Efeito para Buscar Histórico e Dados do Contador ---
  useEffect(() => {
    // Evita chamadas de API se o user não estiver carregado
    if (!currentUser?.id || currentUser.role !== ROLES.OSC) {
        setIsLoading(false);
        return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 1. Busca o histórico de mensagens
        const messagesResponse = await messageService.getMyMessages();
        setMessages(messagesResponse.data || []);

        // 2. Define os dados do contador (do mock, ou poderia vir de uma API 'getMyContador')
        // O backend já sabe quem é o contador, mas o frontend precisa
        // dos dados (nome) para exibir no cabeçalho do ChatWindow.
        // Vamos usar o mock por enquanto, assumindo que só há um.
        setContadorUser(mockUsers.contador); 

      } catch (err) {
        console.error("Erro ao buscar histórico de mensagens:", err);
        addNotification("Não foi possível carregar o histórico de mensagens.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentUser?.id, currentUser.role, addNotification]); // Dependências

  // --- Handler para enviar mensagem ---
  const handleSendMessage = async (text) => {
    if (!currentUser || !contadorUser) return; // Não envia se os dados não estiverem prontos
    
    const tempId = Date.now(); // ID Otimista
    // Cria a mensagem otimista
    const newMessage = {
      id: tempId,
      from: currentUser.name, // Da OSC logada
      to: contadorUser.name, // Para o Contador
      text,
      date: new Date().toISOString(),
      sender_role: ROLES.OSC, // Identifica o remetente
    };

    // 1. Atualização Otimista (mostra o balão azul)
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    try {
      // 2. Chama a API real
      // O backend (sendMessage) só espera o { text } da OSC.
      // Ele descobre o osc_id e o contador_id a partir do token (via req.user).
      await sendMessageRequest({ text }); 

      // (Opcional: A API poderia retornar a msg salva para atualizar o ID)

    } catch (err) {
      // 3. Reverte em caso de falha (faz a mensagem desaparecer)
      console.error('Falha ao enviar mensagem (revertendo):', err);
      addNotification(`Falha ao enviar mensagem: ${err.response?.data?.message || err.message}`, 'error');
      setMessages((prevMessages) =>
        prevMessages.filter((m) => m.id !== tempId) // Remove a mensagem que falhou
      );
    }
  };

  // --- Renderização ---
  return (
    <div className={styles.pageContainer}>
      <div className={styles.chatWrapper}>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <Spinner text="Carregando histórico de mensagens..." />
          </div>
        ) : !contadorUser ? ( 
             <div className={styles.loadingContainer}>
                {/* Mostra este erro se o backend não encontrou um contador associado */}
                <p style={{color: 'red'}}>Utilizador não associado a um contador.</p>
             </div>
        ) : (
          // Passa os dados corretos para ChatWindow
          <ChatWindow
            otherParty={contadorUser} // O objeto do Contador
            messages={messages}       // O histórico de mensagens
            user={currentUser}      // O objeto da OSC logada
            onSendMessage={handleSendMessage}
            // isSending={isSending} // Opcional: para desabilitar input
          />
        )}
      </div>
    </div>
  );
}