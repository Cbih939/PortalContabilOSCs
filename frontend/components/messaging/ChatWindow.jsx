// src/components/messaging/ChatWindow.js

import React, { useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import MessageInput from './MessageInput'; // Importa do mesmo diretório

/**
 * Componente que exibe uma janela de chat completa: cabeçalho,
 * mensagens com scroll e o campo de input.
 *
 * Props:
 * - otherParty (object): O usuário com quem se está conversando (ex: { id: 3, name: 'OSC Esperança' }).
 * - messages (array): Array de objetos de mensagem a serem exibidos.
 * - user (object): O usuário *logado* (para saber qual balão de chat alinhar à direita).
 * - onSendMessage (function): Função chamada com o texto da nova mensagem.
 * - className (string): Classes CSS adicionais para o contêiner principal.
 */
export default function ChatWindow({
  otherParty,
  messages,
  user,
  onSendMessage,
  className,
}) {
  const chatEndRef = useRef(null);

  // Efeito para rolar automaticamente para a última mensagem
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]); // Roda sempre que o array de 'messages' mudar

  return (
    <div className={clsx('flex flex-col h-full', className)}>
      {/* --- Cabeçalho do Chat --- */}
      <div className="p-4 border-b bg-white shadow-sm flex items-center flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-bold text-gray-600 mr-3">
          {otherParty.name.charAt(0)}
        </div>
        <h3 className="font-semibold text-lg text-gray-800">
          {otherParty.name}
        </h3>
      </div>

      {/* --- Área de Mensagens (com scroll) --- */}
      <div className="flex-1 p-6 overflow-y-auto bg-gray-100">
        <div className="space-y-4">
          {/* Ordena as mensagens por data antes de exibi-las */}
          {messages
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map((msg) => (
              <div
                key={msg.id}
                className={clsx(
                  'flex items-end gap-3',
                  // Se a msg for do usuário logado, alinha à direita
                  msg.from === user.name ? 'justify-end' : 'justify-start'
                )}
              >
                {/* Avatar da 'outra pessoa' (se a msg não for do usuário) */}
                {msg.from !== user.name && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center font-bold text-gray-600 text-sm flex-shrink-0">
                    {msg.from.charAt(0)}
                  </div>
                )}

                {/* Balão da Mensagem */}
                <div
                  className={clsx(
                    'max-w-md p-3 rounded-xl',
                    msg.from === user.name
                      ? 'bg-blue-500 text-white' // Estilo 'Enviado'
                      : 'bg-white text-gray-800 shadow-sm' // Estilo 'Recebido'
                  )}
                >
                  <p>{msg.text}</p>
                  <p
                    className={clsx(
                      'text-xs mt-2 text-right',
                      msg.from === user.name
                        ? 'text-blue-200'
                        : 'text-gray-400'
                    )}
                  >
                    {/* Formata a data para "HH:MM" */}
                    {new Date(msg.date).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          {/* Elemento âncora invisível para o scroll automático */}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* --- Input de Mensagem --- */}
      <div className="flex-shrink-0">
        <MessageInput onSendMessage={onSendMessage} />
      </div>
    </div>
  );
}

/**
 * --- Como Usar ---
 *
 * import ChatWindow from './ChatWindow';
 * import { useState } from 'react';
 *
 * // ... (dentro de uma página, ex: 'src/pages/osc/Messages.js')
 *
 * const [messages, setMessages] = useState(mockMessages);
 * const user = { id: 3, name: 'OSC Esperança' }; // Virá do AuthContext
 * const contador = { id: 2, name: 'Carlos Contador' };
 *
 * const handleSend = (text) => {
 * const newMessage = { ... };
 * setMessages([...messages, newMessage]);
 * };
 *
 * return (
 * <div className="h-[calc(100vh-200px)]"> // O pai deve controlar a altura
 * <ChatWindow
 * otherParty={contador}
 * messages={messages.filter(m => ...)} // Filtra msgs só dessa conversa
 * user={user}
 * onSendMessage={handleSend}
 * />
 * </div>
 * );
 */