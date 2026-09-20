import React, { useState, useMemo, useEffect } from 'react';
import * as oscService from '../../services/oscService.js';
import * as userService from '../../services/userService.js';
import { ROLES } from '../../utils/constants.js';
import Button from '../../components/ui/Button.jsx';
import Card, { CardBody } from '../../components/ui/Card.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import useApi from '../../hooks/useApi.jsx';
import styles from './ManageOSCs.module.css';
import AssignContadorModal from './components/AssignContadorModal.jsx';
import TransferOfficeModal from './components/TransferOfficeModal.jsx';
import { FiUsers, FiSearch, FiEye, FiEdit2, FiRepeat } from 'react-icons/fi';

export default function ManageOSCs() {
  const [oscs, setOscs] = useState([]); 
  const [contadores, setContadores] = useState([]); 
  const [offices, setOffices] = useState([]); 
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const [filterName, setFilterName] = useState('');
  const [filterContador, setFilterContador] = useState('');
  const addNotification = useNotification();
  
  const [oscToAssign, setOscToAssign] = useState(null); 
  const [oscToTransfer, setOscToTransfer] = useState(null);

  const { request: assignContadorRequest, isLoading: isAssigning } = useApi(
      oscService.assignContador, { showErrorNotification: false }
  );

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [oscsResponse, usersResponse, officesResponse] = await Promise.all([
          oscService.getAllOSCs(),
          userService.getAllUsers(),
          oscService.getAllOffices() 
        ]);

        const rawOscs = Array.isArray(oscsResponse) ? oscsResponse : (oscsResponse?.data || []);
        const allUsers = Array.isArray(usersResponse) ? usersResponse : (usersResponse?.data || []);
        const allOffices = Array.isArray(officesResponse) ? officesResponse : (officesResponse?.data || []);

        setOffices(allOffices); 
        
        const contadoresList = allUsers
          .filter(u => u.role === ROLES.CONTADOR && u.status === 'Ativo')
          .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        setContadores(contadoresList);
        
        const formattedOscs = rawOscs.map(osc => {
            const contador = allUsers.find(u => u.name === osc.contadorName);
            return {
                ...osc,
                assigned_contador_id: contador ? contador.id : null
            };
        }).sort((a, b) => (a.name || '').localeCompare(b.name || '')); 
        
        setOscs(formattedOscs);
        
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        setError("Não foi possível carregar os dados.");
        addNotification("Erro ao carregar dados.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [addNotification]);

  const filteredOSCs = useMemo(() => {
      return oscs.filter(
        (osc) =>
          (osc.name || '').toLowerCase().includes(filterName.toLowerCase()) &&
          (osc.contadorName || 'Nenhum').toLowerCase().includes(filterContador.toLowerCase())
      );
  }, [oscs, filterName, filterContador]);

  const handleView = (osc) => alert(`(Admin) Visualizando: ${osc.name}.`);
  const handleAssign = (osc) => setOscToAssign(osc); 
  const handleTransfer = (osc) => setOscToTransfer(osc); 
  
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
          ).sort((a, b) => (a.name || '').localeCompare(b.name || ''))); 

          addNotification(`OSC associada com sucesso!`, 'success');
          handleCloseModals();
      } catch (err) {
          addNotification(`Falha ao associar.`, 'error');
      }
  };

  const [isTransferring, setIsTransferring] = useState(false);
  const handleSaveTransfer = async (oscId, newOfficeId) => {
    setIsTransferring(true);
    try {
      await oscService.transferOSCOffice(oscId, newOfficeId);
      
      const officeName = offices.find(o => o.id === Number(newOfficeId))?.name || 'Desconhecido';
      
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

  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-danger)' }}>{error}</div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Gerenciamento de OSCs</h1>
          <p className={styles.pageSubtitle}>Acompanhe e associe organizações a escritórios contábeis.</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="primary" onClick={handleOpenAssignModal} icon={<FiUsers />}>
            Associar OSC
          </Button>
        </div>
      </div>

      <div className={styles.filtersContainer}>
        <div className={styles.filtersGrid}>
          <div className={styles.searchGroup}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar por Nome da OSC..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.searchGroup}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar por Contador..."
              value={filterContador}
              onChange={(e) => setFilterContador(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>
      </div>

      <Card padding="none">
        <CardBody className={styles.tableBody}>
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <Spinner text="Carregando OSCs..." />
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Nome da OSC</th>
                    <th>CNPJ</th>
                    <th>Escritório Atual</th>
                    <th>Contador Associado</th>
                    <th style={{ textAlign: 'right' }}>Ações</th>
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
                        <td style={{ textAlign: 'right' }}>
                          <div className={styles.actionsContainer}>
                            <button onClick={() => handleView(osc)} className={styles.actionBtn} title="Visualizar">
                              <FiEye size={16} />
                            </button>
                            <button onClick={() => handleAssign(osc)} className={styles.actionBtn} title="Associar / Trocar Contador">
                              <FiEdit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleTransfer(osc)} 
                              className={`${styles.actionBtn} ${styles.actionBtnOrange}`} 
                              title="Transferir para outro Escritório"
                            >
                              <FiRepeat size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                   ) : (
                      <tr>
                        <td colSpan="5" className={styles.emptyState}>Nenhuma OSC encontrada.</td>
                      </tr>
                   )}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
      
      <AssignContadorModal
        isOpen={!!oscToAssign}
        onClose={handleCloseModals}
        onSave={handleSaveAssignment}
        isLoading={isAssigning}
        osc={oscToAssign} 
        contadores={contadores} 
      />

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