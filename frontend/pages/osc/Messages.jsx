// src/pages/osc/Messages.js

import React, { useState, useEffect } from 'react';
// Importa o componente de UI
import ChatWindow from '../../components/messaging/ChatWindow';
// Importa os hooks
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
// Importa os dados mockados
import { mockMessages, mockUsers } from '../../utils/mockData';
import { ROLES } from '../../utils/constants';
// Importa o Spinner
import Spinner from '../../components/common/Spinner';

// --- Função de API Simulada (Mock) ---
// Simula a API de envio de mensagem
const mockSendMessageApi = (data) =>
  new Promise((resolve) => {
    setTimeout(() => {
      // A API real retornaria a mensagem criada no banco
      const newMessage = {
        ...data,
        id: Math.floor(Math.random() * 1000) + 10,
        date: new Date().toISOString(),
      };
      resolve({ data: newMessage });
    }, 700); // 700ms de delay
  });
// --- Fim da Função de API Simulada ---

/**
 * Página de Mensagens da OSC.
 *
 * Este é o componente "inteligente" (contêiner) que:
 * 1. Busca o histórico de mensagens com o Contador.
 * 2. Lida com a lógica de envio de novas mensagens.
 * 3. Renderiza o componente 'ChatWindow' (não há lista de contactos aqui).
 */
export default function OSCMessagesPage() {
  // 1. Pega os dados do usuário logado (a OSC)
  //    (Usamos um fallback para o mock, caso o useAuth ainda não tenha carregado)
  const { user = mockUsers.osc } = useAuth();

  // 2. Define a "outra parte" da conversa: O Contador
  //    (Em uma app real, o 'user' da OSC teria um 'contadorId' associado)
  const contadorUser = mockUsers.contador;

  // 3. Estados de Dados
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 4. Conecta o hook 'useApi' com a função de envio
  //    (Renomeamos 'isLoading' para 'isSending' para clareza)
  const { request: sendMessage, isLoading: isSending } =
    useApi(mockSendMessageApi);

  // 5. Efeito para Buscar o Histórico de Mensagens (Simulação)
  useEffect(() => {
    setIsLoading(true);
    // Simula uma chamada de API
    setTimeout(() => {
      // Filtra apenas as mensagens entre *esta* OSC e o Contador
      const chatHistory = mockMessages.filter(
        (m) =>
          (m.from === user.name && m.to === ROLES.CONTADOR) ||
          (m.from === ROLES.CONTADOR && m.to === user.name)
      );
      setMessages(chatHistory);
      setIsLoading(false);
    }, 500); // 500ms de delay
  }, [user.name]); // Depende do 'user.name'

  // 6. Handlers
  /**
   * Chamado pelo ChatWindow quando a OSC envia uma nova mensagem.
   * @param {string} text - O texto da mensagem.
   */
  const handleSendMessage = async (text) => {
    try {
      // 1. Cria o objeto da nova mensagem (Atualização Otimista)
      const newMessage = {
        id: Date.now(), // ID temporário
        from: user.name, // Da OSC logada
        to: ROLES.CONTADOR, // Para o Contador
        text,
        date: new Date().toISOString(),
      };

      // 2. Adiciona a mensagem ao estado *antes* da resposta da API
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      // 3. Chama a API
      await sendMessage({
        from: user.id, // A API usaria o ID
        to: contadorUser.id, // O ID do contador
        text,
      });
      // (A API real retornaria a mensagem salva, poderíamos
      // atualizar o ID temporário aqui se necessário)
    } catch (err) {
      // Erro! O hook 'useApi' já mostrou a notificação de falha.
      // Removemos a mensagem otimista que falhou.
      addNotification('Falha ao enviar mensagem.', 'error'); // (Opcional, pois o useApi já faz)
      setMessages((prevMessages) =>
        prevMessages.filter((m) => m.id !== newMessage.id)
      );
      console.error('Falha ao enviar mensagem:', err);
    }
  };

  // 7. Renderização
  // A página 'Messages' da OSC (diferente do Contador)
  // é renderizada dentro de um 'card' com padding.
  return (
    <div className="p-8">
      {/* Container que imita o protótipo:
          - Define uma altura (100vh - header - padding)
          - Fundo branco, sombra, e 'overflow-hidden'
            para o 'ChatWindow' não vazar as bordas.
      */}
      <div className="h-[calc(100vh-200px)] bg-white rounded-lg shadow-md flex flex-col overflow-hidden">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Spinner text="A carregar histórico de mensagens..." />
          </div>
        ) : (
          <ChatWindow
            otherParty={contadorUser}
            messages={messages}
            user={user}
            onSendMessage={handleSendMessage}
            // (Podemos passar 'isSending' para o ChatWindow
            //  para desabilitar o input no futuro)
          />
        )}
      </div>
    </div>
  );
}