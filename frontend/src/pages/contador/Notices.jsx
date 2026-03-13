import React, { useState, useEffect } from 'react';
import NoticesView from './components/NoticesView.jsx';
import * as oscService from '../../services/oscService.js';
import * as alertService from '../../services/alertService.js';
import useApi from '../../hooks/useApi.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import Spinner from '../../components/common/Spinner.jsx';

// Ícone de Informação (Tooltip) declarado localmente
const InfoIcon = () => (
  <svg 
    style={{ width: '18px', height: '18px', color: '#EC6D12', cursor: 'help', marginLeft: '10px' }} 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

/**
 * Página Canal de Avisos do Contador (Conectada à API).
 */
export default function NoticesPage() {
  const [oscs, setOscs] = useState([]);
  const [sentNotices, setSentNotices] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errorLoading, setErrorLoading] = useState(null);
  const addNotification = useNotification();

  const { request: sendNoticeRequest, isLoading: isSending } = useApi(
      alertService.sendNotice,
      { showErrorNotification: false } 
  );

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      setErrorLoading(null);
      
      try {
        const [oscsResponse, historyResponse] = await Promise.all([
          oscService.getMyOSCs(),
          alertService.getSentNoticesHistory(),
        ]);

        // PROTEÇÃO DE DADOS: Desempacotamento seguro para OSCs e Histórico
        const fetchedOscs = Array.isArray(oscsResponse) ? oscsResponse : (oscsResponse?.data || []);
        setOscs(fetchedOscs);

        const historyData = Array.isArray(historyResponse) ? historyResponse : (historyResponse?.data || []);

        const formattedHistory = historyData.map(notice => {
            // Garante que o ID "all" ou nulo seja tratado como "Todas as OSCs"
            const isAllOscs = !notice.osc_id || String(notice.osc_id) === 'all' || String(notice.osc_id) === 'null';
            const oscName = isAllOscs 
                            ? 'Todas as OSCs'
                            : fetchedOscs.find(o => String(o.id) === String(notice.osc_id))?.name || 'OSC Desconhecida';
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

  const handleSendNotice = async (formData) => {
    try {
      const newNoticeResponse = await sendNoticeRequest(formData);
      
      // PROTEÇÃO DE DADOS: Pega o objeto do aviso venha ele encapsulado ou direto
      const newNotice = newNoticeResponse?.data?.notice || newNoticeResponse?.data || newNoticeResponse || {};

      const isAllOscs = !formData.oscId || String(formData.oscId) === 'all' || String(formData.oscId) === 'null';
      const oscName = isAllOscs
                      ? 'Todas as OSCs'
                      : oscs.find(o => String(o.id) === String(formData.oscId))?.name || 'Desconhecida';

      setSentNotices((prev) => [{
          ...newNotice,
          id: newNotice.id || Date.now(),
          oscName: oscName,
          date: newNotice.created_at || new Date().toISOString(),
          type: formData.type || newNotice.type,
          // CORREÇÃO AQUI: Força a leitura do title e message diretamente do formulário preenchido!
          title: formData.title || formData.titulo || newNotice.title, 
          message: formData.message || formData.content || newNotice.message || newNotice.content
      }, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));

      addNotification(`Aviso "${formData.title || 'enviado'}" com sucesso para ${oscName}!`, 'success');
    } catch (err) {
      console.error('Falha ao enviar aviso:', err);
      addNotification(`Falha ao enviar aviso: ${err.response?.data?.message || err.message}`, 'error');
    }
  };

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
    <div style={{ position: 'relative' }}>
      {/* Tooltip de cabeçalho para explicar a função da página */}
      <div style={{ 
        position: 'absolute', 
        top: '25px', 
        left: '320px', 
        zIndex: 10,
        display: 'flex',
        alignItems: 'center'
      }}>
        <div className="tooltip-container" style={{ position: 'relative', display: 'flex' }}>
          <InfoIcon />
          <span className="tooltip-text" style={{
            visibility: 'hidden',
            width: '280px',
            backgroundColor: '#1e293b',
            color: '#fff',
            textAlign: 'left',
            borderRadius: '6px',
            padding: '12px',
            position: 'absolute',
            zIndex: 100,
            top: '125%',
            left: '0',
            opacity: 0,
            transition: 'opacity 0.3s',
            fontSize: '0.8rem',
            lineHeight: '1.4',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)',
            pointerEvents: 'none'
          }}>
            O <strong>Canal de Avisos</strong> permite enviar comunicados oficiais para uma OSC específica ou para todas as suas organizações simultaneamente. Ideal para lembretes de prazos, alterações na legislação ou avisos urgentes.
          </span>
        </div>
      </div>

      <NoticesView
        oscs={oscs}
        sentNotices={sentNotices}
        onSendNotice={handleSendNotice}
        isLoading={isSending}
      />

      {/* Injeção de estilo para o hover do Tooltip */}
      <style>{`
        .tooltip-container:hover .tooltip-text {
          visibility: visible !important;
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}