// src/pages/contador/Messages.js

import React, { useState, useEffect } from 'react';
// Importa os componentes de "messaging"
import ContactList from '../../components/messaging/ContactList';
import ChatWindow from '../../components/messaging/ChatWindow';
// Importa os dados mockados (no futuro, virá da API)
import { mockOSCs, mockMessages, mockUsers } from '../../utils/mockData';
// Importa as constantes de Roles
import { ROLES } from '../../utils/constants';
// Importa o hook de autenticação para saber quem é o usuário logado
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../../components/common/Spinner';

// (No futuro, você usaria o hook 'useApi' para enviar mensagens)
// import { useApi } from '../../hooks/useApi';
// import * as messageService from '../../services/messageService';

/**
 * Página de Mensagens do Contador (Messenger View).
 *
 * Este é o componente "inteligente" (contêiner) que:
 * 1. Busca os contatos (OSCs) e as mensagens.
 * 2. Gerencia o estado (qual OSC está selecionada, o array de mensagens).
 * 3. Renderiza o layout de 2 colunas (ContactList + ChatWindow).
 */
export default function MessagesPage() {
  // Pega o usuário 'Contador' logado do nosso Contexto de Autenticação
  const { user }... {
    // Se o useAuth não carregar a tempo (o que não deve acontecer
    // aqui, pois esta é uma rota protegida), usamos um fallback
    // baseado no mockData para fins de desenvolvimento.
    user: mockUsers.contador,
  };

  // --- Estados de Dados ---
  const [oscs, setOscs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Estado de UI ---
  const [selectedOsc, setSelectedOsc] = useState(null);

  // (Hook para API real - para enviar mensagem)
  // const { request: sendMessageApi, isLoading: isSending } = useApi(messageService.sendMessage);

  // --- Efeito para Buscar os Dados (Simulação) ---
  useEffect(() => {
    setIsLoading(true);
    // Simula uma chamada de API para buscar OSCs e Mensagens
    setTimeout(() => {
      // No mundo real, você buscaria apenas as OSCs associadas a este contador
      setOscs(mockOSCs);
      // E todas as mensagens deste contador
      setMessages(mockMessages);
      setIsLoading(false);
    }, 300); // 300ms de delay
  }, []); // O array vazio [] garante que rode apenas uma vez

  // --- Handlers de Ação ---

  /**
   * Chamado pelo ChatWindow quando o Contador envia uma nova mensagem.
   */
  const handleSendMessage = async (text) => {
    if (!selectedOsc) return;

    // 1. Cria o objeto da nova mensagem (formato otimista)
    const newMessage = {
      id: messages.length + 100, // ID temporário
      from: user.name, // Do usuário logado (Contador)
      to: selectedOsc.name, // Para a OSC selecionada
      text,
      date: new Date().toISOString(),
    };

    // 2. Atualização Otimista:
    //    Adiciona a mensagem ao estado *antes* da resposta da API,
    //    para o chat parecer instantâneo.
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // 3. (Para API real) Chama a API para salvar a mensagem
    try {
      // await sendMessageApi({ to: selectedOsc.id, text });
      // Se a API respondesse com a mensagem salva (ex: com ID real),
      // poderíamos atualizar o estado aqui para trocar o ID temporário.
    } catch (err) {
      // Erro! O 'useApi' já mostrou a notificação.
      // Aqui, removemos a mensagem otimista que falhou.
      setMessages((prevMessages) =>
        prevMessages.filter((m) => m.id !== newMessage.id)
      );
    }
  };

  // --- Renderização ---

  // Exibe um spinner enquanto os contatos carregam
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner text="Carregando mensagens..." />
      </div>
    );
  }

  // Filtra as mensagens *apenas* da conversa selecionada
  const filteredMessages = selectedOsc
    ? messages.filter(
        (m) =>
          (m.from === selectedOsc.name && m.to === user.name) ||
          (m.from === user.name && m.to === selectedOsc.name)
      )
    : [];

  return (
    // O 'AppLayout' garante que este contêiner tenha a altura
    // correta (h-full). A div abaixo divide a tela.
    <div className="flex h-full">
      {/* 1. Lista de Contatos (OSCs) - Ocupa 1/3 */}
      <ContactList
        contacts={oscs}
        selectedContact={selectedOsc}
        onSelectContact={setSelectedOsc}
        className="w-full md:w-1/3" // Flexível em mobile, 1/3 em desktop
      />

      {/* 2. Janela de Chat - Ocupa 2/3 */}
      <div className="flex-1 md:w-2/3 h-full">
        {selectedOsc ? (
          <ChatWindow
            // A 'key' é importante! Ela força o React a
            // *recriar* o ChatWindow quando a OSC selecionada
            // muda, resetando o scroll e o cabeçalho.
            key={selectedOsc.id}
            otherParty={selectedOsc}
            messages={filteredMessages}
            user={user}
            onSendMessage={handleSendMessage}
            // (isSending={isSending}) // (Para API real)
          />
        ) : (
          // Placeholder se nenhuma conversa estiver selecionada
          <div className="flex-1 h-full flex items-center justify-center text-gray-500 bg-gray-100">
            <p className="text-lg">
              Selecione uma OSC para iniciar a conversa
            </p>
          </div>
        )}
      </div>
    </div>
  );
}