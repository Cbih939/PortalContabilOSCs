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
import { formatDate } from '../../../utils/formatDate.js'; 

/**
 * Componente "burro" OSCListView (CSS Modules).
 */
export default function OSCListView({
  oscs = [],
  onView,
  onEdit,
  onSendAlert,
}) {
  const [filterName, setFilterName] = useState('');
  const [filterCnpj, setFilterCnpj] = useState('');
  const [filterResponsible, setFilterResponsible] = useState('');
  
  // NOVO: Estado para o filtro de pendências
  const [filterPendentes, setFilterPendentes] = useState(false);

  // Lógica de filtragem combinada
  const filteredOSCs = oscs.filter((osc) => {
    // 1. Filtros de texto (Nome, CNPJ, Responsável)
    const matchesSearch = 
      (osc.name || '').toLowerCase().includes(filterName.toLowerCase()) &&
      (osc.cnpj || '').replace(/[^\d]/g, '').includes(filterCnpj.replace(/[^\d]/g, '')) &&
      (osc.responsible || '').toLowerCase().includes(filterResponsible.toLowerCase());

    // 2. Filtro de Pendências
    if (filterPendentes) {
      const mesAtual = new Date().getMonth() + 1;
      const anoAtual = new Date().getFullYear();
      
      // Verifica se a OSC possui algum documento enviado neste mês/ano
      const temDocMes = osc.documents?.some(
        doc => doc.ref_month === mesAtual && doc.ref_year === anoAtual
      );
      
      // Retorna a OSC apenas se bater com a busca de texto E NÃO tiver documento no mês
      return matchesSearch && !temDocMes;
    }

    return matchesSearch;
  });

  return (
    <div className={styles.pageContainer}>
      {/* Cabeçalho */}
      <div className={styles.header}>
        <h2 className={styles.title}>
          Organizações Cadastradas
        </h2>
        {/* --- BOTÃO MODIFICADO PARA LINK --- */}
        <Button
          as={Link} 
          to="/contador/oscs/novo" 
          variant="primary"
          className={styles.createButton}
        >
          <BuildingIcon className="w-5 h-5 mr-2" />
          Cadastrar Nova OSC
        </Button>
      </div>

      {/* Filtros */}
      <div className={styles.filtersContainer}>
        <div className={styles.filtersGrid} style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <Input
              icon={SearchIcon}
              placeholder="Buscar por Nome..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
            />
          </div>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <Input
              icon={SearchIcon}
              placeholder="Buscar por CNPJ..."
              value={filterCnpj}
              onChange={(e) => setFilterCnpj(e.target.value)}
            />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <Input
              icon={SearchIcon}
              placeholder="Buscar por Responsável..."
              value={filterResponsible}
              onChange={(e) => setFilterResponsible(e.target.value)}
            />
          </div>
          
          {/* NOVO BOTÃO DE PENDÊNCIAS */}
          <div>
            <button 
              onClick={() => setFilterPendentes(!filterPendentes)}
              style={{ 
                backgroundColor: filterPendentes ? '#f59e0b' : '#f8fafc', 
                color: filterPendentes ? 'white' : '#64748b',
                border: '1px solid #cbd5e1',
                padding: '0 15px', 
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                height: '42px', // Altura alinhada com os Inputs
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s'
              }}
              title="Filtrar OSCs sem documentos enviados este mês"
            >
              {filterPendentes ? "✖ Exibir Todas" : "🔍 Pendentes de Análise"}
            </button>
          </div>
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
                      <span className={styles.statusText}>{osc.status || 'Ativo'}</span>
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
                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                  {filterPendentes 
                    ? "Nenhuma OSC com documentação pendente para este mês! 🎉" 
                    : "Nenhuma OSC encontrada com os filtros aplicados."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}