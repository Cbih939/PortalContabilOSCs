// src/pages/contador/Notices.js

import React, { useState, useEffect } from 'react';
// Importa o componente de apresentação
import NoticesView from './components/NoticesView';
// Importa os dados mockados (no futuro, virá da API)
import { mockOSCs, mockAlerts, mockUsers } from '../../utils/mockData';
// Importa o hook 'useApi' para a ação de *enviar*
import { useApi } from '../../hooks/useApi';
// Importa o hook 'useNotification' para dar feedback de sucesso
import { useNotification } from '../../contexts/NotificationContext';
// (Serviço de API real)
// import * as alertService from '../../services/alertService';
import Spinner from '../../components/common/Spinner';

/**
 * Página do Contador para o Canal de Avisos.
 *
 * Este é o componente "inteligente" (contêiner) que:
 * 1. Busca os dados (OSCs e histórico de avisos).
 * 2. Gerencia a lógica de envio de novos avisos (API).
 * 3. Passa os dados e handlers para o 'NoticesView' (apresentação).
 */
export default function NoticesPage() {
  // --- Estados de Dados ---
  const [oscs, setOscs] = useState([]);
  const [sentNotices, setSentNotices] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // --- Contexto ---
  const addNotification = useNotification();

  // --- API Hooks ---
  // Hook para a API de *envio* de aviso
  // (Simulando uma função de API que sempre dá certo)
  const mockSendAlertApi = (data) =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...data, id: Date.now(), date: new Date().toISOString() });
      }, 700);
    });

  // Conecta o hook 'useApi' à nossa função de API
  const { request: sendNotice, isLoading: isSending } =
    useApi(mockSendAlertApi);
  // (API real)
  // const { request: sendNotice, isLoading: isSending } = useApi(alertService.sendNotice);

  // --- Efeito para Buscar os Dados (Simulação) ---
  useEffect(() => {
    setIsLoadingData(true);
    // Simula uma chamada de API para buscar OSCs e Histórico
    setTimeout(() => {
      setOscs(mockOSCs);

      // Prepara os dados do histórico (do mock)
      const history = mockAlerts
        .map((a) => ({
          ...a,
          // Adiciona o nome da OSC ao aviso, com base no ID
          oscName:
            a.oscId === null
              ? 'Todas as OSCs'
              : mockOSCs.find((o) => o.id === a.oscId)?.name || 'Desconhecida',
          type: a.title.includes('Urgente') ? 'Urgente' : 'Informativo',
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date)); // Mais recentes primeiro

      setSentNotices(history);
      setIsLoadingData(false);
    }, 500); // 500ms de delay
  }, []); // O array vazio [] garante que rode apenas uma vez

  // --- Handlers de Ação ---

  /**
   * Chamado pelo NoticesView quando o formulário é submetido.
   * @param {object} formData - { oscId, type, title, message }
   */
  const handleSendNotice = async (formData) => {
    try {
      // 1. Chama a API através do hook 'useApi'
      const newNotice = await sendNotice(formData);

      // 2. Sucesso! Adiciona o novo aviso ao topo da lista (histórico)
      //    (Precisamos adicionar o 'oscName' manualmente para o histórico)
      const oscName =
        newNotice.oscId === null
          ? 'Todas as OSCs'
          : oscs.find((o) => o.id === newNotice.oscId)?.name || 'Desconhecida';

      setSentNotices((prev) => [{ ...newNotice, oscName }, ...prev]);

      // 3. Exibe a notificação de sucesso
      addNotification(
        `Aviso enviado com sucesso para ${oscName}!`,
        'success'
      );
    } catch (err) {
      // Erro! O hook 'useApi' já exibiu a notificação de falha.
      // Não precisamos fazer mais nada aqui.
      console.error('Falha ao enviar aviso:', err);
    }
  };

  // --- Renderização ---

  // Exibe um spinner enquanto os dados iniciais carregam
  if (isLoadingData) {
    return <Spinner fullscreen text="Carregando dados..." />;
  }

  return (
    <NoticesView
      oscs={oscs}
      sentNotices={sentNotices}
      onSendNotice={handleSendNotice}
      isLoading={isSending} // Passa o 'isLoading' do *envio* para o componente
    />
  );
}