import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth.jsx';
import * as alertService from '../../../services/alertService.js';
import AlertsModal from './AlertsModal.jsx';
import styles from './OSCHeader.module.css';

// --- Ícones SVG Inline (Para garantir o visual exato) ---
const MenuIcon = () => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const BellIcon = () => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

/**
 * Header da OSC
 * - Inclui botão Hambúrguer para Mobile.
 * - Exibe Nome do Usuário.
 * - Gerencia e Exibe Alertas/Notificações.
 */
export default function OSCHeader({ onToggleSidebar }) {
  const { user } = useAuth();

  // --- Estados para Alertas ---
  const [alerts, setAlerts] = useState([]);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);
  
  // Estado de loading local para a ação de marcar como lido
  const [isMarkingRead, setIsMarkingRead] = useState(false);

  // --- Busca Alertas ao Iniciar ---
  useEffect(() => {
    const fetchAlerts = async () => {
      if (!user?.id) return;

      setIsLoadingAlerts(true);
      try {
        const response = await alertService.getAlerts(); // Assume que retorna { data: [] } ou []
        // Ajuste conforme o retorno real do seu back-end (response.data ou response direto)
        const alertsData = response.data || response || [];
        setAlerts(Array.isArray(alertsData) ? alertsData : []);
      } catch (error) {
        console.error("Erro ao buscar alertas:", error);
      } finally {
        setIsLoadingAlerts(false);
      }
    };

    fetchAlerts();
    // Opcional: setInterval para polling de alertas
  }, [user?.id]);

  // --- Handlers ---
  const handleOpenAlertModal = () => setIsAlertModalOpen(true);
  const handleCloseAlertModal = () => setIsAlertModalOpen(false);

  const handleMarkAsRead = async (alertId) => {
    setIsMarkingRead(true);
    try {
      await alertService.markAlertAsRead(alertId);
      // Atualiza lista localmente
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, read: true } : a));
    } catch (err) {
      console.error("Erro ao marcar como lido:", err);
    } finally {
      setIsMarkingRead(false);
    }
  };

  // Contagem de não lidos (supondo que o objeto tenha propriedade 'read' ou 'is_read')
  // Ajuste 'a.read' conforme seu banco de dados (pode ser a.lido, a.status, etc)
  const unreadCount = alerts.filter(a => !a.read && !a.is_read).length;

  return (
    <>
      <header className={styles.header}>
        
        {/* Lado Esquerdo: Menu + Saudação */}
        <div className={styles.leftSection}>
          <button 
            onClick={onToggleSidebar} 
            className={styles.menuButton} 
            title="Alternar Menu"
          >
            <MenuIcon />
          </button>

          <div className={styles.userInfo}>
            <h2 className={styles.greeting}>Olá, {user?.name || 'OSC'}</h2>
            <span className={styles.role}>Painel da Organização</span>
          </div>
        </div>

        {/* Lado Direito: Notificações + Avatar */}
        <div className={styles.rightSection}>
          
          {/* Botão de Sino com Badge */}
          <button 
            className={styles.iconButton} 
            onClick={handleOpenAlertModal}
            title="Ver Notificações"
          >
            <BellIcon />
            {unreadCount > 0 && (
              <span className={styles.notificationBadge}></span>
            )}
          </button>

          {/* Avatar (Iniciais) */}
          <div className={styles.avatar}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'O'}
          </div>
        </div>
      </header>

      {/* Modal de Alertas */}
      <AlertsModal
        isOpen={isAlertModalOpen}
        onClose={handleCloseAlertModal}
        alerts={alerts}
        onMarkAsRead={handleMarkAsRead}
        isLoading={isMarkingRead}
      />
    </>
  );
}