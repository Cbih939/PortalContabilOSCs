// src/pages/contador/components/NotificationModal.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom'; // Para redirecionar ao clicar em Verificar
import Modal from '../../../components/common/Modal.jsx'; // Usa Modal genérico
import { FileIcon, MessageIcon } from '../../../components/common/Icons.jsx'; // Usa Ícones comuns
import styles from './NotificationModal.module.css'; // Importa CSS Module específico
import { formatDateTime } from '../../../utils/formatDate.js'; // Helper de formatação

/**
 * Modal para exibir Notificações do Contador (CSS Modules).
 */
export default function NotificationModal({
  isOpen,
  notifications = [], // Garante que é um array
  onClose,
}) {
  const navigate = useNavigate(); // Hook para navegação

  // Handler para o botão "Verificar"
  const handleCheckClick = (notif) => {
    onClose(); // Fecha o modal primeiro

    // Navega para a página apropriada baseado no tipo e IDs na notificação
    // (A estrutura exata de 'notif' depende do que a API retornar)
    if (notif.type === 'file' && (notif.fileId || notif.relatedId)) {
      // Navega para documentos, talvez com ?highlight=id
      navigate(`/contador/documentos?highlight=${notif.fileId || notif.relatedId}`);
    } else if (notif.type === 'message' && (notif.oscId || notif.relatedId)) {
      // Navega para mensagens, abrindo a conversa
      navigate(`/contador/mensagens?oscId=${notif.oscId || notif.relatedId}`);
    } else {
      console.warn("Notificação sem ação de navegação definida:", notif);
      // Opcional: Navegar para o dashboard como fallback
      // navigate('/contador/dashboard');
    }
  };

  return (
    // Usa o componente Modal genérico
    <Modal isOpen={isOpen} onClose={onClose} title="Notificações" size="lg">
      {/* Corpo do modal com scroll interno */}
      <div className={styles.modalBody}>
        {notifications.length > 0 ? (
          <ul className={styles.notificationsList}>
            {notifications.map((notif) => (
              <li key={notif.id || notif.timestamp} className={styles.notificationItem}> {/* Usa timestamp como fallback key */}
                <div className={styles.itemContent}>
                  {/* Ícone */}
                  <div className={styles.itemIconContainer}>
                    {notif.type === 'file' ? (
                      <FileIcon className={styles.itemIcon} />
                    ) : (
                      <MessageIcon className={styles.itemIcon} />
                    )}
                  </div>
                  {/* Texto */}
                  <div className={styles.itemTextContainer}>
                    <p className={styles.itemText}>
                      <strong>{notif.oscName || 'Desconhecida'}</strong>
                      {notif.type === 'file' ? ' enviou o arquivo: ' : ' enviou uma mensagem: '}
                      <i>"{notif.content}"</i>
                    </p>
                    <p className={styles.itemTimestamp}>
                      {formatDateTime(notif.timestamp)} {/* Formata Data e Hora */}
                    </p>
                  </div>
                  {/* Ação */}
                  <div className={styles.itemActionContainer}>
                    <button
                      onClick={() => handleCheckClick(notif)}
                      className={styles.checkButton}
                    >
                      Verificar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          // Mensagem se não houver notificações
          <p className={styles.emptyText}>Nenhuma notificação nova.</p>
        )}
      </div>
    </Modal>
  );
}