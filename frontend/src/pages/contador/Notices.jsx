// src/pages/contador/Notices.jsx

import React, { useState, useEffect } from 'react';
import NoticesView from './components/NoticesView.jsx'; // Componente de apresentação
import * as oscService from '../../services/oscService.js'; // Para buscar OSCs
import * as alertService from '../../services/alertService.js'; // Para enviar e buscar histórico
import useApi from '../../hooks/useApi.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { formatDate } from '../../utils/formatDate.js'; // Para formatar data no histórico

/**
 * Página Canal de Avisos do Contador (Conectada à API).
 */
export default function NoticesPage() {
  // --- Estados ---
  const [oscs, setOscs] = useState([]); // Lista de OSCs para dropdown
  const [sentNotices, setSentNotices] = useState([]); // Histórico de avisos
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errorLoading, setErrorLoading] = useState(null);
  const addNotification = useNotification();

  // Hook para a API de *envio* de aviso
  const { request: sendNoticeRequest, isLoading: isSending } = useApi(alertService.sendNotice);

  // --- Efeito para Buscar Dados Iniciais (OSCs e Histórico) ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      setErrorLoading(null);
      let fetchedOscs = []; // Guarda as OSCs buscadas para usar na formatação do histórico
      try {
        // Busca OSCs e Histórico em paralelo
        const [oscsResponse, historyResponse] = await Promise.all([
          oscService.getMyOSCs(),
          alertService.getSentNoticesHistory(),
        ]);

        fetchedOscs = oscsResponse.data || []; // Guarda as OSCs
        setOscs(fetchedOscs);

        // Formata o histórico recebido da API
        const formattedHistory = (historyResponse.data || []).map(notice => {
            const oscName = notice.osc_id === null // Assumindo que a API retorna osc_id
                           ? 'Todas as OSCs'
                           : fetchedOscs.find(o => o.id === notice.osc_id)?.name || 'OSC Desconhecida';
            return {
                ...notice,
                oscName: oscName,
                date: notice.created_at || notice.date, // Ajusta nome do campo data
                // Garante que 'type' existe, mesmo que a API não retorne (usa title como fallback)
                type: notice.type || (notice.title?.includes('Urgente') ? 'Urgente' : (notice.title?.includes('Lembrete') ? 'Lembrete' : 'Informativo')),
            };
        }).sort((a, b) => new Date(b.date) - new Date(a.date)); // Ordena por data

        setSentNotices(formattedHistory);

      } catch (err) {
        console.error("Erro ao carregar dados da página de avisos:", err);
        const errorMsg = err.response?.data?.message || "Não foi possível carregar os dados. Tente novamente.";
        setErrorLoading(errorMsg);
        addNotification("Erro ao carregar dados.", "error");
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, [addNotification]); // addNotification é estável, useEffect roda 1 vez

  // --- Handler para Enviar Aviso (Conectado à API) ---
  const handleSendNotice = async (formData) => {
    // formData = { oscId, type, title, message }
    try {
      // Renomeia oscId para osc_id se o backend esperar assim
      const apiPayload = { ...formData, osc_id: formData.oscId };
      delete apiPayload.oscId; // Remove a chave antiga se necessário

      const newNoticeResponse = await sendNoticeRequest(apiPayload); // Chama API real
      const newNotice = newNoticeResponse; // API deve retornar o aviso criado

      const oscName = formData.oscId === null
                      ? 'Todas as OSCs'
                      : oscs.find(o => o.id === formData.oscId)?.name || 'Desconhecida';

      // Adiciona ao topo do histórico local (formatado)
      setSentNotices((prev) => [{
          ...newNotice,
          id: newNotice.id || Date.now(), // Usa ID da API ou um temporário
          oscName: oscName,
          date: newNotice.created_at || new Date().toISOString(), // Usa data da resposta ou atual
          type: formData.type // Usa o tipo enviado no form
      }, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date))); // Re-ordena

      addNotification(`Aviso "${formData.title}" enviado com sucesso para ${oscName}!`, 'success');
    } catch (err) {
      console.error('Falha ao enviar aviso:', err);
      // useApi já mostra notificação de erro, mas pode adicionar log específico
      addNotification(`Falha ao enviar aviso: ${err.response?.data?.message || err.message}`, 'error');
    }
  };

  // --- Renderização ---
  if (isLoadingData) {
     return (
       <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 100px)' }}>
          <Spinner text="Carregando dados..." />
       </div>
     );
  }
  if (errorLoading) {
      return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{errorLoading}</div>;
  }

  return (
    // Renderiza o componente de apresentação com dados da API
    <NoticesView
      oscs={oscs}
      sentNotices={sentNotices}
      onSendNotice={handleSendNotice}
      isLoading={isSending} // Passa estado de loading do *envio*
    />
  );
}