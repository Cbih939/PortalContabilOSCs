// src/pages/contador/components/ContadorHeader.jsx

import React, { useState, useEffect } from 'react';
import Header from '../../../components/layout/Header.jsx';
import { MenuIcon, BellIcon } from '../../../components/common/Icons.jsx';
import { useAuth } from '../../../hooks/useAuth.jsx';
import styles from './ContadorHeader.module.css';
import NotificationModal from './NotificationModal.jsx';
import * as contadorService from '../../../services/contadorService.js';
import { useNotification as useToast } from '../../../contexts/NotificationContext.jsx';
import { ROLES } from '../../../utils/constants.js';

/**
 * Componente Header do Contador (com lógica de notificações).
 */
export default function ContadorHeader({ onToggleSidebar }) {
  const { user } = useAuth();
  const addToast = useToast();

  const [notifications, setNotifications] = useState([]);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  // Efeito para buscar Notificações
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id || user?.role !== ROLES.CONTADOR) {
          setNotifications([]);
          return;
      };
      setIsLoadingNotifications(true);
      try {
        const response = await contadorService.getNotifications();
        const sortedNotifications = (response.data || [])
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 20);
        setNotifications(sortedNotifications);
      } catch (error) {
        console.error("Erro ao buscar notificações:", error);
        // addToast("Não foi possível buscar as notificações.", "error");
      } finally {
        setIsLoadingNotifications(false);
      }
    };
    fetchNotifications();
    // const intervalId = setInterval(fetchNotifications, 60000); // Opcional
    // return () => clearInterval(intervalId);
  }, [user?.id, user?.role, addToast]);

  // Handlers Modal
  const handleOpenNotificationModal = () => setIsNotificationModalOpen(true);
  const handleCloseNotificationModal = () => setIsNotificationModalOpen(false);

  // Calcula contagem
  const notificationCount = notifications.length;

  // --- Renderização ---
  const leftContent = (
    <button
      onClick={onToggleSidebar}
      className={styles.menuButton}
      aria-label="Abrir/Fechar menu lateral"
    >
      <MenuIcon />
    </button>
  );

  const rightContent = (
    // Usa o .rightContainer do Header.jsx para gerir espaçamento
    <>
      {/* Botão de Notificações */}
      <button
        onClick={handleOpenNotificationModal}
        className={styles.notificationButton}
        title="Ver Notificações"
        disabled={isLoadingNotifications}
      >
        <BellIcon /> {/* Ícone */}
        {/* Badge Renderizado Condicionalmente - Sintaxe Verificada */}
        {!isLoadingNotifications && notificationCount > 0 && (
          <span className={styles.notificationBadge}>
            {notificationCount > 9 ? '9+' : notificationCount}
          </span>
        )} {/* Fim da condição do Badge */}
      </button>

      {/* Texto de Boas-vindas */}
      <span className={styles.welcomeText}>
        Bem-vindo(a), {user?.name || 'Utilizador'}
      </span>
    </>
  ); // Fim do rightContent

  return (
    <>
      <Header leftContent={leftContent} rightContent={rightContent} />

      {/* Renderiza o Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={handleCloseNotificationModal}
        notifications={notifications}
      />
    </>
  );
}