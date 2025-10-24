// src/pages/contador/Messages.jsx

import React, { useState, useEffect, useCallback } from 'react';
// Componentes
import ContactList from '../../components/messaging/ContactList.jsx';
import ChatWindow from '../../components/messaging/ChatWindow.jsx';
// Serviços API
import * as oscService from '../../services/oscService.js';
import * as messageService from '../../services/messageService.js';
// Mocks e Constantes (Fallback)
import { mockUsers } from '../../utils/mockData.js'; // Apenas para fallback
import { ROLES } from '../../utils/constants.js';
// Hooks e UI
import { useAuth } from '../../hooks/useAuth.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import useApi from '../../hooks/useApi.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import styles from './Messages.module.css'; // Importa CSS Module da página

/**
 * Página de Mensagens do Contador (Conectada à API).
 */
export default function ContadorMessagesPage() {
  const { user } = useAuth(); // Pega utilizador logado
  const currentUser = user || mockUsers.contador; // Usa fallback se user for null inicialmente
  const addNotification = useNotification();

  // --- Estados ---
  const [oscs, setOscs] = useState([]); // Lista de contatos (OSCs)
  const [messages, setMessages] = useState([]); // Mensagens da conversa ATIVA
  const [selectedOsc, setSelectedOsc] = useState(null); // OSC selecionada
  const [isLoadingContacts, setIsLoadingContacts] = useState(true); // Loading inicial (lista de OSCs)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false); // Loading para CADA conversa
  const [errorLoading, setErrorLoading] = useState(null); // Erros de busca

  // Hook para enviar mensagem
  const { request: sendMessageRequest, isLoading: isSending } = useApi(messageService.sendMessage);

  // --- Efeito para buscar a lista de OSCs (Contatos) ---
  useEffect(() => {
    const fetchContacts = async () => {
      setIsLoadingContacts(true);
      setErrorLoading(null);
      try {
        const response = await oscService.getMyOSCs();
        setOscs(response.data || []);
      } catch (err) {
        console.error("Erro ao buscar contatos (OSCs):", err);
        const errorMsg = err.response?.data?.message || "Não foi possível carregar a lista de contatos.";
        setErrorLoading(errorMsg);
        addNotification("Erro ao carregar contatos.", "error");
      } finally {
        setIsLoadingContacts(false);
      }
    };
    fetchContacts();
  }, [addNotification]); // addNotification é estável, roda 1 vez

  // --- Efeito para buscar o histórico da conversa SELECIONADA ---
  const fetchHistory = useCallback(async (oscId, oscName) => { // Recebe nome para notificação
      if (!oscId) return;
      setIsLoadingMessages(true);
      setErrorLoading(null);
      setMessages([]);
      try {
        const response = await messageService.getMessagesHistory(oscId);
        setMessages(response.data || []);
      } catch (err) {
        console.error(`Erro ao buscar histórico para OSC ${oscId}:`, err);
        const errorMsg = err.response?.data?.message || `Não foi possível carregar as mensagens para ${oscName}.`;
        setErrorLoading(errorMsg); // Mostra erro na área de chat
        addNotification(`Erro ao carregar mensagens de ${oscName}.`, "error");
      } finally {
        setIsLoadingMessages(false);
      }
  }, [addNotification]); // Dependências estáveis

  // Dispara a busca de histórico quando selectedOsc muda
  useEffect(() => {
    if (selectedOsc?.id) {
        fetchHistory(selectedOsc.id, selectedOsc.name);
    } else {
        setMessages([]); // Limpa mensagens se nenhuma OSC estiver selecionada
        setErrorLoading(null); // Limpa erro específico da conversa
    }
  }, [selectedOsc, fetchHistory]);

  // --- Handler Enviar Mensagem ---
  const handleSendMessage = async (text) => {
    if (!selectedOsc || !currentUser) return; // Garante que user existe
    const tempId = Date.now(); // ID Otimista
    const newMessage = {
        id: tempId,
        from: currentUser.name, // Nome do contador logado
        to: selectedOsc.name,
        text,
        date: new Date().toISOString(),
        sender_role: ROLES.CONTADOR,
    };
    setMessages((prev) => [...prev, newMessage]); // Atualização otimista
    try {
      await sendMessageRequest({ toOscId: selectedOsc.id, text });
      // Sucesso! A API salvou. Poderia atualizar msg com ID real se necessário.
    } catch (err) {
      // Reverte a atualização otimista em caso de erro
      setMessages((prev) => prev.filter(m => m.id !== tempId));
      console.error('Falha ao enviar mensagem:', err);
      // useApi já mostra notificação de erro vinda da API
      addNotification("Falha ao enviar mensagem. Tente novamente.", "error"); // Feedback extra opcional
    }
  };

  // --- Renderização ---

  // Loading inicial da lista de contatos
  if (isLoadingContacts) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spinner text="Carregando contatos..." />
      </div>
    );
  }

  // Erro irrecuperável ao carregar contatos
   if (errorLoading && !selectedOsc && oscs.length === 0) {
       return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{errorLoading}</div>;
   }

  return (
    // Container Flex principal da página (ocupa toda a altura disponível no AppLayout)
    <div className={styles.pageContainer}>

      {/* Coluna da Lista de Contatos */}
      <ContactList
        contacts={oscs}
        selectedContact={selectedOsc}
        onSelectContact={setSelectedOsc}
        className={styles.contactListColumn}
      />

      {/* Coluna da Janela de Chat / Placeholder */}
      <div className={styles.chatWindowColumn}>
        {selectedOsc ? (
          // --- Renderiza ChatWindow quando OSC está selecionada ---
          isLoadingMessages ? ( // Mostra spinner enquanto carrega histórico
            <Spinner text={`Carregando mensagens de ${selectedOsc.name}...`} />
          ) : errorLoading ? ( // Mostra erro se falhar ao carregar histórico
             <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{errorLoading}</div>
          ) : (
            // Renderiza a janela de chat com os dados carregados
            <ChatWindow
              key={selectedOsc.id} // Força recriação ao mudar de OSC
              otherParty={selectedOsc}
              messages={messages}
              user={currentUser} // Passa o utilizador logado (Contador)
              onSendMessage={handleSendMessage}
              // Passa estado de envio para desabilitar input (opcional)
              // isSending={isSending}
              className="w-full h-full" // Garante que ChatWindow ocupe o espaço
            />
          )
        ) : (
          // --- Renderiza Placeholder se NENHUMA OSC está selecionada ---
          !errorLoading && ( // Só mostra placeholder se não houver erro geral
            <div className={styles.placeholderContainer}>
              {/* Logo Placeholder */}
              <div className={styles.placeholderLogo}>
                <span>Logo Contador</span>
              </div>
              {/* Mensagem */}
              <p className={styles.placeholderText}>
                Selecione uma OSC para iniciar a conversa
              </p>
            </div>
          )
        )}
        {/* Mostra erro geral se houver e nenhuma OSC selecionada */}
        {!selectedOsc && errorLoading && (
             <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{errorLoading}</div>
        )}
      </div>
    </div>
  );
}