// src/pages/osc/components/OSCHeader.jsx

import React, { useState, useEffect } from 'react';
// Layout e Componentes Comuns
import Header from '../../../components/layout/Header.jsx';
import { AlertTriangleIcon } from '../../../components/common/Icons.jsx';
import Button from '../../../components/common/Button.jsx';
import Spinner from '../../../components/common/Spinner.jsx'; // Importa Spinner
// Hooks e Serviços
import { useAuth } from '../../../hooks/useAuth.jsx';
import useApi from '../../../hooks/useApi.jsx';
import { useNotification } from '../../../contexts/NotificationContext.jsx';
import * as alertService from '../../../services/alertService.js';
// Componentes Específicos
import AlertsModal from './AlertsModal.jsx';
// Estilos e Constantes
import styles from './OSCHeader.module.css';
import { ROLES } from '../../../utils/constants.js'; // Importa ROLES

/**
 * Componente Header específico para o painel da OSC.
 * Inclui título, botão de alertas (funcional) e botão de logout.
 */
export default function OSCHeader() {
  const { user, logout } = useAuth();
  const addNotification = useNotification();

  // --- Estados para Alertas ---
  const [alerts, setAlerts] = useState([]);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false); // Loading inicial

  // Hook para a API de 'marcar como lido'
  const { request: markAsReadRequest, isLoading: isMarkingRead } = useApi(alertService.markAlertAsRead);

  // --- Efeito para buscar Alertas ---
  useEffect(() => {
    const fetchAlerts = async () => {
      // Não busca se não estiver logado ou não for OSC
      if (!user?.id || user?.role !== ROLES.OSC) {
          setAlerts([]); // Garante que a lista está vazia se não for para buscar
          return;
      };

      setIsLoadingAlerts(true);
      try {
        const response = await alertService.getAlerts();
        setAlerts(response.data || []); // Garante que é um array
      } catch (error) {
        console.error("Erro ao buscar alertas:", error);
        addNotification("Não foi possível buscar os avisos.", "error");
        setAlerts([]); // Define como vazio em caso de erro
      } finally {
        setIsLoadingAlerts(false);
      }
    };

    fetchAlerts();
    // Poderia adicionar um intervalo aqui para re-buscar periodicamente
  }, [user?.id, user?.role, addNotification]); // Dependências corretas

  // --- Handlers ---
  const handleLogout = () => logout();

  const handleOpenAlertModal = () => setIsAlertModalOpen(true);
  const handleCloseAlertModal = () => setIsAlertModalOpen(false);

  /** Chamado pelo AlertsModal ao clicar 'Marcar como lido' */
  const handleMarkAsRead = async (alertId) => {
    try {
      await markAsReadRequest(alertId); // Chama API via useApi
      // Sucesso! Atualiza o estado local
      setAlerts(prevAlerts =>
        prevAlerts.map(alert =>
          alert.id === alertId ? { ...alert, read: true } : alert
        )
      );
      // addNotification("Aviso marcado como lido.", "success"); // Opcional, pode ser redundante
    } catch (err) {
      console.error("Falha ao marcar como lido:", err);
      addNotification("Falha ao marcar aviso como lido.", "error"); // Feedback de erro
      // useApi já mostra notificação da API também
    }
  };

  // Calcula contagem de não lidos a partir do estado 'alerts'
  const unreadAlertsCount = alerts.filter(a => !a.read).length;

  // --- Renderização ---
  const leftContent = (
    <h1 className={styles.leftTitle}>Portal da OSC</h1> // Usa classe CSS Module
  );

  const rightContent = ( // Garanta que não há caracteres estranhos aqui
    <div className={styles.rightContentContainer}>
      {/* Botão de Alertas */}
      <button
        onClick={handleOpenAlertModal}
        className={styles.alertButton}
        title="Ver Avisos"
        disabled={isLoadingAlerts} // Desabilita enquanto carrega
      >
        <AlertTriangleIcon className={styles.alertIcon} />
        {/* Badge */}
        {!isLoadingAlerts && unreadAlertsCount > 0 && (
          <span className={styles.alertBadge}>
            {unreadAlertsCount}
          </span>
        )}
      </button>

      {/* WelcomeText */}
      <span className={styles.welcomeText}>
        Bem-vindo(a), {user?.name || 'Utilizador'}
      </span>

      {/* Logout Button */}
      <Button
        variant="danger"
        size="sm"
        onClick={handleLogout}
        className={styles.logoutButton} // Classe opcional para ajustes
      >
        Sair
      </Button>
    </div>
  ); // Fim do rightContent

  return (
    <>
      {/* Renderiza o Header base com o conteúdo definido */}
      <Header leftContent={leftContent} rightContent={rightContent} />

      {/* Renderiza o Modal de Alertas (controlado por este componente) */}
      <AlertsModal
        isOpen={isAlertModalOpen}
        onClose={handleCloseAlertModal}
        alerts={alerts}
        onMarkAsRead={handleMarkAsRead}
        isLoading={isMarkingRead} // Passa o loading da ação de marcar
      />
    </>
  );
}
