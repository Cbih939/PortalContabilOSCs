import React, { useState } from 'react';
import styles from './ContactList.module.css';

// Ícone de Lupa
const SearchIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

export default function ContactList({ contacts, selectedContact, onSelectContact, isLoading }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Mensagens</h2>
        <input 
          type="text" 
          placeholder="Pesquisar..." 
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={styles.list}>
        {isLoading ? (
          <div style={{ padding: '1rem', textAlign: 'center', color: '#9ca3af' }}>Carregando...</div>
        ) : (
          filteredContacts.map((contact) => (
            <div 
              key={contact.id} 
              className={`${styles.contactItem} ${selectedContact?.id === contact.id ? styles.selected : ''}`}
              onClick={() => onSelectContact(contact)}
            >
              <div className={styles.avatar}>
                {contact.name.charAt(0).toUpperCase()}
              </div>
              <div className={styles.info}>
                <div className={styles.nameRow}>
                  <span className={styles.name}>{contact.name}</span>
                  {/* Se tiver data da última msg, mostra aqui */}
                  {contact.lastMessageTime && <span className={styles.date}>{contact.lastMessageTime}</span>}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={styles.lastMessage}>{contact.lastMessage || 'Sem mensagens'}</span>
                  {contact.unreadCount > 0 && (
                    <span className={styles.badge}>{contact.unreadCount}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}