// src/pages/osc/OSCDashboard.jsx

import React, { useState, useEffect } from 'react'; // Importa hooks
// Hooks
import { useAuth } from '../../hooks/useAuth.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
// Serviços API
import * as templateService from '../../services/templateService.js';
// Componentes
import UsefulDownloads from './components/UsefulDownloads.jsx';
import Spinner from '../../components/common/Spinner.jsx'; // Para loading
import { ExcelIcon, FileIcon } from '../../components/common/Icons.jsx'; // Ícones
// Estilos
import styles from './OSCDashboard.module.css';

/**
 * Página principal (Início/Dashboard) da OSC (Conectada à API de Templates).
 */
export default function OSCDashboard() {
  const { user } = useAuth();
  const addNotification = useNotification();

  // --- Estados ---
  const [templates, setTemplates] = useState([]); // Armazena a lista de modelos da API
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Efeito para Buscar os Modelos (Downloads Úteis) ---
  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await templateService.getAllTemplates(); // Chama a API
        setTemplates(response.data || []); // Guarda a lista no estado
      } catch (err) {
        console.error("Erro ao buscar modelos (downloads):", err);
        setError("Não foi possível carregar os downloads úteis.");
        addNotification("Erro ao carregar downloads.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, [addNotification]); // addNotification é estável, roda 1 vez

  // --- Handler para o Download (agora dinâmico) ---
  const handleDownloadTemplate = async (template) => {
    addNotification(`A iniciar download de: ${template.file_name}`, 'info');
    try {
      // Chama o serviço de download com o ID e o nome real do ficheiro (guardado em 'description')
      await templateService.downloadTemplate(template.id, template.description);
    } catch (err) {
      console.error("Erro no download do modelo:", err);
      addNotification(err.message || 'Falha no download.', 'error');
    }
  };

  // Helper para escolher o ícone (opcional, mas melhora a UI)
  const getIconForFile = (fileName) => {
    if (fileName?.endsWith('.xlsx') || fileName?.endsWith('.xls')) {
      return ExcelIcon;
    }
    // (Adicionar .pdf, .docx, etc. se quiser)
    return FileIcon; // Padrão
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        {/* ... (Logo Placeholder, Título de Boas-vindas, Subtítulo) ... */}
        <div className={styles.logoPlaceholder}>
          <span>Logo do Escritório</span>
        </div>
        <h2 className={styles.title}>
          Bem-vindo(a) ao Portal do Cliente, {user?.name || 'Utilizador'}!
        </h2>
        <p className={styles.subtitle}>
          Este é o seu canal direto com a nossa equipa de contabilidade. Use os separadores acima para enviar documentos e trocar mensagens.
        </p>
        

        {/* --- Seção de Downloads Úteis (Dinâmica) --- */}
        <div className={styles.downloadsSection}>
          <h3 className={styles.downloadsTitle}>
            Downloads Úteis
          </h3>
          <div className={styles.downloadsContainer}>
            {isLoading ? (
              <Spinner text="Carregando downloads..." />
            ) : error ? (
              <p style={{ color: 'red' }}>{error}</p>
            ) : templates.length > 0 ? (
              // Mapeia a lista de templates vinda da API
              templates.map((template) => (
                <UsefulDownloads
                  key={template.id}
                  title={template.file_name} // Nome de exibição
                  fileName={template.description} // Nome real do ficheiro
                  IconComponent={getIconForFile(template.description)} // Ícone dinâmico
                  onDownload={() => handleDownloadTemplate(template)} // Passa o objeto
                />
              ))
            ) : (
              <p style={{ color: '#6b7280' }}>Nenhum modelo disponível no momento.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}