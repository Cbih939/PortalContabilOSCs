// src/pages/admin/ManageOSCs.jsx

import React, { useState, useMemo } from 'react';
// Mocks e Constantes (ajuste imports conforme necessário)
import { mockOSCs, mockUsers } from '../../utils/mockData.js';
import { ROLES } from '../../utils/constants.js';
// Componentes Comuns
import { ViewIcon, EditIcon, UsersIcon, SearchIcon } from '../../components/common/Icons.jsx';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx'; // Se usar loading
// CSS Module
import styles from './ManageOSCs.module.css';

// Mock extra (manter ou buscar da API)
const mockOSCAssignments = { 3: 2, 4: 2, 5: null };

/**
 * Página de Gerenciamento de OSCs do Admin (CSS Modules).
 */
export default function ManageOSCs() {
  const [filterName, setFilterName] = useState('');
  const [filterContador, setFilterContador] = useState('');
  // const [isLoading, setIsLoading] = useState(true); // Se buscar dados da API

  // Prepara os dados (simulação)
  const oscs = useMemo(() => {
    // setIsLoading(true); // Inicia loading se buscar da API
    // Simulação com setTimeout
    // setTimeout(() => {
        const data = mockOSCs.map((osc) => {
          const contadorId = mockOSCAssignments[osc.id];
          const contador = contadorId ? Object.values(mockUsers).find(u => u.id === contadorId) : null;
          return {
            ...osc,
            contadorName: contador ? contador.name : 'Nenhum',
          };
        });
        // setOscs(data); // Atualiza estado se buscar da API
        // setIsLoading(false); // Finaliza loading
        return data; // Retorna para useMemo
    // }, 500);
  }, []); // Dependência vazia por enquanto

  const filteredOSCs = oscs.filter(
    (osc) =>
      osc.name.toLowerCase().includes(filterName.toLowerCase()) &&
      osc.contadorName.toLowerCase().includes(filterContador.toLowerCase())
  );

  // Handlers (placeholders por enquanto)
  const handleView = (osc) => alert(`(Admin) Visualizando: ${osc.name}`);
  const handleAssign = (osc) => alert(`(Admin) Associando/Trocando contador para: ${osc.name}`);
  const handleOpenAssignModal = () => alert('(Admin) Abrindo modal geral para associar OSC a Contador...');


  // if (isLoading) { /* ... render Spinner ... */ }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Gerenciamento de OSCs</h2>
        <Button variant="primary" onClick={handleOpenAssignModal} className={styles.assignButton}>
          <UsersIcon /> {/* CSS Module pode estilizar */}
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
                  {/* Aplica estilo se não houver contador */}
                  <td className={osc.contadorName === 'Nenhum' ? styles.contadorNameNone : ''}>
                    {osc.contadorName}
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
                    {/* Ações */}
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
                        <EditIcon /> {/* Ícone de edição para 'associar' */}
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
    </div>
  );
}