// src/pages/contador/components/OSCListView.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // <-- IMPORT LINK
import {
  ViewIcon,
  EditIcon,
  AlertTriangleIcon,
  SearchIcon,
  BuildingIcon,
} from '../../../components/common/Icons.jsx';
import Input from '../../../components/common/Input.jsx';
import Button from '../../../components/common/Button.jsx';
import styles from './OSCListView.module.css';
import { formatDate } from '../../../utils/formatDate.js'; // (Embora não usado aqui, é útil para datas)

/**
 * Componente "burro" OSCListView (CSS Modules).
 */
export default function OSCListView({
  oscs = [],
  onView,
  onEdit,
  onSendAlert,
  // onCreate não é mais necessário como função
}) {
  const [filterName, setFilterName] = useState('');
  const [filterCnpj, setFilterCnpj] = useState('');
  const [filterResponsible, setFilterResponsible] = useState('');

  const filteredOSCs = oscs.filter(
    (osc) =>
      (osc.name || '').toLowerCase().includes(filterName.toLowerCase()) &&
      (osc.cnpj || '').replace(/[^\d]/g, '').includes(filterCnpj.replace(/[^\d]/g, '')) &&
      (osc.responsible || '').toLowerCase().includes(filterResponsible.toLowerCase())
  );

  return (
    <div className={styles.pageContainer}>
      {/* Cabeçalho */}
      <div className={styles.header}>
        <h2 className={styles.title}>
          Organizações Cadastradas
        </h2>
        {/* --- BOTÃO MODIFICADO PARA LINK --- */}
        <Button
          as={Link} // Usa 'as={Link}' do Button.jsx
          to="/contador/oscs/novo" // Aponta para a nova rota
          variant="primary"
          className={styles.createButton}
        >
          <BuildingIcon className="w-5 h-5 mr-2" />
          Cadastrar Nova OSC
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
            placeholder="Buscar por CNPJ..."
            value={filterCnpj}
            onChange={(e) => setFilterCnpj(e.target.value)}
          />
          <Input
            icon={SearchIcon}
            placeholder="Buscar por Responsável..."
            value={filterResponsible}
            onChange={(e) => setFilterResponsible(e.target.value)}
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
              <th>Responsável</th>
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
                  <td>{osc.responsible}</td>
                  <td>
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
                      <button onClick={() => onView(osc)} className={`${styles.actionButton} ${styles.viewButton}`} title="Visualizar">
                        <ViewIcon />
                      </button>
                      <button onClick={() => onEdit(osc)} className={`${styles.actionButton} ${styles.editButton}`} title="Editar">
                        <EditIcon />
                      </button>
                      <button onClick={() => onSendAlert(osc)} className={`${styles.actionButton} ${styles.alertButton}`} title="Enviar Alerta">
                        <AlertTriangleIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr className={styles.emptyRow}>
                <td colSpan="5">
                  Nenhuma OSC encontrada com os filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}