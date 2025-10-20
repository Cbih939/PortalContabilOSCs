// src/components/messaging/MessageInput.js

import React, { useState } from 'react';
import { SendIcon } from '../common/Icons';

/**
 * Componente para o campo de entrada de texto e botão de envio
 * em uma janela de chat.
 *
 * Props:
 * - onSendMessage (function): Função chamada com o texto da nova mensagem
 * quando o formulário é enviado.
 */
export default function MessageInput({ onSendMessage }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault(); // Impede o recarregamento da página

    const trimmedText = text.trim();
    if (trimmedText) {
      onSendMessage(trimmedText); // Envia a mensagem (sem espaços em branco extras)
      setText(''); // Limpa o campo de input
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
      <div className="flex items-center space-x-3">
        {/* --- Campo de Texto --- */}
        <input
          type="text"
          className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Digite uma mensagem..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {/* --- Botão de Envio --- */}
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          // Desabilita o botão se o campo estiver vazio (após trim)
          disabled={!text.trim()}
        >
          <SendIcon className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}

/**
 * --- Como Usar ---
 *
 * // Este componente é geralmente usado dentro de um componente
 * // pai, como o 'ChatWindow.js'.
 *
 * const handleSend = (messageText) => {
 * console.log('Nova mensagem:', messageText);
 * // Lógica para atualizar o estado das mensagens
 * };
 *
 * <MessageInput onSendMessage={handleSend} />
 */