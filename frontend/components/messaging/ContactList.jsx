// src/components/messaging/ContactList.js

import React, { useState } from 'react';
import { clsx } from 'clsx';
import Input from '../common/Input';
import { SearchIcon } from '../common/Icons';

/**
 * Exibe uma lista de contatos (OSCs) para o módulo de mensagens,
 * com funcionalidade de busca.
 *
 * Props:
 * - contacts (array): O array de objetos de contato (ex: [{ id, name }, ...]).
 * - selectedContact (object): O objeto do contato atualmente selecionado.
 * - onSelectContact (function): Função chamada com o objeto de contato quando ele é clicado.
 * - className (string): Classes CSS adicionais para o contêiner principal.
 */
export default function ContactList({
  contacts,
  selectedContact,
  onSelectContact,
  className,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtra os contatos com base no termo de busca
  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className={clsx(
        'w-full border-r border-gray-200 bg-gray-50 flex flex-col',
        className
      )}
    >
      {/* --- Cabeçalho e Busca --- */}
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold text-gray-700">Conversas</h2>
        <div className="relative mt-4">
          <Input
            icon={SearchIcon}
            type="text"
            placeholder="Buscar OSC..."
            className="w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* --- Lista de Contatos (com scroll) --- */}
      <div className="overflow-y-auto flex-1">
        {filteredContacts.length > 0 ? (
          filteredContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => onSelectContact(contact)}
              className={clsx(
                'p-4 cursor-pointer hover:bg-gray-200 border-b border-gray-100',
                // Destaca o contato que está selecionado
                selectedContact?.id === contact.id ? 'bg-blue-100' : ''
              )}
            >
              <p className="font-semibold text-gray-800">{contact.name}</p>
              {/* Você pode adicionar a "última mensagem" aqui no futuro */}
              {/* <p className="text-sm text-gray-500 truncate">Última mensagem...</p> */}
            </div>
          ))
        ) : (
          <p className="p-4 text-center text-gray-500">Nenhum contato encontrado.</p>
        )}
      </div>
    </div>
  );
}

/**
 * --- Como Usar ---
 *
 * import ContactList from './ContactList';
 * import { useState } from 'react';
 *
 * // ... (dentro de uma página, ex: 'src/pages/contador/Messages.js')
 *
 * const [oscs, setOscs] = useState(mockOSCs);
 * const [selected, setSelected] = useState(null);
 *
 * return (
 * <div className="flex h-full">
 * <ContactList
 * contacts={oscs}
 * selectedContact={selected}
 * onSelectContact={(osc) => setSelected(osc)}
 * className="w-1/3" // Controla a largura
 * />
 * <div className="w-2/3">
 * {selected ? <ChatWindow ... /> : <p>Selecione uma conversa</p>}
 * </div>
 * </div>
 * );
 */