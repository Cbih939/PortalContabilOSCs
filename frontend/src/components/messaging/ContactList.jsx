// src/components/messaging/ContactList.jsx

import React, { useState } from 'react';
// import { clsx } from 'clsx'; // Não mais necessário
import Input from '../common/Input.jsx'; // Importa Input refatorado
import { SearchIcon } from '../common/Icons.jsx'; // Importa Ícone
import styles from './ContactList.module.css'; // Importa CSS Module

/**
 * Lista de Contactos (OSCs) para Mensagens (CSS Modules).
 */
export default function ContactList({
  contacts = [],
  selectedContact,
  onSelectContact,
  className = '', // Para classes extras do container (ex: largura)
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`${styles.container} ${className}`}>
      {/* Cabeçalho e Busca */}
      <div className={styles.header}>
        <h2 className={styles.title}>Conversas</h2>
        <div className={styles.searchContainer}>
          <Input
            icon={SearchIcon} // O Input aplica estilo ao ícone
            type="text"
            placeholder="Buscar OSC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Lista */}
      <div className={styles.list}>
        {filteredContacts.length > 0 ? (
          filteredContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => onSelectContact(contact)}
              // Aplica classe de item e classe selecionada condicionalmente
              className={`
                ${styles.contactItem}
                ${selectedContact?.id === contact.id ? styles.contactItemSelected : ''}
              `}
            >
              <p className={styles.contactName}>{contact.name}</p>
              {/* Pode adicionar última mensagem aqui */}
            </div>
          ))
        ) : (
          <p className={styles.emptyText}>Nenhum contato encontrado.</p>
        )}
      </div>
    </div>
  );
}