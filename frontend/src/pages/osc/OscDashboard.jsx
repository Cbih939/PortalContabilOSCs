// src/pages/osc/OSCDashboard.jsx

import React from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import UsefulDownloads from './components/UsefulDownloads.jsx'; // Importa o componente refatorado
import styles from './OSCDashboard.module.css'; // Importa o CSS Module da página

/**
 * Página principal (Início/Dashboard) da OSC (CSS Modules).
 */
export default function OSCDashboard() {
  const { user } = useAuth();

  const handleDownloadBaseFile = () => {
    alert("Simulando download do arquivo 'modelo_financeiro.xlsx'.");
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>

        <div className={styles.logoPlaceholder}>
          <span>Logo do Escritório</span>
        </div>

        <h2 className={styles.title}>
          Bem-vindo(a) ao Portal do Cliente, {user?.name || 'Utilizador'}!
        </h2>
        <p className={styles.subtitle}>
          Este é o seu canal direto com a nossa equipa de contabilidade. Use os separadores acima para enviar documentos e trocar mensagens.
        </p>

        {/* Seção de Downloads */}
        <div className={styles.downloadsSection}>
          <h3 className={styles.downloadsTitle}>
            Downloads Úteis
          </h3>
          <div className={styles.downloadsContainer}>
            {/* Renderiza o componente refatorado */}
            <UsefulDownloads onDownload={handleDownloadBaseFile} />
          </div>
        </div>
      </div>
    </div>
  );
}