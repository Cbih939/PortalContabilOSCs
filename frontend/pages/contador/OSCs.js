// src/pages/contador/OSCs.js

import React, { useState, useEffect } from 'react';
// Importa os dados mockados (no futuro, virá da API)
import { mockOSCs } from '../../utils/mockData';

// Importa os componentes de apresentação (tabela e modais)
import OSCListView from './components/OSCListView';
import ViewOSCModal from './components/ViewOSCModal';
import EditOSCModal from './components/EditOSCModal';
import SendAlertModal from './components/SendAlertModal';

// Importa os hooks
import Spinner from '../../components/common/Spinner';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../contexts/NotificationContext';

// (Import real da API no futuro)
// import * as oscService from '../../services/oscService';
// import * as alertService from '../../services/alertService';

// --- Funções de API Simuladas (Mocks) ---
// Simula a API de atualização de uma OSC
const mockUpdateApi = (id, data) =>
  new Promise((resolve) => {
    setTimeout(() => {
      console.log('API MOCK: Atualizando OSC', id, data);
      resolve({ data }); // Retorna os dados atualizados
    }, 1000); // 1 segundo de delay
  });

// Simula a API de envio de alerta
const mockSendAlertApi = (data) =>
  new Promise((resolve) => {
    setTimeout(() => {
      console.log('API MOCK: Enviando Alerta', data);
      resolve({ data: { ...data, id: Date.now() } });
    }, 700);
  });
// --- Fim das Funções de API Simuladas ---

/**
 * Página do Contador para listar e gerenciar OSCs.
 *
 * Este é o componente "inteligente" (contêiner) que:
 * 1. Busca os dados (OSCs).
 * 2. Gerencia o estado dos modais (View, Edit, Alert).
 * 3. Lida com a lógica de API (salvar, enviar alerta).
 * 4. Passa os dados e handlers para os componentes de apresentação.
 */
export default function OSCsPage() {
  // --- Estados de Dados ---
  const [oscs, setOscs] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // --- Estados de UI (Modais) ---
  // Guarda o *objeto* da OSC que está sendo manipulada
  const [oscToView, setOscToView] = useState(null);
  const [oscToEdit, setOscToEdit] = useState(null);
  const [oscToSendAlert, setOscToSendAlert] = useState(null);
  // (Você também teria um 'oscToCreate' para o botão 'Cadastrar Nova')

  // --- Contexto ---
  const addNotification = useNotification();

  // --- API Hooks (para Ações) ---
  const { request: updateOSC, isLoading: isUpdating } = useApi(mockUpdateApi);
  const { request: sendAlert, isLoading: isSendingAlert } =
    useApi(mockSendAlertApi);

  // --- Efeito para Buscar os Dados (Simulação) ---
  useEffect(() => {
    setIsLoadingData(true);
    // Simula uma chamada de API
    setTimeout(() => {
      setOscs(mockOSCs);
      setIsLoadingData(false);
    }, 500); // 500ms de delay
  }, []); // O array vazio [] garante que rode apenas uma vez

  // --- Handlers de Ação (Abrem os modais) ---
  const handleView = (osc) => setOscToView(osc);
  const handleEdit = (osc) => setOscToEdit(osc);
  const handleSendAlert = (osc) => setOscToSendAlert(osc);
  const handleCreate = () => alert('Abrindo modal para cadastrar nova OSC...');
  const handleCloseModals = () => {
    setOscToView(null);
    setOscToEdit(null);
    setOscToSendAlert(null);
  };

  // --- Handlers de Lógica (Submetem os formulários dos modais) ---

  /** Chamado pelo EditOSCModal ao clicar em "Salvar" */
  const handleSaveEdit = async (formData) => {
    try {
      // 1. Chama a API através do hook 'useApi'
      const updatedOSC = await updateOSC(formData.id, formData);

      // 2. Sucesso! Atualiza a lista de OSCs no estado local
      //    (sem precisar recarregar a página)
      setOscs((prevOscs) =>
        prevOscs.map((o) => (o.id === updatedOSC.id ? updatedOSC : o))
      );

      // 3. Exibe notificação de sucesso
      addNotification('OSC salva com sucesso!', 'success');

      // 4. Fecha o modal
      handleCloseModals();
    } catch (err) {
      // Erro! O hook 'useApi' já exibiu a notificação de falha.
      // Não fechamos o modal, para o usuário tentar de novo.
      console.error('Falha ao salvar OSC:', err);
    }
  };

  /** Chamado pelo SendAlertModal ao clicar em "Enviar" */
  const handleSendAlertSubmit = async (formData) => {
    try {
      // 1. Chama a API
      await sendAlert(formData);

      // 2. Sucesso!
      addNotification('Alerta enviado com sucesso!', 'success');

      // 3. Fecha o modal
      handleCloseModals();
    } catch (err) {
      // Erro! O hook 'useApi' já exibiu a notificação.
      console.error('Falha ao enviar alerta:', err);
    }
  };

  // --- Renderização ---

  // Exibe um spinner enquanto os dados iniciais carregam
  if (isLoadingData) {
    return <Spinner fullscreen text="Carregando OSCs..." />;
  }

  return (
    <>
      {/* 1. O Componente de Apresentação (Tabela e Filtros) */}
      <OSCListView
        oscs={oscs}
        onView={handleView}
        onEdit={handleEdit}
        onSendAlert={handleSendAlert}
        onCreate={handleCreate} // Passa a função de criar
      />

      {/* 2. Os Modais (controlados por esta página) */}

      {/* Modal de Visualização */}
      <ViewOSCModal
        isOpen={!!oscToView} // !! transforma o objeto em booleano (true/false)
        onClose={handleCloseModals}
        osc={oscToView}
      />

      {/* Modal de Edição */}
      <EditOSCModal
        isOpen={!!oscToEdit}
        onClose={handleCloseModals}
        oscData={oscToEdit}
        onSave={handleSaveEdit}
        isLoading={isUpdating} // Passa o 'isLoading' do hook
      />

      {/* Modal de Envio de Alerta */}
      <SendAlertModal
        isOpen={!!oscToSendAlert}
        onClose={handleCloseModals}
        osc={oscToSendAlert}
        onSend={handleSendAlertSubmit}
        isLoading={isSendingAlert} // Passa o 'isLoading' do hook
      />
    </>
  );
}