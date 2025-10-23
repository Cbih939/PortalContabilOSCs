// src/pages/osc/components/UsefulDownloads.jsx

import React from 'react';
// Importa os ícones do nosso arquivo centralizado
import { DownloadIcon, ExcelIcon } from '../../../components/common/Icons.jsx';
// import Button from '../../../components/common/Button.jsx'; // Não usamos mais o Button genérico aqui
import styles from './UsefulDownloads.module.css'; // Importa o CSS Module

/**
 * Componente "card" para Downloads Úteis (CSS Modules).
 */
export default function UsefulDownloads({
  title = 'Modelo de Controle Financeiro',
  fileName = 'modelo_financeiro.xlsx',
  IconComponent = ExcelIcon, // Permite passar outro ícone se necessário
  onDownload,
  className = '', // Classe extra para o container (opcional)
}) {
  return (
    <div className={`${styles.card} ${className}`}>
      {/* Info */}
      <div className={styles.infoContainer}>
        <IconComponent className={styles.icon} />
        <div className={styles.textContainer}>
          <p className={styles.title}>{title}</p>
          <p className={styles.fileName}>{fileName}</p>
        </div>
      </div>

      {/* Botão de Download */}
      <button
        onClick={onDownload}
        className={styles.downloadButton}
        aria-label={`Baixar ${title}`}
        title={`Baixar ${title}`} // Tooltip
      >
        <DownloadIcon /> {/* O CSS Module estiliza o SVG interno */}
      </button>
    </div>
  );
}