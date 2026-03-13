import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import api from '../../services/api.js';
import styles from './Messages.module.css';

// --- Ícones ---
const SupportIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const SendIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const UserIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export default function OSCMessagesPage() {
  const { user } = useAuth();
  
  // --- Estados do Chat ---
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  
  const messagesEndRef = useRef(null);

  // --- Função para suporte via E-mail (Mantida) ---
  const handleSupportEmail = () => {
    const email = "relacionamento@redepapelsolidario.org.br";
    const subject = encodeURIComponent(`Dúvida sobre Governança - ${user?.name || 'Minha OSC'}`);
    const body = encodeURIComponent(
      "Olá,\n\n" +
      "Gostaria de suporte a respeito da Governança da minha OSC.\n\n" +
      "Detalhes da dúvida:\n"
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  // --- Lógica do Chat ---

  // 1. Carregar contatos (Contadores atribuídos a esta OSC)
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await api.get('/messages/contacts');
        setContacts(response.data || []);
      } catch (error) {
        console.error("Erro ao carregar contatos do chat:", error);
      } finally {
        setIsLoadingContacts(false);
      }
    };
    fetchContacts();
  }, []);

  // 2. Carregar mensagens do contato selecionado e configurar "Polling" (Atualização automática)
  useEffect(() => {
    if (!selectedContact) return;

    const fetchMessages = async () => {
      try {
        // Usa query param contactId conforme definido no seu controller
        const response = await api.get('/messages', {
          params: { contactId: selectedContact.id }
        });
        setMessages(response.data || []);
      } catch (error) {
        console.error("Erro ao carregar histórico de mensagens:", error);
      }
    };

    fetchMessages(); // Busca imediata
    const interval = setInterval(fetchMessages, 5000); // Atualiza a cada 5 segundos

    return () => clearInterval(interval);
  }, [selectedContact]);

  // 3. Auto-scroll para a última mensagem
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // 4. Enviar nova mensagem
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    const textToSend = newMessage;
    setNewMessage(''); // Limpa o input imediatamente para melhor UX

    // Atualiza otimisticamente a interface
    const tempMsg = {
      id: Date.now(),
      text: textToSend,
      isMe: true,
      time: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      await api.post('/messages/send', {
        receiver_id: selectedContact.id,
        content: textToSend
      });
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      // Aqui você poderia adicionar uma notificação de erro ou reverter a mensagem
    }
  };

  // Formatação de hora
  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.headerSection}>
        <h1 className={styles.pageTitle}>Mensagens e Suporte</h1>
      </header>

      {/* CARD CENTRAL DE SUPORTE INSTITUCIONAL (Mantido) */}
      <div className={styles.supportCard}>
        <div className={styles.supportContent}>
          <div className={styles.supportText}>
            <h3>Ficou alguma dúvida sobre Governança?</h3>
            <p>
              Oferecemos suporte especializado a respeito da <strong>Governança</strong> da sua OSC. 
              Conte-nos os detalhes do seu caso e nossa equipe entrará em contato em breve.
            </p>
            <div className={styles.infoBox}>
              <span className={styles.hours}>
                <strong>Horário de funcionamento:</strong> Segunda a Sexta, das 08:00 às 17:00.
              </span>
            </div>
          </div>
          
          <button onClick={handleSupportEmail} className={styles.supportButton}>
            <SupportIcon className={styles.supportIcon} />
            Contatar Suporte por E-mail
          </button>
        </div>
      </div>

      <div className={styles.noticeBox}>
        <p>Ao clicar no botão acima, seu gerenciador de e-mail padrão será aberto com os dados de destino preenchidos.</p>
      </div>

      {/* DIVISOR */}
      <hr className={styles.divider} />

      {/* ÁREA DE CHAT - Comunicação com a Contabilidade */}
      <section className={styles.chatSection}>
        <h2 className={styles.sectionTitle}>Fale com seu Escritório de Contabilidade</h2>
        <p className={styles.sectionSubtitle}>Utilize o chat abaixo para enviar documentos, tirar dúvidas sobre impostos ou rotinas contábeis.</p>

        <div className={styles.chatLayout}>
          
          {/* COLUNA ESQUERDA: Lista de Contatos */}
          <div className={styles.contactsList}>
            {isLoadingContacts ? (
              <p className={styles.loadingText}>Carregando contatos...</p>
            ) : contacts.length > 0 ? (
              contacts.map(contact => (
                <div 
                  key={contact.id} 
                  className={`${styles.contactCard} ${selectedContact?.id === contact.id ? styles.contactActive : ''}`}
                  onClick={() => setSelectedContact(contact)}
                >
                  <div className={styles.contactAvatar}>
                    <UserIcon className={styles.avatarIcon} />
                  </div>
                  <div className={styles.contactInfo}>
                    <h4>{contact.name}</h4>
                    <span className={styles.lastMessagePreview}>
                      {contact.lastMessage || 'Clique para conversar'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.emptyText}>Nenhum contador atribuído ainda.</p>
            )}
          </div>

          {/* COLUNA DIREITA: Área de Mensagens */}
          <div className={styles.chatWindow} style={{ display: 'flex', flexDirection: 'column', height: '600px', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
            {selectedContact ? (
              <>
                <div className={styles.chatHeader} style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#111827' }}>Conversando com: {selectedContact.name}</h3>
                </div>

                <div className={styles.messagesContainer} style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {messages.length > 0 ? (
                    messages.map(msg => (
                      <div key={msg.id} className={`${styles.messageBubble} ${msg.isMe ? styles.messageMe : styles.messageThem}`}>
                        <div className={styles.messageContent}>
                          <p>{msg.text}</p>
                          <span className={styles.messageTime}>{formatTime(msg.time)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.emptyMessages} style={{ margin: 'auto', textAlign: 'center', color: '#6b7280' }}>
                      <p>Inicie a conversa com {selectedContact.name}</p>
                    </div>
                  )}
                  {/* Divisão invisível para forçar o scroll até o final SOMENTE desta div */}
                  <div ref={messagesEndRef} style={{ float: 'left', clear: 'both' }} />
                </div>

                <form onSubmit={handleSendMessage} className={styles.messageInputArea} style={{ padding: '16px', borderTop: '1px solid #e5e7eb', backgroundColor: '#fff', display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    placeholder="Digite sua mensagem..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className={styles.textInput}
                    style={{ flex: 1, padding: '10px 16px', borderRadius: '9999px', border: '1px solid #d1d5db', outline: 'none' }}
                  />
                  <button type="submit" disabled={!newMessage.trim()} className={styles.sendButton} style={{ padding: '10px 20px', borderRadius: '9999px', backgroundColor: newMessage.trim() ? '#ea580c' : '#d1d5db', color: '#fff', border: 'none', cursor: newMessage.trim() ? 'pointer' : 'not-allowed' }}>
                    <SendIcon className={styles.sendIcon} style={{ width: '20px', height: '20px' }} />
                  </button>
                </form>
              </>
            ) : (
              <div className={styles.noContactSelected} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6b7280' }}>
                <SupportIcon className={styles.placeholderIcon} style={{ width: '48px', height: '48px', marginBottom: '16px', opacity: 0.5 }} />
                <p>Selecione um contato ao lado para iniciar o chat.</p>
          </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}