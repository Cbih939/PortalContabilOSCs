// src/pages/contador/components/NotificationModal.js

import React from 'react';
import Modal from '../../../components/common/Modal';
import { FileIcon, MessageIcon } from '../../../components/common/Icons';
import Button from '../../../components/common/Button';

/**
 * Modal para exibir a lista de notificações do Contador.
 *
 * Props:
 * - isOpen (boolean): Controla a visibilidade do modal.
 * - notifications (array): O array de objetos de notificação.
 * - onClose (function): Função para fechar o modal.
 * - onCheck (function): Função chamada com a (notificação) ao clicar em "Verificar".
 */
export default function NotificationModal({
  isOpen,
  notifications,
  onClose,
  onCheck,
}) {
  // Helper para formatar a data
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return (
      date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }) +
      ' às ' +
      date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    );
  };

  // Handler para o botão "Verificar"
  const handleCheckClick = (notif) => {
    // Se a função 'onCheck' foi fornecida, chama ela
    if (onCheck) {
      onCheck(notif);
    }
    // Fecha o modal após clicar
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Notificações"
      size="lg"
      // Este modal não precisa de um 'footer' prop,
      // pois o 'X' no header já serve para fechar.
    >
      {/* Define uma altura máxima e scroll apenas para o *conteúdo* do modal,
        deixando o cabeçalho fixo.
      */}
      <div className="overflow-y-auto max-h-[60vh]">
        {notifications.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {notifications.map((notif) => (
              <li key={notif.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start space-x-4">
                  {/* --- Ícone --- */}
                  <div className="flex-shrink-0 pt-1 text-gray-500">
                    {notif.type === 'file' ? (
                      <FileIcon className="h-5 w-5" />
                    ) : (
                      <MessageIcon className="h-5 w-5" />
                    )}
                  </div>

                  {/* --- Conteúdo --- */}
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">
                      <span className="font-bold">{notif.oscName}</span>
                      {notif.type === 'file'
                        ? ' enviou o arquivo: '
                        : ' enviou uma mensagem: '}
                      <span className="italic">"{notif.content}"</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimestamp(notif.timestamp)}
                    </p>
                  </div>

                  {/* --- Ação --- */}
                  <div className="flex-shrink-0">
                    {/* Botão "Verificar" chama o handler */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCheckClick(notif)}
                      className="text-blue-600 hover:bg-blue-100 font-bold"
                    >
                      Verificar
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          // Mensagem de placeholder se não houver notificações
          <p className="p-8 text-center text-gray-500">
            Nenhuma notificação nova.
          </p>
        )}
      </div>
    </Modal>
  );
}

/**
 * --- Como Usar (na página 'Documents.js' do Contador) ---
 *
 * import { useState } from 'react';
 * import { useNavigate } from 'react-router-dom';
 * import NotificationModal from './components/NotificationModal';
 *
 * function ContadorHeader() { // (Ou qualquer componente que tenha o sino)
 * const [isNotifOpen, setIsNotifOpen] = useState(false);
 * const navigate = useNavigate();
 *
 * // (Lógica para buscar 'notifications' da API)
 *
 * const handleCheckNotification = (notif) => {
 * // Exemplo de como navegar para a página correta
 * if (notif.type === 'file') {
 * navigate(`/contador/documentos?highlight=${notif.id}`);
 * } else {
 * navigate(`/contador/mensagens?oscId=${notif.oscId}`);
 * }
 * };
 *
 * return (
 * <>
 * <button onClick={() => setIsNotifOpen(true)}>
 * <BellIcon />
 * </button>
 *
 * <NotificationModal
 * isOpen={isNotifOpen}
 * onClose={() => setIsNotifOpen(false)}
 * notifications={notifications}
 * onCheck={handleCheckNotification}
 * />
 * </>
 * );
 * }
 */