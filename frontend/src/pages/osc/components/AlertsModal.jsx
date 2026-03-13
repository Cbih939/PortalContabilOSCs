// src/pages/osc/components/AlertsModal.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../../components/common/Modal.jsx';
import Button from '../../../components/common/Button.jsx';
import { AlertTriangleIcon } from '../../../components/common/Icons.jsx';
import styles from './AlertsModal.module.css'; // Importa CSS
import { formatDateTime } from '../../../utils/formatDate.js'; // Helper data/hora

// Ícone de Chat simples para o botão
const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

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
  const navigate = useNavigate();

  // CORREÇÃO: O backend retorna 'is_read' (0 ou 1/true ou false) da base de dados
  const unreadAlerts = alerts.filter((a) => !a.read && !a.is_read);
  const readAlerts = alerts.filter((a) => a.read || a.is_read);

  const handleReplyInChat = () => {
    onClose(); // Fecha o modal
    navigate('/osc/messages'); // Redireciona para o chat
  };

  const modalFooter = (
    <Button variant="secondary" onClick={onClose}>Fechar</Button>
  );

  const modalTitle = (
    <span className={styles.modalTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <AlertTriangleIcon className={styles.titleIcon} />
      Avisos do Escritório Contábil
    </span>
  );

  return (
    <Modal
      isOpen={isOpen} onClose={onClose}
      title={modalTitle} footer={modalFooter} size="lg"
    >
      <div className={styles.modalBody}>
        {alerts.length === 0 ? (
          <p className={styles.emptyText} style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
            Nenhum aviso no momento.
          </p>
        ) : (
          <div>
            {/* Alertas Não Lidos */}
            {unreadAlerts.length > 0 && (
              <section style={{ marginBottom: '24px' }}>
                <h4 className={styles.sectionTitle} style={{ color: '#ea580c', borderBottom: '2px solid #ea580c', paddingBottom: '4px', marginBottom: '12px' }}>Novos Avisos</h4>
                <div className={styles.alertsList} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {unreadAlerts.map(alert => (
                    <div key={alert.id} className={styles.unreadAlert} style={{ backgroundColor: '#fff7ed', border: '1px solid #fdba74', padding: '16px', borderRadius: '8px' }}>
                      <div className={styles.alertHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                        <div className={styles.alertContent} style={{ flex: 1 }}>
                          <p className={styles.alertTitle} style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#9a3412', margin: '0 0 8px 0' }}>{alert.title}</p>
                          <p className={styles.alertMessage} style={{ color: '#431407', margin: 0, whiteSpace: 'pre-wrap' }}>{alert.message}</p>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '140px' }}>
                          <button
                            onClick={() => onMarkAsRead(alert.id)}
                            className={styles.markReadButton}
                            disabled={isLoading}
                            style={{ padding: '8px 12px', backgroundColor: '#fff', border: '1px solid #fdba74', color: '#ea580c', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
                          >
                            Marcar como lido
                          </button>
                          <button
                            onClick={handleReplyInChat}
                            style={{ padding: '8px 12px', backgroundColor: '#ea580c', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <ChatIcon /> Responder
                          </button>
                        </div>

                      </div>
                      <p className={styles.alertTimestamp} style={{ fontSize: '0.75rem', color: '#fb923c', margin: '12px 0 0 0' }}>
                        Recebido em: {formatDateTime(alert.date || alert.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Alertas Lidos */}
            {readAlerts.length > 0 && (
              <section className={styles.readSection}>
                <h4 className={styles.sectionTitle} style={{ color: '#6b7280', borderBottom: '2px solid #e5e7eb', paddingBottom: '4px', marginBottom: '12px' }}>Histórico de Avisos</h4>
                <div className={styles.alertsList} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {readAlerts.map(alert => (
                    <div key={alert.id} className={styles.readAlert} style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', padding: '12px', borderRadius: '8px', opacity: 0.8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <p className={styles.alertTitle} style={{ fontWeight: '600', color: '#374151', margin: '0 0 4px 0' }}>{alert.title}</p>
                          <p className={styles.alertMessage} style={{ color: '#6b7280', margin: 0, fontSize: '0.9rem' }}>{alert.message}</p>
                        </div>
                        <button
                            onClick={handleReplyInChat}
                            style={{ padding: '6px 10px', backgroundColor: 'transparent', border: '1px solid #d1d5db', color: '#4b5563', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', marginLeft: '12px' }}
                            title="Ir para o Chat"
                          >
                            <ChatIcon />
                        </button>
                      </div>
                      <p className={styles.alertTimestamp} style={{ fontSize: '0.7rem', color: '#9ca3af', margin: '8px 0 0 0' }}>
                        Lido - Recebido em: {formatDateTime(alert.date || alert.created_at)}
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