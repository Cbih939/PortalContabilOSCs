import React, { useState } from 'react';
import Modal from '../../../components/common/Modal.jsx';

export default function TransferOfficeModal({ isOpen, onClose, onSave, isLoading, osc, offices }) {
  const [selectedOffice, setSelectedOffice] = useState('');

  if (!isOpen || !osc) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedOffice) {
      alert("Por favor, selecione o novo escritório de destino.");
      return;
    }
    onSave(osc.id, selectedOffice);
  };

  return (
    <Modal isOpen={isOpen} title={`Transferir: ${osc.name}`} onClose={onClose}>
      <form>
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '15px' }}>
            Atenção: Ao transferir esta OSC para um novo escritório, a associação atual com qualquer contador específico será removida, passando o cliente para a responsabilidade global da nova equipa.
          </p>
          
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '8px', display: 'block' }}>
            Selecione o Novo Escritório Destino *
          </label>
          <select 
            value={selectedOffice} 
            onChange={(e) => setSelectedOffice(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#fff', outline: 'none' }}
          >
            <option value="">-- Escolha um Escritório --</option>
            {offices.map(office => (
              <option key={office.id} value={office.id}>
                {office.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button 
            type="button" 
            onClick={onClose} 
            disabled={isLoading} 
            style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#fff', cursor: 'pointer' }}
          >
            Cancelar
          </button>
          <button 
            type="button" 
            onClick={handleSubmit} 
            disabled={isLoading} 
            style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#ea580c', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {isLoading ? 'Transferindo...' : 'Confirmar Transferência'}
          </button>
        </div>
      </form>
    </Modal>
  );
}