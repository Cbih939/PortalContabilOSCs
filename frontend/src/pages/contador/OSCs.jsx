// src/pages/contador/OSCs.jsx

import React, { useState, useEffect } from 'react';
// Importa mocks (substituir por API)
import { mockOSCs } from '../../utils/mockData.js';

// Importa componentes de apresentação (tabela e modais)
import OSCListView from './components/OSCListView.jsx';
import ViewOSCModal from './components/ViewOSCModal.jsx';
import EditOSCModal from './components/EditOSCModal.jsx';
import SendAlertModal from './components/SendAlertModal.jsx';

// Importa hooks
import Spinner from '../../components/common/Spinner.jsx';
import useApi from '../../hooks/useApi.jsx'; // Nome correto do hook
import { useNotification } from '../../contexts/NotificationContext.jsx';

// (Import real da API no futuro)
// import * as oscService from '../../services/oscService.js';
// import * as alertService from '../../services/alertService.js';

// --- Funções de API Simuladas (Mocks - Manter ou remover se usar API real) ---
const mockUpdateApi = (id, data) => new Promise(resolve => setTimeout(() => resolve({ data }), 1000));
const mockSendAlertApi = (data) => new Promise(resolve => setTimeout(() => resolve({ data: { ...data, id: Date.now() } }), 700));
// --- Fim Mocks API ---

/**
 * Página do Contador para listar e gerenciar OSCs (com lógica de modais).
 */
export default function OSCsPage() {
  // --- Estados de Dados ---
  const [oscs, setOscs] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // --- Estados de UI (Modais) ---
  const [oscToView, setOscToView] = useState(null);
  const [oscToEdit, setOscToEdit] = useState(null);
  const [oscToSendAlert, setOscToSendAlert] = useState(null);

  // --- Contexto e Hooks API ---
  const addNotification = useNotification();
  const { request: updateOSC, isLoading: isUpdating } = useApi(mockUpdateApi); // Para Editar
  const { request: sendAlert, isLoading: isSendingAlert } = useApi(mockSendAlertApi); // Para Enviar Alerta

  // --- Efeito para Buscar Dados ---
  useEffect(() => {
    setIsLoadingData(true);
    setTimeout(() => {
      // Aqui você chamaria a API real: const data = await oscService.getMyOSCs(); setOscs(data);
      setOscs(mockOSCs); // Usando mock por enquanto
      setIsLoadingData(false);
    }, 500);
  }, []);

  // --- Handlers para Abrir/Fechar Modais ---
  const handleView = (osc) => setOscToView(osc);
  const handleEdit = (osc) => setOscToEdit(osc);
  const handleSendAlert = (osc) => setOscToSendAlert(osc);
  const handleCreate = () => alert('Abrindo modal para cadastrar nova OSC...'); // Placeholder
  const handleCloseModals = () => {
    setOscToView(null);
    setOscToEdit(null);
    setOscToSendAlert(null);
  };

  // --- Handlers para Ações dos Modais (Salvar/Enviar) ---
  const handleSaveEdit = async (formData) => {
    try {
      const updatedOSC = await updateOSC(formData.id, formData);
      setOscs((prevOscs) =>
        prevOscs.map((o) => (o.id === updatedOSC.id ? updatedOSC : o))
      );
      addNotification('OSC salva com sucesso!', 'success');
      handleCloseModals();
    } catch (err) {
      console.error('Falha ao salvar OSC:', err);
      // useApi já mostra notificação de erro
    }
  };

  const handleSendAlertSubmit = async (formData) => {
    try {
      await sendAlert(formData);
      addNotification('Alerta enviado com sucesso!', 'success');
      handleCloseModals();
    } catch (err) {
      console.error('Falha ao enviar alerta:', err);
      // useApi já mostra notificação de erro
    }
  };

  // --- Renderização ---
  if (isLoadingData) {
    // Usamos um spinner dentro do layout principal para não cobrir a sidebar/header
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 100px)' }}>
         <Spinner text="Carregando OSCs..." />
      </div>
     );
  }

  return (
    <>
      {/* Componente da Tabela/Filtros */}
      <OSCListView
        oscs={oscs}
        onView={handleView}
        onEdit={handleEdit}
        onSendAlert={handleSendAlert}
        onCreate={handleCreate}
      />

      {/* Renderização Condicional dos Modais */}
      {/* View Modal */}
      <ViewOSCModal
        isOpen={!!oscToView}
        onClose={handleCloseModals}
        osc={oscToView}
      />

      {/* Edit Modal */}
      <EditOSCModal
        isOpen={!!oscToEdit}
        onClose={handleCloseModals}
        oscData={oscToEdit} // Prop correta é oscData
        onSave={handleSaveEdit}
        isLoading={isUpdating}
      />

      {/* Send Alert Modal */}
      <SendAlertModal
        isOpen={!!oscToSendAlert}
        onClose={handleCloseModals}
        osc={oscToSendAlert}
        onSend={handleSendAlertSubmit}
        isLoading={isSendingAlert}
      />

      {/* (Modal de Criar OSC - Futuro) */}
    </>
  );
}