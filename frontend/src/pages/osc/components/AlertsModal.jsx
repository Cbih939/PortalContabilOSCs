// src/pages/osc/components/AlertsModal.jsx

import React from 'react';
import Modal from '../../../components/common/Modal.jsx';
import Button from '../../../components/common/Button.jsx';
import { AlertTriangleIcon } from '../../../components/common/Icons.jsx';
import styles from './AlertsModal.module.css'; // Importa CSS
import { formatDateTime } from '../../../utils/formatDate.js'; // Helper data/hora

/**
 * Modal para a OSC visualizar Alertas (CSS Modules).
 */
export default function AlertsModal({
  isOpen,
  onClose,
  alerts = [],
  onMarkAsRead, // Função para marcar como lido
  isLoading = false, // Para desabilitar botão ao marcar
}) {
  const unreadAlerts = alerts.filter((a) => !a.read);
  const readAlerts = alerts.filter((a) => a.read);

  const modalFooter = (
    <Button variant="secondary" onClick={onClose}>Fechar</Button>
  );

  const modalTitle = (
    <span className={styles.modalTitle}>
      <AlertTriangleIcon className={styles.titleIcon} />
      Avisos do Contador
    </span>
  );

  return (
    <Modal
      isOpen={isOpen} onClose={onClose}
      title={modalTitle} footer={modalFooter} size="lg"
    >
      <div className={styles.modalBody}>
        {alerts.length === 0 ? (
          <p className={styles.emptyText}>Nenhum aviso no momento.</p>
        ) : (
          <div>
            {/* Alertas Não Lidos */}
            {unreadAlerts.length > 0 && (
              <section>
                <h4 className={styles.sectionTitle}>Novos</h4>
                <div className={styles.alertsList}>
                  {unreadAlerts.map(alert => (
                    <div key={alert.id} className={styles.unreadAlert}>
                      <div className={styles.alertHeader}>
                        <div className={styles.alertContent}>
                          <p className={styles.alertTitle}>{alert.title}</p>
                          <p className={styles.alertMessage}>{alert.message}</p>
                        </div>
                        {/* Botão Marcar como Lido */}
                        <button
                          onClick={() => onMarkAsRead(alert.id)}
                          className={styles.markReadButton}
                          disabled={isLoading} // Desabilita durante chamada API
                        >
                          Marcar como lido
                        </button>
                      </div>
                      <p className={styles.alertTimestamp}>
                        {formatDateTime(alert.date)} {/* Usa formato Data e Hora */}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Alertas Lidos */}
            {readAlerts.length > 0 && (
              <section className={styles.readSection}>
                <h4 className={styles.sectionTitle}>Lidos</h4>
                <div className={styles.alertsList}>
                  {readAlerts.map(alert => (
                    <div key={alert.id} className={styles.readAlert}>
                      <p className={styles.alertTitle}>{alert.title}</p>
                      <p className={styles.alertMessage}>{alert.message}</p>
                      <p className={styles.alertTimestamp}>
                        {formatDateTime(alert.date)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}