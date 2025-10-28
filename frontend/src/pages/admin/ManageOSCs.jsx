// src/pages/admin/ManageOSCs.jsx

import React, { useState, useMemo, useEffect } from 'react'; // Importa useEffect
// REMOVE import { mockOSCs, mockUsers } from '../../utils/mockData.js';
import * as oscService from '../../services/oscService.js'; // Importa serviço real
import { ROLES } from '../../utils/constants.js';
import { ViewIcon, EditIcon, UsersIcon, SearchIcon } from '../../components/common/Icons.jsx';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx'; // Para feedback
import styles from './ManageOSCs.module.css';
// (Modais de Associar/Ver virão a seguir)
// import AssignContadorModal from './components/AssignContadorModal.jsx';

/**
 * Página de Gerenciamento de OSCs do Admin (Conectada à API).
 */
export default function ManageOSCs() {
  // --- Estados ---
  const [oscs, setOscs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterName, setFilterName] = useState('');
  const [filterContador, setFilterContador] = useState('');
  const addNotification = useNotification();
  // (Estados para modais virão a seguir)
  // const [oscToAssign, setOscToAssign] = useState(null);

  // --- Efeito para Buscar Dados ---
  useEffect(() => {
    const fetchAllOSCs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await oscService.getAllOSCs();
        // A API (via osc.model.js) já deve retornar os dados com 'contadorName'
        // Ordena por nome
        setOscs((response.data || []).sort((a, b) => a.name.localeCompare(b.name)));
      } catch (err) {
        console.error("Erro ao buscar todas as OSCs:", err);
        const errorMsg = err.response?.data?.message || "Não foi possível carregar as OSCs.";
        setError(errorMsg);
        addNotification("Erro ao carregar OSCs.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllOSCs();
  }, [addNotification]);

  // --- Filtros (usa useMemo) ---
  const filteredOSCs = useMemo(() => {
      return oscs.filter(
        (osc) =>
          (osc.name || '').toLowerCase().includes(filterName.toLowerCase()) &&
          (osc.contadorName || 'Nenhum').toLowerCase().includes(filterContador.toLowerCase())
      );
  }, [oscs, filterName, filterContador]);


  // Handlers (placeholders por enquanto)
  const handleView = (osc) => alert(`(Admin) Visualizando: ${osc.name}`);
  const handleAssign = (osc) => alert(`(Admin) Abrindo modal para associar/trocar contador para: ${osc.name}`);
  const handleOpenAssignModal = () => alert('(Admin) Abrindo modal geral para associar OSC a Contador...');

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Gerenciamento de OSCs</h2>
        <Button variant="primary" onClick={handleOpenAssignModal} className={styles.assignButton}>
          <UsersIcon />
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
        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <Spinner text="Carregando OSCs..." />
          </div>
        ) : error ? (
           <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
            {error}
          </div>
        ) : (
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
        )}
      </div>
      
      {/* (Modal de Associar OSC virá aqui) */}

    </div>
  );
}