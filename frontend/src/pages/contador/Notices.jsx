// src/pages/contador/Notices.jsx

import React, { useState, useEffect } from 'react';
import NoticesView from './components/NoticesView.jsx'; // Importa componente refatorado
import { mockOSCs, mockAlerts } from '../../utils/mockData.js'; // Importa mocks
import useApi from '../../hooks/useApi.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import Spinner from '../../components/common/Spinner.jsx';
// import * as alertService from '../../services/alertService.js'; // API real

// --- Mock API ---
const mockSendAlertApi = (data) => new Promise(resolve => setTimeout(() => resolve({ ...data, id: Date.now(), date: new Date().toISOString() }), 700));
// ---

/**
 * Página Canal de Avisos do Contador (CSS Modules).
 */
export default function NoticesPage() {
  const [oscs, setOscs] = useState([]);
  const [sentNotices, setSentNotices] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const addNotification = useNotification();
  const { request: sendNotice, isLoading: isSending } = useApi(mockSendAlertApi); // API real: useApi(alertService.sendNotice);

  // Efeito para buscar dados
  useEffect(() => {
    setIsLoadingData(true);
    setTimeout(() => {
      setOscs(mockOSCs);
      // Prepara histórico (adiciona oscName e ordena)
      const history = mockAlerts.map(a => ({
          ...a,
          oscName: a.oscId === null ? 'Todas as OSCs' : mockOSCs.find(o => o.id === a.oscId)?.name || 'Desconhecida',
          // 'type' já deve existir no mockAlerts que adicionámos
        })).sort((a, b) => new Date(b.date) - new Date(a.date));
      setSentNotices(history);
      setIsLoadingData(false);
    }, 500);
  }, []);

  // Handler para enviar aviso
  const handleSendNotice = async (formData) => {
    try {
      const newNotice = await sendNotice(formData);
      const oscName = formData.oscId === null ? 'Todas as OSCs' : oscs.find(o => o.id === formData.oscId)?.name || 'Desconhecida';
      // Adiciona ao topo do histórico local
      setSentNotices((prev) => [{ ...newNotice, oscName, type: formData.type }, ...prev]); // Inclui 'type' explicitamente
      addNotification(`Aviso enviado com sucesso para ${oscName}!`, 'success');
    } catch (err) {
      console.error('Falha ao enviar aviso:', err);
      // useApi já mostra notificação
    }
  };

  // Renderização
  if (isLoadingData) {
     return ( // Spinner dentro do layout
       <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 100px)' }}>
          <Spinner text="Carregando dados..." />
       </div>
     );
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