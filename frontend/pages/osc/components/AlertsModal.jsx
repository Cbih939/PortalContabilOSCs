// src/pages/osc/components/AlertsModal.js

import React from 'react';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import { AlertTriangleIcon } from '../../../components/common/Icons';
import { clsx } from 'clsx';

/**
 * Modal para a OSC visualizar os Alertas e Avisos
 * enviados pelo Contador.
 *
 * Props:
 * - isOpen (boolean): Controla a visibilidade do modal.
 * - onClose (function): Função para fechar o modal.
 * - alerts (array): Array de objetos de alerta (ex: [{ id, title, message, date, read }]).
 * - onMarkAsRead (function): Função chamada com (alertId) ao clicar em "Marcar como lido".
 * - isLoading (boolean): (Opcional) Mostra um spinner/desabilita botões se uma ação (como 'marcar como lido') estiver em progresso.
 */
export default function AlertsModal({
  isOpen,
  onClose,
  alerts = [],
  onMarkAsRead,
  isLoading = false,
}) {
  // Separa os alertas entre lidos e não lidos
  const unreadAlerts = alerts.filter((a) => !a.read);
  const readAlerts = alerts.filter((a) => a.read);

  // Helper para formatar a data
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Define o rodapé (apenas um botão de fechar)
  const modalFooter = (
    <Button variant="secondary" onClick={onClose}>
      Fechar
    </Button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        // Passa JSX para o 'title'
        <span className="flex items-center">
          <AlertTriangleIcon className="mr-2 text-yellow-500 h-5 w-5" />
          Avisos do Contador
        </span>
      }
      footer={modalFooter}
      size="lg" // 'lg' (max-w-2xl)
    >
      {/* Define uma altura máxima para o *corpo* do modal,
        permitindo scroll interno se a lista for longa.
        O 'bg-gray-50' dá o fundo cinza claro que você tinha.
      */}
      <div className="overflow-y-auto max-h-[70vh] bg-gray-50 -m-6 p-6">
        {alerts.length === 0 ? (
          <p className="p-8 text-center text-gray-500">
            Nenhum aviso no momento.
          </p>
        ) : (
          <div className="space-y-6">
            {/* --- Seção de Alertas NÃO LIDOS --- */}
            {unreadAlerts.length > 0 && (
              <section>
                <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">
                  Novos
                </h4>
                <div className="space-y-3">
                  {unreadAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        {/* Título e Mensagem */}
                        <div className="flex-1">
                          <p className="font-bold text-yellow-800">
                            {alert.title}
                          </p>
                          <p className="text-sm text-gray-700 mt-1">
                            {alert.message}
                          </p>
                        </div>
                        {/* Botão de Ação */}
                        <Button
                          variant="ghost" // Usa a variante 'ghost' do nosso botão
                          size="sm"
                          onClick={() => onMarkAsRead(alert.id)}
                          disabled={isLoading}
                          // Classes extras para o estilo 'amarelo'
                          className="text-xs bg-yellow-200 text-yellow-800 font-bold py-1 px-3 rounded-full hover:bg-yellow-300 whitespace-nowrap ml-4"
                        >
                          Marcar como lido
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-right">
                        {formatTimestamp(alert.date)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* --- Seção de Alertas LIDOS --- */}
            {readAlerts.length > 0 && (
              <section>
                <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">
                  Lidos
                </h4>
                <div className="space-y-3">
                  {readAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="bg-white p-4 rounded-lg opacity-70 border"
                    >
                      <p className="font-bold text-gray-600">{alert.title}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {alert.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2 text-right">
                        {formatTimestamp(alert.date)}
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

/**
 * --- Como Usar (no componente Header da OSC) ---
 *
 * import { useState } from 'react';
 * import AlertsModal from './components/osc/AlertsModal';
 * import { useApi } from '../../hooks/useApi';
 * import * as alertService from '../../services/alertService';
 *
 * function OSCHeader() { // (Ou qualquer componente que tenha o sino)
 * const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
 *
 * // (Lógica para buscar 'alerts' da API - ex: useQuery)
 * const [alerts, setAlerts] = useState(mockAlerts); 
 *
 * // Hook para a API de 'marcar como lido'
 * const { request: markAsRead, isLoading } = useApi(alertService.markAlertAsRead);
 *
 * const handleMarkAsRead = async (alertId) => {
 * try {
 * await markAsRead(alertId);
 * // Sucesso! Atualiza o estado local para mover o alerta
 * // da lista 'Novos' para 'Lidos' instantaneamente.
 * setAlerts(prev =>
 * prev.map(a => (a.id === alertId ? { ...a, read: true } : a))
 * );
 * } catch (err) {
 * // Erro! O useApi já mostrou a notificação.
 * }
 * };
 *
 * const unreadCount = alerts.filter(a => !a.read).length;
 *
 * return (
 * <>
 * <button onClick={() => setIsAlertModalOpen(true)} className="relative">
 * <AlertTriangleIcon />
 * {unreadCount > 0 && <span>{unreadCount}</span>}
 * </button>
 *
 * <AlertsModal
 * isOpen={isAlertModalOpen}
 * onClose={() => setIsAlertModalOpen(false)}
 * alerts={alerts}
 * onMarkAsRead={handleMarkAsRead}
 * isLoading={isLoading}
 * />
 * </>
 * );
 * }
 */