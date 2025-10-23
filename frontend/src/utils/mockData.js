// src/utils/mockData.js

// Mock Users
export const mockUsers = {
  adm: { id: 1, name: 'Admin Geral', role: 'Adm' },
  contador: { id: 2, name: 'Carlos Contador', role: 'Contador', email: 'carlos.contador@email.com' },
  osc: { id: 3, name: 'OSC Esperança', role: 'OSC', cnpj: '12.345.678/0001-99' },
};

// Mock OSCs 
export const mockOSCs = [
  { id: 3, name: 'OSC Esperança', cnpj: '12.345.678/0001-99', responsible: 'Maria Silva', status: 'Ativo', email: 'contato@esperanca.org', phone: '(11) 98765-4321', address: 'Rua das Flores, 123, São Paulo, SP' },
  { id: 4, name: 'Instituto Novo Amanhã', cnpj: '98.765.432/0001-11', responsible: 'João Pereira', status: 'Inativo', email: 'contato@novoamanha.org', phone: '(21) 91234-5678', address: 'Avenida Central, 456, Rio de Janeiro, RJ' },
  { id: 5, name: 'Associação Bem Viver', cnpj: '55.666.777/0001-22', responsible: 'Ana Costa', status: 'Ativo', email: 'contato@bemviver.org', phone: '(31) 95555-8888', address: 'Praça da Liberdade, 789, Belo Horizonte, MG' },
];

// Mock Files 
export const mockFiles = [
    { id: 1, name: 'Balancete_Janeiro.pdf', from: 'OSC Esperança', to: 'Contador', date: '2024-07-15', type: 'sent' },
    { id: 2, name: 'Contrato_Social.docx', from: 'OSC Esperança', to: 'Contador', date: '2024-07-16', type: 'sent' },
    { id: 3, name: 'Guia_Imposto.pdf', from: 'Contador', to: 'OSC Esperança', date: '2024-07-18', type: 'received' },
    { id: 4, name: 'Relatorio_Anual.pdf', from: 'Instituto Novo Amanhã', to: 'Contador', date: '2024-07-20', type: 'sent' }, // Ajuste 'from' se necessário
    { id: 5, name: 'Comprovante_Pagamento.pdf', from: 'Associação Bem Viver', to: 'Contador', date: '2024-07-21', type: 'sent' }, // Ajuste 'from' se necessário
    // Adicione aqui outros ficheiros mock se necessário, ajustando 'from' e 'to'
    // para corresponder aos nomes em mockUsers.
    // Exemplo para OSC Esperança receber um ficheiro:
    // { id: 6, name: 'Instrucoes_IR.pdf', from: 'Contador', to: 'OSC Esperança', date: '2024-07-25', type: 'received' },
];

// Mock Messages 
export const mockMessages = [
    { id: 1, from: 'OSC Esperança', to: 'Contador', text: 'Olá, enviamos o balancete de Janeiro. Por favor, confirme o recebimento.', date: '2024-07-15T10:30:00Z' },
    { id: 2, from: 'Contador', to: 'OSC Esperança', text: 'Recebido. Estamos analisando e retornaremos em breve.', date: '2024-07-15T11:00:00Z' },
    { id: 3, from: 'Associação Bem Viver', to: 'Contador', text: 'Bom dia! Tenho uma dúvida sobre o imposto X. Podemos conversar?', date: '2024-07-22T09:00:00Z' }, // Ajuste 'from' se necessário
    { id: 4, from: 'Instituto Novo Amanhã', to: 'Contador', text: 'O relatório anual foi enviado. Aguardamos o parecer.', date: '2024-07-20T14:00:00Z' }, // Ajuste 'from' se necessário
    { id: 5, from: 'Contador', to: 'Associação Bem Viver', text: 'Claro, pode me ligar a qualquer momento para esclarecermos sua dúvida sobre o imposto.', date: '2024-07-22T09:15:00Z' }, // Ajuste 'to' se necessário
    // Adicione mais mensagens mock conforme necessário
];

// Mock Notifications 
export const mockNotifications = [
    { id: 1, oscName: 'OSC Esperança', type: 'file', content: 'Balancete_Julho.pdf', timestamp: '2025-09-19T09:30:00' },
    { id: 2, oscName: 'Associação Bem Viver', type: 'message', content: 'Bom dia! Uma dúvida sobre o imposto...', timestamp: '2025-09-19T08:45:00' },
    { id: 3, oscName: 'Instituto Novo Amanhã', type: 'file', content: 'Ata_Reuniao.docx', timestamp: '2025-09-18T17:20:00' },
];

// Mock Alerts 
export const mockAlerts = [
    { id: 1, oscId: 3, title: "Pendência Urgente", message: "O balancete de Junho ainda não foi enviado. Por favor, regularize a situação até o final da semana.", date: "2025-09-22T09:00:00Z", read: false, type: 'Urgente' },
    { id: 2, oscId: 4, title: "Aviso Importante", message: "Lembre-se da nova legislação sobre doações que entra em vigor no próximo mês.", date: "2025-09-21T15:00:00Z", read: true, type: 'Informativo' },
    // Adicione mais mocks se necessário
];