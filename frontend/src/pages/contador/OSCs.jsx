// src/pages/contador/OSCs.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as oscService from '../../services/oscService.js';
import * as alertService from '../../services/alertService.js';

import OSCListView from './components/OSCListView.jsx';
import ViewOSCModal from './components/ViewOSCModal.jsx';
import EditOSCModal from './components/EditOSCModal.jsx';
import SendAlertModal from './components/SendAlertModal.jsx';

import Spinner from '../../components/common/Spinner.jsx';
import useApi from '../../hooks/useApi.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';

export default function OSCsPage() {
  const [oscs, setOscs] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errorLoading, setErrorLoading] = useState(null);

  const [oscToView, setOscToView] = useState(null);
  const [oscToEdit, setOscToEdit] = useState(null);
  const [oscToSendAlert, setOscToSendAlert] = useState(null);

  const addNotification = useNotification();
  const { request: updateOSC, isLoading: isUpdating } = useApi(oscService.updateOSC);
  const { request: sendAlert, isLoading: isSendingAlert } = useApi(alertService.sendAlertToOSC);

  // --- BUSCA DE DADOS (Aqui estava o problema) ---
  useEffect(() => {
    const fetchOSCs = async () => {
      setIsLoadingData(true);
      setErrorLoading(null);
      try {
        const response = await oscService.getMyOSCs();
        const data = response.data || [];

        // LOG DE DEPURAÇÃO: Veja isso no Console do Navegador (F12)
        console.log("📡 Dados recebidos da API OSCs:", data);

        // ORDENAÇÃO SEGURA: Garante que não quebra se 'name' for nulo
        const sortedData = data.sort((a, b) => {
            const nameA = a.name || '';
            const nameB = b.name || '';
            return nameA.localeCompare(nameB);
        });

        setOscs(sortedData);
      } catch (err) {
        console.error("❌ Erro no fetchOSCs:", err);
        const errorMsg = err.response?.data?.message || "Não foi possível carregar a lista de OSCs.";
        // Não apagamos a lista se já tiver algo, apenas mostramos o erro
        addNotification("Erro ao carregar OSCs.", "error");
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchOSCs();
  }, [addNotification]);

  const handleView = (osc) => setOscToView(osc);
  const handleEdit = (osc) => setOscToEdit(osc);
  const handleSendAlert = (osc) => setOscToSendAlert(osc);

  const handleCloseModals = () => {
    setOscToView(null);
    setOscToEdit(null);
    setOscToSendAlert(null);
  };

  const handleSaveEdit = async (formData) => {
    try {
      const updatedOSCResponse = await updateOSC(formData.id, formData);
      const updatedOSC = updatedOSCResponse;
      
      // Atualiza a lista localmente para não precisar recarregar tudo
      setOscs((prevOscs) =>
        prevOscs.map((o) => (o.id === updatedOSC.id ? { ...o, ...updatedOSC } : o))
      );
      addNotification('OSC salva com sucesso!', 'success');
      handleCloseModals();
    } catch (err) {
      console.error('Falha ao salvar OSC:', err);
      addNotification('Erro ao salvar as alterações.', 'error');
    }
  };

  const handleSendAlertSubmit = async (formData) => {
    try {
      await sendAlert(formData);
      addNotification('Alerta enviado com sucesso!', 'success');
      handleCloseModals();
    } catch (err) {
      console.error('Falha ao enviar alerta:', err);
      addNotification('Erro ao enviar alerta.', 'error');
    }
  };

  if (isLoadingData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 100px)' }}>
         <Spinner text="Carregando OSCs..." />
      </div>
     );
  }

  // Se der erro crítico, mostra mensagem, senão mostra a lista (mesmo vazia)
  if (errorLoading && oscs.length === 0) {
      return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{errorLoading}</div>;
  }

  return (
    <>
      <OSCListView
        oscs={oscs}
        onView={handleView}
        onEdit={handleEdit}
        onSendAlert={handleSendAlert}
      />

      {oscToView && (
        <ViewOSCModal isOpen={!!oscToView} onClose={handleCloseModals} osc={oscToView} />
      )}
      
      {oscToEdit && (
        <EditOSCModal
          isOpen={!!oscToEdit} onClose={handleCloseModals}
          oscData={oscToEdit} onSave={handleSaveEdit} isLoading={isUpdating}
        />
      )}
      
      {oscToSendAlert && (
        <SendAlertModal
          isOpen={!!oscToSendAlert} onClose={handleCloseModals}
          osc={oscToSendAlert} onSend={handleSendAlertSubmit} isLoading={isSendingAlert}
        />
      )}
    </>
  );
}