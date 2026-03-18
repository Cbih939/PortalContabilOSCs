import React from 'react';
import Modal from '../../../components/common/Modal.jsx';

export default function ViewOSCModal({ isOpen, onClose, osc }) {
  if (!isOpen || !osc) return null;

  // Função para garantir que a data aparece no formato BR corretamente
  const formatDate = (dateString) => {
    if (!dateString) return 'Não informada';
    if (typeof dateString === 'string' && dateString.includes('-')) {
         const [year, month, day] = dateString.split('T')[0].split('-');
         return `${day}/${month}/${year}`;
    }
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Componente interno para padronizar o layout de cada informação
  const InfoItem = ({ label, value, isLink, badgeColor }) => (
    <div style={{ marginBottom: '12px' }}>
      <span style={{ display: 'block', fontSize: '12px', color: '#6b7280', fontWeight: 'bold', marginBottom: '4px' }}>{label}</span>
      
      {isLink && value ? (
        <a href={value} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: '#0369a1', textDecoration: 'none', backgroundColor: '#e0f2fe', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold', display: 'inline-block' }}>
          Visualizar Certificado &rarr;
        </a>
      ) : badgeColor && value ? (
         <span style={{ fontSize: '12px', backgroundColor: badgeColor.bg, color: badgeColor.text, padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
           {value}
         </span>
      ) : (
         <span style={{ fontSize: '14px', color: value ? '#1f2937' : '#9ca3af', fontWeight: '500' }}>
           {value || 'Não informado'}
         </span>
      )}
    </div>
  );

  return (
    <Modal isOpen={isOpen} title="Raio-X da Organização (OSC)" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px' }}>
        
        {/* Bloco 1: Informações Principais */}
        <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '14px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', textTransform: 'uppercase' }}>1. Dados Principais</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <InfoItem label="Nome / Razão Social" value={osc.name || osc.razao_social} />
            <InfoItem label="CNPJ" value={osc.cnpj} />
            <InfoItem label="Responsável" value={osc.responsible || osc.responsavel} />
            <InfoItem label="Status no Sistema" value={osc.status || 'Ativo'} badgeColor={{ bg: '#dcfce7', text: '#15803d' }} />
          </div>
        </div>

        {/* Bloco 2: Contato e Endereço */}
        <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '14px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', textTransform: 'uppercase' }}>2. Contato e Localização</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <InfoItem label="E-mail" value={osc.email} />
            <InfoItem label="Telefone" value={osc.phone} />
            <div style={{ gridColumn: 'span 2' }}>
              <InfoItem label="Endereço Completo" value={osc.address} />
            </div>
          </div>
        </div>

        {/* Bloco 3: Datas e Conformidade */}
        <div style={{ backgroundColor: '#fffbeb', padding: '16px', borderRadius: '8px', border: '1px solid #fde68a' }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#92400e', fontSize: '14px', borderBottom: '1px solid #fde68a', paddingBottom: '8px', textTransform: 'uppercase' }}>3. Datas e Contrato</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <InfoItem label="Origem (Estatuto/Fundação)" value={formatDate(osc.data_origem_estatuto || osc.data_fundacao)} />
            <InfoItem label="Início do Contrato" value={formatDate(osc.data_contrato_conta_comigo)} />
          </div>
        </div>

        {/* Bloco 4: Certificados de Regularidade */}
        <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#166534', fontSize: '14px', borderBottom: '1px solid #bbf7d0', paddingBottom: '8px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            4. Certificados de Regularidade
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <InfoItem label="Âmbito Federal" value={osc.cert_federal} isLink={true} />
            <InfoItem label="Âmbito Estadual" value={osc.cert_estadual} isLink={true} />
            <InfoItem label="Âmbito Municipal" value={osc.cert_municipal} isLink={true} />
          </div>
        </div>

      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', borderTop: '1px solid #e5e7eb', paddingTop: '15px' }}>
        <button onClick={onClose} style={{ padding: '10px 24px', backgroundColor: '#4b5563', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#fff', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.target.style.backgroundColor = '#374151'} onMouseOut={(e) => e.target.style.backgroundColor = '#4b5563'}>
          Fechar Detalhes
        </button>
      </div>
    </Modal>
  );
}