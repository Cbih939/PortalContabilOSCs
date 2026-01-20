// src/pages/contador/OSCs.jsx

import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom'; // Link não é mais usado diretamente na lista
import * as oscService from '../../services/oscService.js';
import * as alertService from '../../services/alertService.js';

// Componentes modais (Mantidos)
import ViewOSCModal from './components/ViewOSCModal.jsx';
import EditOSCModal from './components/EditOSCModal.jsx';
import SendAlertModal from './components/SendAlertModal.jsx';

import Spinner from '../../components/common/Spinner.jsx';
import useApi from '../../hooks/useApi.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';

// Ícones para o visual (Instale lucide-react se não tiver: npm install lucide-react)
import { ChevronDown, ChevronUp, Edit, Eye, Bell, FileText } from 'lucide-react';

// --- COMPONENTE LOCAL: Item do Acordeon ---
const OSCAccordionItem = ({ osc, isExpanded, onToggle, onView, onEdit, onSendAlert }) => {
  const months = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];

  const currentMonthIndex = new Date().getMonth(); // 0 = Jan, 11 = Dez

  // Função para determinar o status do mês
  const getMonthStatus = (monthIndex) => {
    // 1. Futuro
    if (monthIndex > currentMonthIndex) return 'future';

    // 2. Mês Atual (Pendente de envio ou verificação)
    // Se quiser que o mês atual seja sempre amarelo até enviar, use esta lógica.
    // Se quiser verificar se já enviou no mês atual, mova para baixo.
    if (monthIndex === currentMonthIndex) {
        // Verifica se já enviou algo neste mês, mesmo sendo o mês corrente
        const hasDocCurrentMonth = osc.documents && osc.documents.some(d => {
            if (!d.createdAt) return false;
            return new Date(d.createdAt).getMonth() === monthIndex;
        });
        if (!hasDocCurrentMonth) return 'pending'; // Aberto para envio
    }

    // 3. Meses Passados (ou atual se já tiver doc)
    const docsInMonth = osc.documents ? osc.documents.filter(d => {
        if (!d.createdAt) return false;
        return new Date(d.createdAt).getMonth() === monthIndex;
    }) : [];

    const hasDoc = docsInMonth.length > 0;
    
    // Verifica se algum documento do mês foi verificado/aprovado
    // (Supondo que exista um campo 'verified' ou 'status' no documento. Ajuste conforme seu backend)
    const isVerified = hasDoc && docsInMonth.some(d => d.verified === true || d.status === 'APPROVED');

    if (isVerified) return 'concluded'; // Situação regular
    if (hasDoc) return 'sent';          // Enviado, aguardando contador
    
    return 'late'; // Em atraso (sem documento)
  };

  // Cores baseadas no status
  const getStatusColor = (status) => {
    switch (status) {
      case 'late': return 'bg-red-100 text-red-700 border-red-200';      // Atraso
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'; // Pendente (Mês atual)
      case 'sent': return 'bg-blue-100 text-blue-700 border-blue-200';    // Enviado
      case 'concluded': return 'bg-green-100 text-green-700 border-green-200'; // Concluso
      default: return 'bg-gray-50 text-gray-400 border-gray-100';         // Futuro
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'late': return 'Atraso';
      case 'pending': return 'Aberto';
      case 'sent': return 'Enviado';
      case 'concluded': return 'OK';
      default: return '-';
    }
  };

  return (
    <div className={`border rounded-lg mb-3 bg-white shadow-sm transition-all ${isExpanded ? 'border-blue-300 ring-1 ring-blue-100' : 'border-gray-200'}`}>
      {/* Cabeçalho do Acordeon (Clicável) */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 rounded-lg"
        onClick={() => onToggle(osc.id)}
      >
        <div className="flex flex-col">
          <span className="font-bold text-gray-800 flex items-center gap-2 text-lg">
            {osc.name}
            {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
          </span>
          <span className="text-sm text-gray-500 font-mono mt-1">CNPJ: {osc.cnpj || 'Não informado'}</span>
        </div>

        {/* Ações Rápidas (stopPropagation para não abrir/fechar o acordeon ao clicar nos botões) */}
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => onView(osc)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Ver Detalhes">
            <Eye size={18} />
          </button>
          <button onClick={() => onEdit(osc)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-full transition-colors" title="Editar">
            <Edit size={18} />
          </button>
          <button onClick={() => onSendAlert(osc)} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Enviar Alerta">
            <Bell size={18} />
          </button>
        </div>
      </div>

      {/* Corpo do Acordeon */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-lg animate-fadeIn">
          
          {/* Legenda */}
          <div className="flex flex-wrap gap-4 mb-5 text-xs text-gray-600 border-b border-gray-200 pb-3">
            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div> Em Atraso</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div> Pendente (Mês Atual)</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div> Enviado</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div> Concluso</span>
          </div>

          {/* Grid do Calendário */}
          <h4 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Situação Anual ({new Date().getFullYear()})</h4>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
            {months.map((m, idx) => {
              const status = getMonthStatus(idx);
              return (
                <div key={m} className={`flex flex-col items-center justify-center p-2 rounded border ${getStatusColor(status)}`}>
                  <span className="font-bold text-sm">{m}</span>
                  <span className="text-[10px] mt-1 font-medium uppercase">{getStatusLabel(status)}</span>
                </div>
              )
            })}
          </div>

          {/* Lista de Documentações */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                <FileText size={16}/> Documentações Recentes
            </h4>
            {osc.documents && osc.documents.length > 0 ? (
                <div className="bg-white rounded border border-gray-200 divide-y divide-gray-100 max-h-40 overflow-y-auto">
                    {osc.documents.map((doc, i) => (
                        <div key={i} className="flex justify-between items-center p-3 text-sm hover:bg-gray-50">
                            <span className="text-gray-700 font-medium">{doc.title || `Documento sem título`}</span>
                            <span className="text-xs text-gray-500">
                                {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : '-'}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-500 italic p-2 border border-dashed border-gray-300 rounded text-center">
                    Nenhuma documentação registrada para esta OSC.
                </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- PÁGINA PRINCIPAL ---

export default function OSCsPage() {
  const [oscs, setOscs] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errorLoading, setErrorLoading] = useState(null);

  // Estado para controlar qual OSC está expandida (apenas uma por vez ou null)
  const [expandedOscId, setExpandedOscId] = useState(null);

  const [oscToView, setOscToView] = useState(null);
  const [oscToEdit, setOscToEdit] = useState(null);
  const [oscToSendAlert, setOscToSendAlert] = useState(null);

  const addNotification = useNotification();
  const { request: updateOSC, isLoading: isUpdating } = useApi(oscService.updateOSC);
  const { request: sendAlert, isLoading: isSendingAlert } = useApi(alertService.sendAlertToOSC);

  // --- CORREÇÃO (Data Fetching) ---
  useEffect(() => {
    const fetchOSCs = async () => {
      setIsLoadingData(true);
      setErrorLoading(null);
      try {
        const response = await oscService.getMyOSCs();

        console.log("📦 Resposta CRUA do Serviço:", response);

        // LÓGICA HÍBRIDA
        let data = [];
        if (Array.isArray(response)) {
            // Caso 1: Array direto
            console.log("✅ Detectado array direto.");
            data = response;
        } else if (response && Array.isArray(response.data)) {
            // Caso 2: Objeto Axios
            console.log("✅ Detectado objeto Axios (usando .data).");
            data = response.data;
        } else if (response && response.data && Array.isArray(response.data.data)) {
             // Caso 3: Estrutura aninhada
             console.log("✅ Detectado objeto aninhado.");
             data = response.data.data;
        } else {
             console.warn("⚠️ Formato de resposta desconhecido ou vazio:", response);
        }

        console.log(`📊 Processando ${data.length} registros...`);

        const sortedData = data.sort((a, b) => {
            const nameA = a.name || '';
            const nameB = b.name || '';
            return nameA.localeCompare(nameB);
        });

        setOscs(sortedData);
      } catch (err) {
        console.error("❌ Erro no fetchOSCs:", err);
        addNotification("Erro ao carregar OSCs.", "error");
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchOSCs();
  }, [addNotification]);
  // --- FIM DA CORREÇÃO ---

  const handleToggleAccordion = (id) => {
    // Se clicar no que já está aberto, fecha. Se não, abre o novo e fecha o anterior.
    setExpandedOscId(prevId => (prevId === id ? null : id));
  };

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
      const updatedOSC = updatedOSCResponse.data || updatedOSCResponse; 
      
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Painel de Monitoramento OSCs</h1>
      
      {/* Lista de Acordeons */}
      <div className="flex flex-col gap-2">
        {oscs.length === 0 ? (
            <div className="text-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">
                Nenhuma OSC encontrada na base de dados.
            </div>
        ) : (
            oscs.map(osc => (
                <OSCAccordionItem 
                    key={osc.id} 
                    osc={osc} 
                    isExpanded={expandedOscId === osc.id}
                    onToggle={handleToggleAccordion}
                    onView={handleView}
                    onEdit={handleEdit}
                    onSendAlert={handleSendAlert}
                />
            ))
        )}
      </div>

      {/* MODAIS */}
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
    </div>
  );
}