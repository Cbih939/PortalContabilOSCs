// src/pages/contador/components/ViewOSCModal.js

import React from 'react';
import { clsx } from 'clsx';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';

/**
 * Modal para "apenas visualização" dos detalhes de uma OSC.
 *
 * Props:
 * - isOpen (boolean): Controla a visibilidade do modal.
 * - onClose (function): Função para fechar o modal.
 * - osc (object): O objeto da OSC a ser exibido.
 */
export default function ViewOSCModal({ isOpen, onClose, osc }) {
  // Se o modal estiver aberto mas os dados (osc) ainda não
  // estiverem prontos (ou forem null), não renderiza nada.
  if (!osc) return null;

  // Define o rodapé (apenas um botão de fechar)
  const modalFooter = (
    <Button variant="secondary" onClick={onClose}>
      Fechar
    </Button>
  );

  // Helper para renderizar a 'tag' de status
  const StatusBadge = ({ status }) => (
    <span
      className={clsx(
        'relative inline-block px-3 py-1 font-semibold leading-tight rounded-full text-xs',
        status === 'Ativo' ? 'text-green-900' : 'text-red-900'
      )}
    >
      <span
        aria-hidden
        className={clsx(
          'absolute inset-0 opacity-50 rounded-full',
          status === 'Ativo' ? 'bg-green-200' : 'bg-red-200'
        )}
      ></span>
      <span className="relative">{status}</span>
    </span>
  );

  // Helper para renderizar um campo de detalhe
  const DetailField = ({ label, value }) => (
    <div>
      <strong className="text-sm font-medium text-gray-500">{label}</strong>
      <p className="text-gray-900">{value || 'Não informado'}</p>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalhes da OSC"
      footer={modalFooter}
      size="xl" // Tamanho 'xl' (extra large) para ver os detalhes
    >
      {/* --- Corpo do Modal com os Detalhes --- */}
      <div className="space-y-6">
        {/* Linha 1: Nome e CNPJ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailField label="Nome da OSC" value={osc.name} />
          <DetailField label="CNPJ" value={osc.cnpj} />
        </div>

        {/* Linha 2: Responsável e Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailField label="Responsável" value={osc.responsible} />
          <DetailField label="Email" value={osc.email} />
        </div>

        {/* Linha 3: Telefone e Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailField label="Telefone" value={osc.phone} />
          <div>
            <strong className="text-sm font-medium text-gray-500">Status</strong>
            <div className="mt-1">
              <StatusBadge status={osc.status} />
            </div>
          </div>
        </div>

        {/* Linha 4: Endereço (ocupa a linha toda) */}
        <div>
          <DetailField label="Endereço" value={osc.address} />
        </div>
      </div>
    </Modal>
  );
}

/**
 * --- Como Usar (na página 'OSCs.js' do Contador) ---
 *
 * import { useState } from 'react';
 * import ViewOSCModal from './components/ViewOSCModal';
 *
 * function OSCsPage() {
 * const [oscToView, setOscToView] = useState(null); // (ex: { id: 3, ... })
 *
 * return (
 * <>
 * {/* ... Tabela de OSCs ... */}
 * {/* (Um botão na tabela chamaria 'setOscToView(osc)') */}
 *
 * <ViewOSCModal
 * isOpen={!!oscToView} // !! transforma o objeto em booleano (true/false)
 * onClose={() => setOscToView(null)}
 * osc={oscToView}
 * />
 * </>
 * );
 * }
 */