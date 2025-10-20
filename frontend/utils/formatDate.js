// src/utils/formatDate.js

/**
 * Formata uma data (string ISO ou objeto Date) para o formato 'Data e Hora' local.
 * Ex: "22/09/2025, 09:00"
 *
 * @param {string | Date} dateInput A data a ser formatada.
 * @returns {string} A data formatada.
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
 *
 * @param {string | Date} dateInput A data a ser formatada.
 * @returns {string} A data formatada.
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return '';
  try {
    const date = new Date(dateInput);
    // Adiciona timeZone: 'UTC' para evitar problemas onde a data
    // (ex: "2025-09-22T00:00:00Z") vira "21/09/2025" no Brasil (GMT-3).
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
 *
 * @param {string | Date} dateInput A data a ser formatada.
 * @returns {string} A data formatada.
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
 * (Ex: "há 5 minutos", "ontem", "há 2 dias")
 *
 * NOTA: Esta é uma implementação simples. Para maior precisão
 * (ex: "daqui a 5 minutos"), uma biblioteca como 'date-fns'
 * (com a função 'formatDistanceToNow') é recomendada.
 *
 * @param {string | Date} dateInput A data a ser formatada.
 * @returns {string} A data formatada de forma relativa.
 */
export const formatRelativeTime = (dateInput) => {
  if (!dateInput) return '';
  
  const date = new Date(dateInput);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'agora mesmo';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `há ${diffInMinutes} min`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `há ${diffInHours} h`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return 'ontem';
  }
  if (diffInDays < 7) {
    return `há ${diffInDays} dias`;
  }

  // Se for mais de uma semana, apenas mostra a data
  return formatDate(date);
};

/**
 * --- Como Usar ---
 *
 * import { formatDate, formatDateTime } from '../../utils/formatDate';
 *
 * <p>{formatDate('2025-09-22T00:00:00Z')}</p> // "22/09/2025"
 * <p>{formatDateTime('2025-09-22T09:30:00Z')}</p> // "22/09/2025, 06:30" (GMT-3)
 * <p>{formatTime('2025-09-22T09:30:00Z')}</p> // "06:30" (GMT-3)
 * <p>{formatRelativeTime(new Date(Date.now() - 60000 * 5))}</p> // "há 5 min"
 */