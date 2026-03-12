// src/pages/contador/components/EditOSCModal.jsx

import React, { useState, useEffect } from 'react';
import Modal from '../../../components/common/Modal.jsx';
import Input from '../../../components/common/Input.jsx';
import Button from '../../../components/common/Button.jsx';
// A importação do 'Select' foi removida daqui!

export default function EditOSCModal({ isOpen, onClose, oscData, onSave, isLoading }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    cnpj: '',
    responsible: '',
    email: '',
    phone: '',
    address: '',
    status: 'Ativo',
    data_origem_estatuto: '', // Novo Campo
    data_contrato_conta_comigo: '' // Novo Campo
  });

  useEffect(() => {
    if (oscData) {
      setFormData({
        id: oscData.id || '',
        name: oscData.name || oscData.razao_social || '',
        cnpj: oscData.cnpj || '',
        responsible: oscData.responsible || oscData.responsavel || '',
        email: oscData.email || '',
        phone: oscData.phone || '',
        address: oscData.address || '',
        status: oscData.status || 'Ativo',
        
        // Puxar as datas do banco (convertendo para formato YYYY-MM-DD para o input type="date")
        data_origem_estatuto: oscData.data_origem_estatuto ? new Date(oscData.data_origem_estatuto).toISOString().split('T')[0] : '',
        data_contrato_conta_comigo: oscData.data_contrato_conta_comigo ? new Date(oscData.data_contrato_conta_comigo).toISOString().split('T')[0] : ''
      });
    } else {
      // Limpa o formulário se for "Criar Nova"
      setFormData({
        id: '',
        name: '',
        cnpj: '',
        responsible: '',
        email: '',
        phone: '',
        address: '',
        status: 'Ativo',
        data_origem_estatuto: '',
        data_contrato_conta_comigo: ''
      });
    }
  }, [oscData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  const isEditing = !!formData.id;

  return (
    <Modal title={isEditing ? "Editar Organização (OSC)" : "Cadastrar Nova OSC"} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          
          {/* CAMPOS EXISTENTES */}
          <Input label="Nome da OSC" name="name" value={formData.name} onChange={handleChange} required />
          <Input label="CNPJ" name="cnpj" value={formData.cnpj} onChange={handleChange} required />
          <Input label="Responsável" name="responsible" value={formData.responsible} onChange={handleChange} required />
          <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
          <Input label="Telefone" name="phone" value={formData.phone} onChange={handleChange} />
          
          {/* STATUS: Substituído por um select nativo do HTML */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
             <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>
               Status
             </label>
             <select 
               name="status" 
               value={formData.status} 
               onChange={handleChange} 
               style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', backgroundColor: '#fff', outline: 'none' }}
             >
               <option value="Ativo">Ativo</option>
               <option value="Inativo">Inativo</option>
             </select>
          </div>

          {/* NOVOS CAMPOS DE DATA PARA O CÁLCULO DO TEC */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
             <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>
               Data do Estatuto Social *
             </label>
             <input 
               type="date" 
               name="data_origem_estatuto" 
               value={formData.data_origem_estatuto} 
               onChange={handleChange} 
               required
               style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', backgroundColor: '#fff', outline: 'none' }}
             />
             <span style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>Base para histórico contábil</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
             <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>
               Início Contrato Conta Comigo *
             </label>
             <input 
               type="date" 
               name="data_contrato_conta_comigo" 
               value={formData.data_contrato_conta_comigo} 
               onChange={handleChange} 
               required
               style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', backgroundColor: '#fff', outline: 'none' }}
             />
             <span style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>Define quando começam os envios mensais</span>
          </div>

          {/* ENDEREÇO */}
          <div style={{ gridColumn: 'span 2' }}>
            <Input label="Endereço" name="address" value={formData.address} onChange={handleChange} />
          </div>

        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Cadastrar Nova OSC')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}