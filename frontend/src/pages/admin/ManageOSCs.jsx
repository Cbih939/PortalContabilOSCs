import React, { useState, useMemo, useEffect } from 'react';
// Serviços API
import * as oscService from '../../services/oscService.js';
import * as userService from '../../services/userService.js';
// Constantes
import { ROLES } from '../../utils/constants.js';
// Componentes Comuns
import { ViewIcon, EditIcon, UsersIcon, SearchIcon } from '../../components/common/Icons.jsx';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
// Hooks
import { useNotification } from '../../contexts/NotificationContext.jsx';
import useApi from '../../hooks/useApi.jsx';
// Estilos
import styles from './ManageOSCs.module.css';
// Modais
import AssignContadorModal from './components/AssignContadorModal.jsx';
import TransferOfficeModal from './components/TransferOfficeModal.jsx'; // NOVO MODAL

// Ícone de Transferência (Setas)
const TransferIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>
);

export default function ManageOSCs() {
  // --- Estados ---
  const [oscs, setOscs] = useState([]); 
  const [contadores, setContadores] = useState([]); 
  const [offices, setOffices] = useState([]); // NOVO ESTADO PARA ESCRITÓRIOS
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const [filterName, setFilterName] = useState('');
  const [filterContador, setFilterContador] = useState('');
  const addNotification = useNotification();
  
  // --- Estados Modais ---
  const [oscToAssign, setOscToAssign] = useState(null); 
  const [oscToTransfer, setOscToTransfer] = useState(null); // ESTADO DA TRANSFERÊNCIA

  // --- Hooks API ---
  const { request: assignContadorRequest, isLoading: isAssigning } = useApi(
      oscService.assignContador, { showErrorNotification: false }
  );

  // --- Efeito para Buscar Dados ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Agora busca OSCs, Utilizadores E Escritórios em paralelo!
        const [oscsResponse, usersResponse, officesResponse] = await Promise.all([
          oscService.getAllOSCs(),
          userService.getAllUsers(),
          oscService.getAllOffices() // Busca escritórios
        ]);

        const allUsers = usersResponse.data || [];
        setOffices(officesResponse || []); // Guarda escritórios
        
        const contadoresList = allUsers
          .filter(u => u.role === ROLES.CONTADOR && u.status === 'Ativo')
          .sort((a, b) => a.name.localeCompare(b.name));
        setContadores(contadoresList);
        
        const formattedOscs = (oscsResponse.data || []).map(osc => {
            const contador = allUsers.find(u => u.name === osc.contadorName);
            return {
                ...osc,
                assigned_contador_id: contador ? contador.id : null
            };
        }).sort((a, b) => a.name.localeCompare(b.name)); 
        
        setOscs(formattedOscs);
        
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        setError("Não foi possível carregar os dados. Verifique a consola.");
        addNotification("Erro ao carregar dados.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [addNotification]);

  // --- Filtros ---
  const filteredOSCs = useMemo(() => {
      return oscs.filter(
        (osc) =>
          (osc.name || '').toLowerCase().includes(filterName.toLowerCase()) &&
          (osc.contadorName || 'Nenhum').toLowerCase().includes(filterContador.toLowerCase())
      );
  }, [oscs, filterName, filterContador]);


  // --- Handlers ---
  const handleView = (osc) => alert(`(Admin) Visualizando: ${osc.name}.`);
  const handleAssign = (osc) => setOscToAssign(osc); 
  const handleTransfer = (osc) => setOscToTransfer(osc); // Abre o novo modal
  
  const handleCloseModals = () => {
    setOscToAssign(null);
    setOscToTransfer(null);
  };
  
  const handleOpenAssignModal = () => alert('(Admin) Clique no ícone de editar na linha da OSC.');

  const handleSaveAssignment = async (oscId, contadorId) => {
      const finalContadorId = contadorId === "null" ? null : Number(contadorId);
      try {
          const response = await assignContadorRequest(oscId, finalContadorId);
          const updatedOscData = response.osc; 
          const contadorName = contadores.find(c => c.id === finalContadorId)?.name || 'Nenhum';

          setOscs(prev => prev.map(o =>
              o.id === oscId ? { ...o, ...updatedOscData, contadorName: contadorName, assigned_contador_id: finalContadorId } : o
          ).sort((a, b) => a.name.localeCompare(b.name))); 

          addNotification(`OSC associada com sucesso!`, 'success');
          handleCloseModals();
      } catch (err) {
          addNotification(`Falha ao associar.`, 'error');
      }
  };

  // NOVO: Função para salvar a transferência de escritório
  const [isTransferring, setIsTransferring] = useState(false);
  const handleSaveTransfer = async (oscId, newOfficeId) => {
    setIsTransferring(true);
    try {
      await oscService.transferOSCOffice(oscId, newOfficeId);
      
      const officeName = offices.find(o => o.id === Number(newOfficeId))?.name || 'Desconhecido';
      
      // Atualiza a lista removendo o contador e mudando o officeName (se tiver)
      setOscs(prev => prev.map(o => 
        o.id === oscId ? { ...o, office_id: newOfficeId, officeName: officeName, contadorName: 'Nenhum', assigned_contador_id: null } : o
      ));

      addNotification(`OSC transferida com sucesso para o escritório ${officeName}!`, 'success');
      handleCloseModals();
    } catch (err) {
      console.error(err);
      addNotification("Erro ao transferir OSC. Tente novamente.", "error");
    } finally {
      setIsTransferring(false);
    }
  };

  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}><Spinner text="Carregando dados..." /></div>;
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error}</div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Gerenciamento de OSCs</h2>
        <Button variant="primary" onClick={handleOpenAssignModal} className={styles.assignButton}>
          <UsersIcon className="w-5 h-5 mr-2" />
          Associar OSC a um Contador
        </Button>
      </div>

      <div className={styles.filtersContainer}>
        <div className={styles.filtersGrid}>
          <Input icon={SearchIcon} placeholder="Buscar por Nome..." value={filterName} onChange={(e) => setFilterName(e.target.value)} />
          <Input icon={SearchIcon} placeholder="Buscar por Contador..." value={filterContador} onChange={(e) => setFilterContador(e.target.value)} />
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nome da OSC</th>
              <th>CNPJ</th>
              <th>Escritório Atual</th>
              <th>Contador Associado</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredOSCs.length > 0 ? (
              filteredOSCs.map((osc) => (
                <tr key={osc.id}>
                  <td>{osc.name}</td>
                  <td>{osc.cnpj}</td>
                  <td><strong>{osc.officeName || 'Sem Escritório'}</strong></td>
                  <td className={!osc.contadorName || osc.contadorName === 'Nenhum' ? styles.contadorNameNone : ''}>
                    {osc.contadorName || 'Nenhum'}
                  </td>
                  <td>
                    <div className={styles.actionsContainer} style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleView(osc)} className={`${styles.actionButton} ${styles.viewButton}`} title="Visualizar">
                        <ViewIcon />
                      </button>
                      
                      <button onClick={() => handleAssign(osc)} className={`${styles.actionButton} ${styles.assignButtonAction}`} title="Associar / Trocar Contador">
                        <EditIcon />
                      </button>
                      
                      {/* NOVO BOTÃO DE TRANSFERÊNCIA */}
                      <button 
                        onClick={() => handleTransfer(osc)} 
                        className={styles.actionButton} 
                        style={{ color: '#ea580c', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '4px', padding: '4px' }}
                        title="Transferir para outro Escritório"
                      >
                        <TransferIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
             ) : (
                <tr className={styles.emptyRow}>
                  <td colSpan="5">Nenhuma OSC encontrada.</td>
                </tr>
             )}
          </tbody>
        </table>
      </div>
      
      <AssignContadorModal
        isOpen={!!oscToAssign}
        onClose={handleCloseModals}
        onSave={handleSaveAssignment}
        isLoading={isAssigning}
        osc={oscToAssign} 
        contadores={contadores} 
      />

      {/* NOVO MODAL DE TRANSFERÊNCIA RENDEREIZADO AQUI */}
      <TransferOfficeModal
        isOpen={!!oscToTransfer}
        onClose={handleCloseModals}
        onSave={handleSaveTransfer}
        isLoading={isTransferring}
        osc={oscToTransfer}
        offices={offices}
      />

    </div>
  );
}