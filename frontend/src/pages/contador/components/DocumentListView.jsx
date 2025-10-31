// src/pages/contador/components/DocumentListView.jsx

import React, { useState } from 'react';
import { ViewIcon, PrintIcon, SearchIcon } from '../../../components/common/Icons.jsx';
import Input from '../../../components/common/Input.jsx';
import styles from './DocumentListView.module.css';
import { formatDate } from '../../../utils/formatDate.js';

/**
 * Componente "burro" DocumentListView (CSS Modules).
 * CORRIGIDO para aviso de whitespace e bugs de filtro/nome.
 */
export default function DocumentListView({ files = [], onView, onPrint }) {
  const [filterOsc, setFilterOsc] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const filteredFiles = files.filter(
    (file) =>
      // Filtro de data: compara a data (YYYY-MM-DD)
      (!filterDate || (file.date || file.created_at).startsWith(filterDate)) &&
      // Filtro de nome da OSC: usa 'from_name' ou 'from'
      (!filterOsc ||
        (file.from_name || file.from || '').toLowerCase().includes(filterOsc.toLowerCase()))
  );

  return (
    <div className={styles.pageContainer}>
      <h2 className={styles.title}>
        Documentos Recebidos
      </h2>

      {/* Filtros */}
      <div className={styles.filtersContainer}>
        <div className={styles.filtersGrid}>
          <Input
            icon={SearchIcon}
            placeholder="Filtrar por nome da OSC..."
            value={filterOsc}
            onChange={(e) => setFilterOsc(e.target.value)}
          />
          <Input
            type="date"
            placeholder="Filtrar por data..."
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            inputClassName={styles.dateInput}
          />
        </div>
      </div>

      {/* Tabela */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>OSC Origem</th>
              <th>Nome do Arquivo</th>
              <th>Data de Envio</th>
              <th>Ações</th>
            </tr>
          </thead>
          {/* CORREÇÃO WHITESPACE: Remove espaço entre <tbody> e {map} */}
          <tbody>{
            filteredFiles.length > 0 ? (
              filteredFiles.map((file) => (
                <tr key={file.id}>
                  <td>{file.from_name || file.from}</td>
                  <td className={styles.fileNameCell}>{file.original_name || file.name}</td>
                  <td>{formatDate(file.created_at || file.date)}</td>
                  <td>
                    <div className={styles.actionsContainer}>
                      <button
                        onClick={() => onView(file)}
                        className={`${styles.actionButton} ${styles.viewButton}`}
                        title="Visualizar"
                      ><ViewIcon /></button>
                      <button
                        onClick={() => onPrint(file)}
                        className={`${styles.actionButton} ${styles.printButton}`}
                        title="Baixar Documento"
                      ><PrintIcon /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr className={styles.emptyRow}>
                <td colSpan="4">
                  Nenhum documento encontrado com os filtros aplicados.
                </td>
              </tr>
            )
          }</tbody>
        </table>
      </div>
    </div>
  );
}