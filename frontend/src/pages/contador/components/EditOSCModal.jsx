import React, { useState, useEffect } from 'react';
import Modal from '../../../components/common/Modal.jsx';
import Input from '../../../components/common/Input.jsx';

export default function EditOSCModal({ isOpen, onClose, oscData, onSave, isLoading }) {
  const [formData, setFormData] = useState({
    id: '', name: '', cnpj: '', responsible: '', email: '', phone: '', address: '', status: 'Ativo',
    data_origem_estatuto: '', data_contrato_conta_comigo: '',
    cert_federal: '', cert_estadual: '', cert_municipal: ''
  });

  useEffect(() => {
    if (oscData && oscData.id) {
      setFormData({
        id: oscData.id,
        name: oscData.name || oscData.razao_social || '',
        cnpj: oscData.cnpj || '',
        responsible: oscData.responsible || oscData.responsavel || '',
        email: oscData.email || '',
        phone: oscData.phone || '',
        address: oscData.address || '',
        status: oscData.status || 'Ativo',
        data_origem_estatuto: oscData.data_origem_estatuto ? new Date(oscData.data_origem_estatuto).toISOString().split('T')[0] : '',
        data_contrato_conta_comigo: oscData.data_contrato_conta_comigo ? new Date(oscData.data_contrato_conta_comigo).toISOString().split('T')[0] : '',
        cert_federal: oscData.cert_federal || '',
        cert_estadual: oscData.cert_estadual || '',
        cert_municipal: oscData.cert_municipal || ''
      });
    } else {
      setFormData({
        id: '', name: '', cnpj: '', responsible: '', email: '', phone: '', address: '', status: 'Ativo',
        data_origem_estatuto: '', data_contrato_conta_comigo: '',
        cert_federal: '', cert_estadual: '', cert_municipal: ''
      });
    }
  }, [oscData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDirectSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.cnpj || !formData.email || !formData.data_origem_estatuto || !formData.data_contrato_conta_comigo) {
        alert("Por favor, preencha todos os campos obrigatórios (*), incluindo as datas do estatuto e do contrato.");
        return;
    }
    onSave(formData);
  };

  if (!isOpen) return null;
  const isEditing = !!formData.id;

  return (
    <Modal isOpen={isOpen} title={isEditing ? "Editar Organização (OSC)" : "Cadastrar Nova OSC"} onClose={onClose}>
      <form>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          
          <Input label="Nome da OSC *" name="name" value={formData.name} onChange={handleChange} />
          <Input label="CNPJ *" name="cnpj" value={formData.cnpj} onChange={handleChange} />
          <Input label="Responsável *" name="responsible" value={formData.responsible} onChange={handleChange} />
          <Input label="Email *" name="email" type="email" value={formData.email} onChange={handleChange} />
          <Input label="Telefone" name="phone" value={formData.phone} onChange={handleChange} />
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
             <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Status</label>
             <select name="status" value={formData.status} onChange={handleChange} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', backgroundColor: '#fff', outline: 'none' }}>
               <option value="Ativo">Ativo</option>
               <option value="Inativo">Inativo</option>
             </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
             <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Data do Estatuto Social *</label>
             <input type="date" name="data_origem_estatuto" value={formData.data_origem_estatuto} onChange={handleChange} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', backgroundColor: '#fff', outline: 'none' }} />
             <span style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>Base para histórico</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
             <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Início Contrato *</label>
             <input type="date" name="data_contrato_conta_comigo" value={formData.data_contrato_conta_comigo} onChange={handleChange} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', backgroundColor: '#fff', outline: 'none' }} />
             <span style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>Define os envios mensais</span>
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <Input label="Endereço" name="address" value={formData.address} onChange={handleChange} />
          </div>
        </div>

        {/* --- NOVA SEÇÃO: CERTIFICADOS --- */}
        <div style={{ marginTop: '20px', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
          <h4 style={{ fontSize: '14px', color: '#1f2937', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="18" height="18" fill="none" stroke="#059669" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            Links dos Certificados / Certidões de Regularidade
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#4b5563', marginBottom: '4px' }}>Âmbito Federal</label>
              <input type="url" name="cert_federal" placeholder="https://..." value={formData.cert_federal} onChange={handleChange} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', width: '100%', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#4b5563', marginBottom: '4px' }}>Âmbito Estadual</label>
              <input type="url" name="cert_estadual" placeholder="https://..." value={formData.cert_estadual} onChange={handleChange} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', width: '100%', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#4b5563', marginBottom: '4px' }}>Âmbito Municipal</label>
              <input type="url" name="cert_municipal" placeholder="https://..." value={formData.cert_municipal} onChange={handleChange} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', width: '100%', boxSizing: 'border-box' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '25px' }}>
          <button type="button" onClick={onClose} disabled={isLoading} style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#374151', cursor: 'pointer', fontWeight: '500' }}>
            Cancelar
          </button>
          <button type="button" disabled={isLoading} onClick={handleDirectSubmit} style={{ padding: '10px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#ea580c', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>
            {isLoading ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Cadastrar Nova OSC')}
          </button>
        </div>
      </form>
    </Modal>
  );
}