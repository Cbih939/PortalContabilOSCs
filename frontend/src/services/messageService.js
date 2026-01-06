// frontend/src/services/messageService.js

/**
 * Simula uma chamada à API para buscar a lista de contatos (OSCs).
 */
export const getContacts = async () => {
  // Simula um delay de rede de 500ms
  await new Promise(resolve => setTimeout(resolve, 500));

  return [
    {
      id: 1,
      name: 'Associação Viver Bem',
      role: 'OSC',
      unreadCount: 2,
      lastMessage: 'Enviamos os extratos pendentes.',
      lastMessageTime: '10:30',
      avatar: 'A'
    },
    {
      id: 2,
      name: 'ONG Esperança e Vida',
      role: 'OSC',
      unreadCount: 0,
      lastMessage: 'Obrigado pelo retorno!',
      lastMessageTime: 'Ontem',
      avatar: 'O'
    },
    {
      id: 3,
      name: 'Instituto Futuro Jovem',
      role: 'OSC',
      unreadCount: 5,
      lastMessage: 'Precisamos de ajuda com a nota fiscal.',
      lastMessageTime: 'Segunda',
      avatar: 'I'
    },
    {
      id: 4,
      name: 'Casa do Idoso Feliz',
      role: 'OSC',
      unreadCount: 0,
      lastMessage: 'Documentação aprovada.',
      lastMessageTime: '20/05',
      avatar: 'C'
    }
  ];
};

/**
 * Simula uma chamada à API para buscar as mensagens de um contato específico.
 */
export const getMessages = async (contactId) => {
  await new Promise(resolve => setTimeout(resolve, 300));

  // Retorna mensagens baseadas no ID para parecer real
  if (contactId === 1) {
    return [
      { id: 1, sender: 'them', text: 'Bom dia, Carlos. Tudo bem?', timestamp: '10:00' },
      { id: 2, sender: 'me', text: 'Bom dia! Tudo ótimo. Como posso ajudar?', timestamp: '10:05' },
      { id: 3, sender: 'them', text: 'Enviamos os extratos pendentes do mês passado.', timestamp: '10:30', file: { name: 'extratos_maio.pdf' } }
    ];
  }

  return [
    { id: 1, sender: 'me', text: 'Olá, precisamos da confirmação do pagamento.', timestamp: '09:00' },
    { id: 2, sender: 'them', text: 'Já enviamos o comprovante por e-mail.', timestamp: '09:15' }
  ];
};

/**
 * Simula o envio de uma mensagem.
 */
export const sendMessage = async (contactId, text, file) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  console.log(`Mensagem enviada para ${contactId}: ${text}`);
  return { success: true };
};