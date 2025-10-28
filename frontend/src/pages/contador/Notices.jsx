// src/pages/contador/Notices.jsx

import React, { useState, useEffect } from 'react';
import NoticesView from './components/NoticesView.jsx';
import * as oscService from '../../services/oscService.js';
import * as alertService from '../../services/alertService.js';
import useApi from '../../hooks/useApi.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { formatDate } from '../../utils/formatDate.js';

/**
 * Página Canal de Avisos do Contador (Conectada à API).
 */
export default function NoticesPage() {
  const [oscs, setOscs] = useState([]);
  const [sentNotices, setSentNotices] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errorLoading, setErrorLoading] = useState(null);
  const addNotification = useNotification();

  // Hook para a API de *envio* de aviso
  // Dizemos ao useApi para NÃO mostrar o seu próprio erro,
  // pois trataremos o erro manualmente no handleSendNotice
  const { request: sendNoticeRequest, isLoading: isSending } = useApi(
      alertService.sendNotice,
      { showErrorNotification: false } 
  );

  // Efeito para Buscar Dados Iniciais
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      setErrorLoading(null);
      let fetchedOscs = [];
      try {
        const [oscsResponse, historyResponse] = await Promise.all([
          oscService.getMyOSCs(),
          alertService.getSentNoticesHistory(),
        ]);

        fetchedOscs = oscsResponse.data || [];
        setOscs(fetchedOscs);

        const formattedHistory = (historyResponse.data || []).map(notice => {
            const oscName = notice.osc_id === null
                           ? 'Todas as OSCs'
                           : fetchedOscs.find(o => o.id === notice.osc_id)?.name || 'OSC Desconhecida';
            return {
                ...notice,
                oscName: oscName,
                date: notice.created_at || notice.date,
                type: notice.type || (notice.title?.includes('Urgente') ? 'Urgente' : (notice.title?.includes('Lembrete') ? 'Lembrete' : 'Informativo')),
            };
        }).sort((a, b) => new Date(b.date) - new Date(a.date));

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
  }, [addNotification]);

  // --- Handler para Enviar Aviso (CORRIGIDO) ---
  const handleSendNotice = async (formData) => {
    // formData já vem de NoticesView como:
    // { oscId: (number|null), type: string, title: string, message: string }
    
    try {
      // --- CORREÇÃO AQUI ---
      // O backend espera 'oscId' (camelCase), não 'osc_id'.
      // O 'formData' já está no formato correto.
      const newNoticeResponse = await sendNoticeRequest(formData); // Envia formData diretamente
      // --- FIM DA CORREÇÃO ---
      
      const newNotice = newNoticeResponse;

      const oscName = formData.oscId === null
                      ? 'Todas as OSCs'
                      : oscs.find(o => o.id === formData.oscId)?.name || 'Desconhecida';

      // Adiciona ao topo do histórico local
      setSentNotices((prev) => [{
          ...newNotice,
          id: newNotice.id || Date.now(),
          oscName: oscName,
          date: newNotice.created_at || new Date().toISOString(),
          type: formData.type
      }, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));

      addNotification(`Aviso "${formData.title}" enviado com sucesso para ${oscName}!`, 'success');
    
    } catch (err) {
      console.error('Falha ao enviar aviso:', err);
      // Mostra a notificação de erro manualmente
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
    <NoticesView
      oscs={oscs}
      sentNotices={sentNotices}
      onSendNotice={handleSendNotice}
      isLoading={isSending}
    />
  );
}