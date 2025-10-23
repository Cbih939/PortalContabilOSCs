// src/utils/formatDate.js

/**
 * Formata uma data (string ISO ou objeto Date) para o formato 'Data e Hora' local.
 * Ex: "22/09/2025, 09:00"
 */
export const formatDateTime = (dateInput) => {
  if (!dateInput) return '';
  try {
    const date = new Date(dateInput);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Erro ao formatar data e hora:', dateInput, error);
    return 'Data inválida';
  }
};

/**
 * Formata uma data (string ISO ou objeto Date) para o formato 'Apenas Data' local.
 * Ex: "22/09/2025"
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return '';
  try {
    const date = new Date(dateInput);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC', // Importante para datas sem hora
    });
  } catch (error) {
    console.error('Erro ao formatar data:', dateInput, error);
    return 'Data inválida';
  }
};

/**
 * Formata uma data (string ISO ou objeto Date) para o formato 'Apenas Hora' local.
 * Ex: "09:15"
 */
export const formatTime = (dateInput) => {
  if (!dateInput) return '';
  try {
    const date = new Date(dateInput);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Erro ao formatar hora:', dateInput, error);
    return 'Hora inválida';
  }
};

/**
 * Formata uma data para um formato "relativo" amigável.
 */
export const formatRelativeTime = (dateInput) => {
  // (Implementação anterior...)
  if (!dateInput) return '';
  const date = new Date(dateInput);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return 'agora mesmo';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `há ${diffInMinutes} min`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `há ${diffInHours} h`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'ontem';
  if (diffInDays < 7) return `há ${diffInDays} dias`;
  return formatDate(date);
};