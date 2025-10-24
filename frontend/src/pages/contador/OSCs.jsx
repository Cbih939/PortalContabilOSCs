// src/pages/contador/OSCs.jsx

import React, { useState, useEffect } from 'react';
// Serviços API
import * as oscService from '../../services/oscService.js';
import * as alertService from '../../services/alertService.js';

// Componentes de Apresentação (Tabela e Modais)
import OSCListView from './components/OSCListView.jsx';
import ViewOSCModal from './components/ViewOSCModal.jsx';
import EditOSCModal from './components/EditOSCModal.jsx';
import SendAlertModal from './components/SendAlertModal.jsx';
import CreateOSCModal from './components/CreateOSCModal.jsx'; // Modal de Criação

// Hooks e UI
import Spinner from '../../components/common/Spinner.jsx';
import useApi from '../../hooks/useApi.jsx'; // Hook Genérico para API
import { useNotification } from '../../contexts/NotificationContext.jsx'; // Para feedback

/**
 * Página do Contador para listar e gerenciar OSCs (Conectada à API).
 * Gerencia a busca de dados e o estado de todos os modais relacionados.
 */
export default function OSCsPage() {
  // --- Estados de Dados ---
  const [oscs, setOscs] = useState([]); // Lista de OSCs vinda da API
  const [isLoadingData, setIsLoadingData] = useState(true); // Loading inicial da lista
  const [errorLoading, setErrorLoading] = useState(null); // Erro ao buscar lista

  // --- Estados de UI (Modais) ---
  const [oscToView, setOscToView] = useState(null);       // Dados para modal View
  const [oscToEdit, setOscToEdit] = useState(null);       // Dados para modal Edit
  const [oscToSendAlert, setOscToSendAlert] = useState(null); // Dados para modal Alert
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // Controla modal Create

  // --- Contexto e Hooks API ---
  const addNotification = useNotification();
  // Hook para API de Atualizar OSC
  const { request: updateOSC, isLoading: isUpdating } = useApi(oscService.updateOSC);
  // Hook para API de Enviar Alerta
  const { request: sendAlert, isLoading: isSendingAlert } = useApi(alertService.sendAlertToOSC);
  // Hook para API de Criar OSC
  const { request: createOSCRequest, isLoading: isCreating } = useApi(oscService.createOSC);

  // --- Efeito para Buscar Dados da API (Lista de OSCs) ---
  useEffect(() => {
    const fetchOSCs = async () => {
      setIsLoadingData(true);
      setErrorLoading(null);
      try {
        const response = await oscService.getMyOSCs(); // Chama API real
        // Garante que é um array e ordena (opcional)
        setOscs((response.data || []).sort((a, b) => a.name.localeCompare(b.name)));
      } catch (err) {
        console.error("Erro ao buscar OSCs:", err);
        const errorMsg = err.response?.data?.message || "Não foi possível carregar a lista de OSCs.";
        setErrorLoading(errorMsg);
        addNotification("Erro ao carregar OSCs.", "error");
        setOscs([]); // Define como vazio em caso de erro
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchOSCs();
  }, [addNotification]); // addNotification é estável, roda 1 vez

  // --- Handlers para Abrir/Fechar Modais ---
  const handleView = (osc) => setOscToView(osc);
  const handleEdit = (osc) => setOscToEdit(osc);
  const handleSendAlert = (osc) => setOscToSendAlert(osc);
  const handleCreate = () => setIsCreateModalOpen(true); // Abre modal de criação

  // Função centralizada para fechar TODOS os modais
  const handleCloseModals = () => {
    setOscToView(null);
    setOscToEdit(null);
    setOscToSendAlert(null);
    setIsCreateModalOpen(false); // Fecha modal de criação
  };

  // --- Handlers para Ações dos Modais (Salvar/Enviar/Criar) ---

  /** Chamado pelo EditOSCModal ao clicar em "Salvar" */
  const handleSaveEdit = async (formData) => {
    try {
      const updatedOSCResponse = await updateOSC(formData.id, formData); // Chama API via useApi
      const updatedOSC = updatedOSCResponse; // API deve retornar a OSC atualizada

      // Busca dados completos atualizados (inclui nome/status da tabela users)
      // para garantir consistência na exibição
      const fullUpdatedOSCResponse = await oscService.getOSCById(updatedOSC.id);
      const fullUpdatedOSC = fullUpdatedOSCResponse.data;

      // Atualiza a lista local
      setOscs((prevOscs) =>
        prevOscs.map((o) => (o.id === fullUpdatedOSC.id ? fullUpdatedOSC : o))
      );
      addNotification('OSC salva com sucesso!', 'success');
      handleCloseModals();
    } catch (err) {
      console.error('Falha ao salvar OSC:', err);
      // useApi já mostra notificação de erro vinda da API
      addNotification(`Falha ao salvar: ${err.response?.data?.message || err.message}`, 'error');
    }
  };

  /** Chamado pelo SendAlertModal ao clicar em "Enviar" */
  const handleSendAlertSubmit = async (formData) => {
    // formData = { title, message, oscId }
    try {
      // Renomeia oscId para osc_id se backend esperar assim (como fizemos no controller)
      // const apiPayload = { ...formData, osc_id: formData.oscId };
      // delete apiPayload.oscId;
      // await sendAlert(apiPayload);
      await sendAlert(formData); // Chama API via useApi (passando oscId)

      addNotification('Alerta enviado com sucesso!', 'success');
      handleCloseModals();
    } catch (err) {
      console.error('Falha ao enviar alerta:', err);
      // useApi já mostra notificação
      addNotification(`Falha ao enviar alerta: ${err.response?.data?.message || err.message}`, 'error');
    }
  };

  /** Chamado pelo CreateOSCModal ao clicar em "Criar OSC" */
  const handleSaveCreate = async (formData) => {
    // formData = { name, cnpj, email (login), password, responsible?, phone?, address?, email_contato? }
    try {
        const newOSCResponse = await createOSCRequest(formData); // Chama API via useApi
        const newOSC = newOSCResponse; // API deve retornar a OSC criada (com ID e dados combinados)

        // Adiciona a nova OSC à lista local (no início) e re-ordena
        setOscs((prevOscs) => [...prevOscs, newOSC].sort((a, b) => a.name.localeCompare(b.name)));

        addNotification(`OSC "${newOSC.name}" criada com sucesso!`, 'success');
        handleCloseModals(); // Fecha o modal
      } catch (err) {
        console.error('Falha ao criar OSC:', err);
        // useApi já mostra notificação de erro vinda da API (ex: email duplicado)
        addNotification(`Falha ao criar OSC: ${err.response?.data?.message || err.message}`, 'error');
        // Não fecha o modal em caso de erro para permitir correção
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
      {/* Componente da Tabela/Filtros */}
      <OSCListView
        oscs={oscs} // Passa as OSCs buscadas da API
        onView={handleView}
        onEdit={handleEdit}
        onSendAlert={handleSendAlert}
        onCreate={handleCreate} // Passa handler para abrir modal de criação
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
        oscData={oscToEdit}
        onSave={handleSaveEdit}
        isLoading={isUpdating} // Passa loading do hook de update
      />

      {/* Send Alert Modal */}
      <SendAlertModal
        isOpen={!!oscToSendAlert}
        onClose={handleCloseModals}
        osc={oscToSendAlert}
        onSend={handleSendAlertSubmit}
        isLoading={isSendingAlert} // Passa loading do hook de alerta
      />

      {/* Create OSC Modal */}
      <CreateOSCModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModals}
        onSave={handleSaveCreate}
        isLoading={isCreating} // Passa loading do hook de criação
      />
    </>
  );
}