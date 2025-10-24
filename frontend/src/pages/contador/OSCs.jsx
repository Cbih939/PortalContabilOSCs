// src/pages/contador/OSCs.jsx

import React, { useState, useEffect } from 'react';
import * as oscService from '../../services/oscService.js';
import * as alertService from '../../services/alertService.js';

// Importa componentes de apresentação (tabela e modais)
import OSCListView from './components/OSCListView.jsx';
import ViewOSCModal from './components/ViewOSCModal.jsx';
import EditOSCModal from './components/EditOSCModal.jsx';
import SendAlertModal from './components/SendAlertModal.jsx';

// Importa hooks e UI
import Spinner from '../../components/common/Spinner.jsx';
import useApi from '../../hooks/useApi.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';

/**
 * Página do Contador para listar e gerenciar OSCs (Conectada à API).
 */
export default function OSCsPage() {
  // --- Estados de Dados ---
  const [oscs, setOscs] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errorLoading, setErrorLoading] = useState(null);

  // --- Estados de UI (Modais) ---
  const [oscToView, setOscToView] = useState(null);
  const [oscToEdit, setOscToEdit] = useState(null);
  const [oscToSendAlert, setOscToSendAlert] = useState(null);

  // --- Contexto e Hooks API ---
  const addNotification = useNotification();
  const { request: updateOSC, isLoading: isUpdating } = useApi(oscService.updateOSC);
  const { request: sendAlert, isLoading: isSendingAlert } = useApi(alertService.sendAlertToOSC);

  // --- Efeito para Buscar Dados da API ---
  useEffect(() => {
    const fetchOSCs = async () => {
      setIsLoadingData(true);
      setErrorLoading(null);
      try {
        const response = await oscService.getMyOSCs();
        setOscs(response.data || []); // Garante que é um array
      } catch (err) {
        console.error("Erro ao buscar OSCs:", err);
        setErrorLoading("Não foi possível carregar a lista de OSCs. Tente novamente.");
        addNotification("Erro ao carregar OSCs.", "error");
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchOSCs();
  }, [addNotification]);

  // --- Handlers para Abrir/Fechar Modais ---
  const handleView = (osc) => setOscToView(osc);
  const handleEdit = (osc) => setOscToEdit(osc);
  const handleSendAlert = (osc) => setOscToSendAlert(osc);
  const handleCreate = () => alert('Abrindo modal para cadastrar nova OSC...');

  // !! Handler CORRIGIDO para fechar todos os modais !!
  const handleCloseModals = () => {
    setOscToView(null);
    setOscToEdit(null);
    setOscToSendAlert(null);
  };

  // --- Handlers para Ações dos Modais ---
  const handleSaveEdit = async (formData) => {
    try {
      const updatedOSCResponse = await updateOSC(formData.id, formData);
      const updatedOSC = updatedOSCResponse; // Assumindo resposta direta

      // Busca dados completos atualizados (incluindo status/nome da tabela users)
      const fullUpdatedOSC = await oscService.getOSCById(updatedOSC.id);

      setOscs((prevOscs) =>
        prevOscs.map((o) => (o.id === fullUpdatedOSC.data.id ? fullUpdatedOSC.data : o))
      );
      addNotification('OSC salva com sucesso!', 'success');
      handleCloseModals(); // Fecha o modal
    } catch (err) {
      console.error('Falha ao salvar OSC:', err);
      // useApi já mostra notificação
    }
  };

  const handleSendAlertSubmit = async (formData) => {
    try {
      await sendAlert(formData);
      addNotification('Alerta enviado com sucesso!', 'success');
      handleCloseModals(); // Fecha o modal
    } catch (err) {
      console.error('Falha ao enviar alerta:', err);
      // useApi já mostra notificação
    }
  };

  // --- Renderização ---
  if (isLoadingData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 100px)' }}>
         <Spinner text="Carregando OSCs..." />
      </div>
     );
  }
  if (errorLoading) {
      return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{errorLoading}</div>;
  }

  return (
    <>
      <OSCListView
        oscs={oscs}
        onView={handleView}
        onEdit={handleEdit}
        onSendAlert={handleSendAlert}
        onCreate={handleCreate}
      />

      {/* Renderização Condicional dos Modais */}
      <ViewOSCModal
        isOpen={!!oscToView}
        onClose={handleCloseModals} // <-- Garante que a função correta é passada
        osc={oscToView}
      />
      <EditOSCModal
        isOpen={!!oscToEdit}
        onClose={handleCloseModals} // <-- Garante que a função correta é passada
        oscData={oscToEdit}
        onSave={handleSaveEdit}
        isLoading={isUpdating}
      />
      <SendAlertModal
        isOpen={!!oscToSendAlert}
        onClose={handleCloseModals} // <-- Garante que a função correta é passada
        osc={oscToSendAlert}
        onSend={handleSendAlertSubmit}
        isLoading={isSendingAlert}
      />
    </>
  );
}