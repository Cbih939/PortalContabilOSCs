// src/pages/admin/components/AssignContadorModal.jsx

import React, { useState, useEffect } from 'react';
import Modal from '../../../components/common/Modal.jsx';
import Button from '../../../components/common/Button.jsx';
import Spinner from '../../../components/common/Spinner.jsx';
import styles from './AssignContadorModal.module.css'; // Importa CSS

const FORM_ID = 'assign-contador-form';

/**
 * Modal para o Admin associar uma OSC a um Contador.
 *
 * Props:
 * - isOpen (boolean): Controla a visibilidade.
 * - onClose (function): Função para fechar.
 * - onSave (function): Função chamada com (oscId, contadorId) ao salvar.
 * - isLoading (boolean): Estado de carregamento do salvamento.
 * - osc (object): A OSC que está a ser associada.
 * - contadores (array): A lista de todos os contadores disponíveis.
 */
export default function AssignContadorModal({
  isOpen,
  onClose,
  onSave,
  isLoading,
  osc,
  contadores = [] // Lista de contadores para o dropdown
}) {

  const [selectedContadorId, setSelectedContadorId] = useState('');

  // Efeito para pré-selecionar o contador atual da OSC quando o modal abre
  useEffect(() => {
    if (osc) {
      // O 'osc.contadorName' vem da lista, precisamos do ID.
      // O backend deve idealmente incluir 'assigned_contador_id' na lista GET /api/oscs
      // Por enquanto, vamos tentar encontrar pelo nome (frágil) ou deixar em branco
      const currentContador = contadores.find(c => c.name === osc.contadorName);
      setSelectedContadorId(currentContador ? currentContador.id : '');
    } else {
        setSelectedContadorId(''); // Limpa se não houver OSC (ex: modal geral)
    }
  }, [osc, contadores]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isLoading && osc && selectedContadorId) {
      onSave(osc.id, selectedContadorId); // Passa ID da OSC e ID do Contador
    } else if (!selectedContadorId) {
        alert("Por favor, selecione um contador.");
    }
  };

  // Rodapé do modal
  const modalFooter = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={isLoading}>
        Cancelar
      </Button>
      <Button
        variant="primary"
        type="submit"
        form={FORM_ID}
        disabled={isLoading || !selectedContadorId || !osc}
      >
        {isLoading ? <Spinner size="sm" className="mr-2" /> : "Salvar Associação"}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Associar Contador para: ${osc?.name || '...'}`}
      footer={modalFooter}
      size="md" // Tamanho pequeno/médio
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className={styles.form}>

        {/* Campo OSC (apenas visualização) */}
        <div>
          <label htmlFor="osc-name" className={styles.selectLabel}>OSC</label>
          <input
            id="osc-name"
            value={osc?.name || 'N/D'}
            className={styles.selectInput} // Reutiliza estilo de select
            disabled
          />
        </div>

        {/* Dropdown de Contadores */}
        <div>
          <label htmlFor="contador-select" className={styles.selectLabel}>
            Selecione o Contador Responsável *
          </label>
          <select
            id="contador-select"
            value={selectedContadorId}
            onChange={(e) => setSelectedContadorId(e.target.value)}
            className={styles.selectInput}
            required
          >
            <option value="" disabled>Selecione...</option>
            {contadores.map(contador => (
              <option key={contador.id} value={contador.id}>
                {contador.name} (ID: {contador.id})
              </option>
            ))}
            <option value="null">(Remover Associação - Nenhum)</option> {/* Opcional */}
          </select>
        </div>

      </form>
    </Modal>
  );
}