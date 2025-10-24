// src/pages/contador/OSCs.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Importa Link
// Serviços API
import * as oscService from '../../services/oscService.js';
import * as alertService from '../../services/alertService.js';

// Componentes
import OSCListView from './components/OSCListView.jsx';
import ViewOSCModal from './components/ViewOSCModal.jsx';
import EditOSCModal from './components/EditOSCModal.jsx';
import SendAlertModal from './components/SendAlertModal.jsx';
// REMOVIDO: CreateOSCModal (agora é uma página)

// Hooks e UI
import Spinner from '../../components/common/Spinner.jsx';
import useApi from '../../hooks/useApi.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';

/**
 * Página do Contador para listar e gerenciar OSCs (Conectada à API).
 * Gerencia a busca de dados e o estado dos modais (View, Edit, Alert).
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
  // REMOVIDO: isCreateModalOpen

  // --- Contexto e Hooks API ---
  const addNotification = useNotification();
  const { request: updateOSC, isLoading: isUpdating } = useApi(oscService.updateOSC);
  const { request: sendAlert, isLoading: isSendingAlert } = useApi(alertService.sendAlertToOSC);
  // REMOVIDO: useApi para createOSC (agora na CreateOSCPage)

  // --- Efeito para Buscar Dados da API (Lista de OSCs) ---
  useEffect(() => {
    const fetchOSCs = async () => {
      setIsLoadingData(true);
      setErrorLoading(null);
      try {
        const response = await oscService.getMyOSCs();
        setOscs((response.data || []).sort((a, b) => a.name.localeCompare(b.name)));
      } catch (err) {
        console.error("Erro ao buscar OSCs:", err);
        const errorMsg = err.response?.data?.message || "Não foi possível carregar a lista de OSCs.";
        setErrorLoading(errorMsg);
        addNotification("Erro ao carregar OSCs.", "error");
        setOscs([]);
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
  // REMOVIDO: handleCreate (agora é um link)

  const handleCloseModals = () => {
    setOscToView(null);
    setOscToEdit(null);
    setOscToSendAlert(null);
    // REMOVIDO: setIsCreateModalOpen(false)
  };

  // --- Handlers para Ações dos Modais (Salvar/Enviar) ---
  const handleSaveEdit = async (formData) => {
    try {
      const updatedOSCResponse = await updateOSC(formData.id, formData);
      const updatedOSC = updatedOSCResponse;
      const fullUpdatedOSCResponse = await oscService.getOSCById(updatedOSC.id);
      const fullUpdatedOSC = fullUpdatedOSCResponse.data;

      setOscs((prevOscs) =>
        prevOscs.map((o) => (o.id === fullUpdatedOSC.id ? fullUpdatedOSC : o))
      );
      addNotification('OSC salva com sucesso!', 'success');
      handleCloseModals();
    } catch (err) {
      console.error('Falha ao salvar OSC:', err);
      addNotification(`Falha ao salvar: ${err.response?.data?.message || err.message}`, 'error');
    }
  };

  const handleSendAlertSubmit = async (formData) => {
    try {
      await sendAlert(formData);
      addNotification('Alerta enviado com sucesso!', 'success');
      handleCloseModals();
    } catch (err) {
      console.error('Falha ao enviar alerta:', err);
      addNotification(`Falha ao enviar alerta: ${err.response?.data?.message || err.message}`, 'error');
    }
  };
  // REMOVIDO: handleSaveCreate (agora na CreateOSCPage)

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
        // onCreate não é mais passado
      />

      {/* Renderização Condicional dos Modais */}
      <ViewOSCModal isOpen={!!oscToView} onClose={handleCloseModals} osc={oscToView} />
      <EditOSCModal
        isOpen={!!oscToEdit} onClose={handleCloseModals}
        oscData={oscToEdit} onSave={handleSaveEdit} isLoading={isUpdating}
      />
      <SendAlertModal
        isOpen={!!oscToSendAlert} onClose={handleCloseModals}
        osc={oscToSendAlert} onSend={handleSendAlertSubmit} isLoading={isSendingAlert}
      />
      {/* REMOVIDO: CreateOSCModal */}
    </>
  );
}