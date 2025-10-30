// src/pages/admin/ManageOSCs.jsx

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
// import ViewOSCModal from '../../contador/components/ViewOSCModal.jsx'; // (Pode reutilizar o modal do contador)

/**
 * Página de Gerenciamento de OSCs do Admin (Conectada à API).
 */
export default function ManageOSCs() {
  // --- Estados ---
  const [oscs, setOscs] = useState([]); // Lista de OSCs
  const [contadores, setContadores] = useState([]); // Lista de Contadores para o modal
  const [isLoading, setIsLoading] = useState(true); // Loading inicial da página
  const [error, setError] = useState(null); // Erro de busca
  const [filterName, setFilterName] = useState('');
  const [filterContador, setFilterContador] = useState('');
  const addNotification = useNotification();
  
  // --- Estados Modais ---
  const [oscToAssign, setOscToAssign] = useState(null); // Controla modal de associação
  // const [oscToView, setOscToView] = useState(null); // (Para modal de View futuro)

  // --- Hooks API ---
  const { request: assignContadorRequest, isLoading: isAssigning } = useApi(
      oscService.assignContador, { showErrorNotification: false } // Desabilita notif padrão
  );

  // --- Efeito para Buscar Dados (OSCs e Contadores) ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Busca OSCs e Utilizadores em paralelo
        const [oscsResponse, usersResponse] = await Promise.all([
          oscService.getAllOSCs(),
          userService.getAllUsers()
        ]);

        const allUsers = usersResponse.data || [];
        
        // Filtra apenas os contadores para o dropdown do modal
        const contadoresList = allUsers
          .filter(u => u.role === ROLES.CONTADOR && u.status === 'Ativo')
          .sort((a, b) => a.name.localeCompare(b.name));
        setContadores(contadoresList);
        
        // Formata OSCs (adiciona 'assigned_contador_id' se não vier da query principal)
        // A nossa query findAllWithContador já inclui 'contadorName' e 'status'
        const formattedOscs = (oscsResponse.data || []).map(osc => {
            const contador = allUsers.find(u => u.name === osc.contadorName);
            return {
                ...osc,
                // Garante que temos o ID do contador para o modal
                assigned_contador_id: contador ? contador.id : null
            };
        }).sort((a, b) => a.name.localeCompare(b.name)); // Ordena
        
        setOscs(formattedOscs);
        
      } catch (err) {
        console.error("Erro ao buscar dados (OSCs/Contadores):", err);
        const errorMsg = err.response?.data?.message || "Não foi possível carregar os dados.";
        setError(errorMsg);
        addNotification("Erro ao carregar dados.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [addNotification]); // addNotification é estável

  // --- Filtros (usa useMemo) ---
  const filteredOSCs = useMemo(() => {
      return oscs.filter(
        (osc) =>
          (osc.name || '').toLowerCase().includes(filterName.toLowerCase()) &&
          (osc.contadorName || 'Nenhum').toLowerCase().includes(filterContador.toLowerCase())
      );
  }, [oscs, filterName, filterContador]);


  // --- Handlers Modais ---
  const handleView = (osc) => alert(`(Admin) Visualizando: ${osc.name}. (Implementar ViewOSCModal)`);
  const handleAssign = (osc) => setOscToAssign(osc); // Abre modal de associação
  const handleCloseModals = () => setOscToAssign(null);
  
  // Placeholder para o botão principal (poderia abrir um modal diferente)
  const handleOpenAssignModal = () => alert('(Admin) Modal geral ainda não implementado. Clique no ícone de editar na linha da OSC.');

  // Handler para Salvar Associação
  const handleSaveAssignment = async (oscId, contadorId) => {
      // Converte "null" (string do select) para null (JS)
      const finalContadorId = contadorId === "null" ? null : Number(contadorId);
      
      try {
          // Chama API (PATCH /api/oscs/:id/assign)
          const response = await assignContadorRequest(oscId, finalContadorId);
          const updatedOscData = response.osc; // API retorna { message, osc }
          
          // Busca o nome do contador (ou "Nenhum")
          const contadorName = contadores.find(c => c.id === finalContadorId)?.name || 'Nenhum';

          // Atualiza a lista local
          setOscs(prev => prev.map(o =>
              o.id === oscId
                ? { ...o, ...updatedOscData, contadorName: contadorName, assigned_contador_id: finalContadorId } // Atualiza a linha
                : o
          ).sort((a, b) => a.name.localeCompare(b.name))); // Reordena

          addNotification(`OSC "${updatedOscData.name || oscId}" associada a "${contadorName}" com sucesso!`, 'success');
          handleCloseModals();
      } catch (err) {
          console.error('Falha ao associar contador:', err);
          addNotification(`Falha ao associar: ${err.response?.data?.message || err.message}`, 'error');
      }
  };

  // --- Renderização ---
  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
          <Spinner text="Carregando OSCs e Contadores..." />
      </div>
    );
  }
  if (error) {
     return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error}</div>;
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Gerenciamento de OSCs</h2>
        <Button variant="primary" onClick={handleOpenAssignModal} className={styles.assignButton}>
          <UsersIcon className="w-5 h-5 mr-2" /> {/* Ajuste CSS se 'mr-2' não funcionar */}
          Associar OSC a um Contador
        </Button>
      </div>

      {/* Filtros */}
      <div className={styles.filtersContainer}>
        <div className={styles.filtersGrid}>
          <Input
            icon={SearchIcon}
            placeholder="Buscar por Nome da OSC..."
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
          />
          <Input
            icon={SearchIcon}
            placeholder="Buscar por Contador..."
            value={filterContador}
            onChange={(e) => setFilterContador(e.target.value)}
          />
        </div>
      </div>

      {/* Tabela */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nome da OSC</th>
              <th>CNPJ</th>
              <th>Contador Associado</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredOSCs.length > 0 ? (
              filteredOSCs.map((osc) => (
                <tr key={osc.id}>
                  <td>{osc.name}</td>
                  <td>{osc.cnpj}</td>
                  <td className={!osc.contadorName || osc.contadorName === 'Nenhum' ? styles.contadorNameNone : ''}>
                    {osc.contadorName || 'Nenhum'}
                  </td>
                  <td>
                    {/* Badge de Status */}
                    <span className={`
                      ${styles.statusBadge}
                      ${osc.status === 'Ativo' ? styles.statusBadgeActive : styles.statusBadgeInactive}
                    `}>
                      <span></span>
                      <span className={styles.statusText}>{osc.status}</span>
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionsContainer}>
                      <button
                        onClick={() => handleView(osc)}
                        className={`${styles.actionButton} ${styles.viewButton}`}
                        title="Visualizar Detalhes"
                      >
                        <ViewIcon />
                      </button>
                      <button
                        onClick={() => handleAssign(osc)}
                        className={`${styles.actionButton} ${styles.assignButtonAction}`}
                        title="Associar / Trocar Contador"
                      >
                        <EditIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
             ) : (
                <tr className={styles.emptyRow}>
                  <td colSpan="5">Nenhuma OSC encontrada com os filtros aplicados.</td>
                </tr>
             )}
          </tbody>
        </table>
      </div>
      
      {/* --- Modal de Associação --- */}
      <AssignContadorModal
        isOpen={!!oscToAssign}
        onClose={handleCloseModals}
        onSave={handleSaveAssignment}
        isLoading={isAssigning}
        osc={oscToAssign} // Passa a OSC selecionada
        contadores={contadores} // Passa a lista de contadores
      />

      {/* (Adicionar ViewOSCModal se desejar) */}

    </div>
  );
}