import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import * as oscService from '../../services/oscService.js';
import styles from './Profile.module.css';

// Componente de Input Reutilizável
const InputField = ({ label, name, value, onChange, disabled, type = "text", color }) => (
  <div className={styles.inputGroup}>
    <label className={styles.label}>{label}</label>
    <input
      type={type}
      name={name}
      value={value || ''}
      onChange={onChange}
      disabled={disabled}
      className={styles.input}
      style={color ? { color: color, fontWeight: 'bold' } : {}}
      placeholder={disabled ? "" : "Digite..."}
    />
  </div>
);

export default function OSCProfilePage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Verificação de débito rigorosa
  const isDebt = Number(user?.is_in_debt) === 1;

  useEffect(() => {
    if (user?.id) loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const data = await oscService.getOSCById(user.id);
      if (data.data_fundacao) {
          data.data_fundacao = data.data_fundacao.split('T')[0];
      }
      setFormData(data);
    } catch (error) {
      console.error("Erro ao carregar:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await oscService.updateOSC(user.id, formData);
      setIsEditing(false);
      alert("Perfil atualizado com sucesso!");
    } catch (error) {
      alert("Erro ao salvar.");
    }
  };

  if (loading) return <div className={styles.loading}>Carregando...</div>;

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Editar Perfil</h1>

      {/* Banner de Aviso de Bloqueio */}
      {isDebt && (
        <div className={styles.debtAlert} style={{ 
          backgroundColor: '#fee2e2', 
          border: '1px solid #ef4444', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px', 
          color: '#b91c1c',
          fontWeight: '500'
        }}>
          <strong>⚠️ ACESSO RESTRITO:</strong> Identificamos uma pendência financeira. Seus módulos de documentos, biblioteca e modelos estão suspensos até a regularização no menu <strong>Financeiro</strong>.
        </div>
      )}

      <div className={styles.formCard}>
        <div className={styles.cardHeader}>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className={styles.editButton}>Editar Perfil</button>
          ) : (
            <button onClick={handleSave} className={styles.saveButton}>Salvar Alterações</button>
          )}
        </div>

        {/* ÁREA DE STATUS E ADESÃO */}
        <div className={styles.statusBanner} style={{ display: 'flex', gap: '20px', marginBottom: '30px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>SITUAÇÃO DA OSC</label>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: isDebt ? '#ef4444' : '#22c55e' }}>
                    {isDebt ? '🔴 PENDENTE (Inadimplente)' : '🟢 REGULAR'}
                </div>
            </div>
            <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>MEMBRO DESDE</label>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b' }}>
                    {user?.joined_at ? new Date(user.joined_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : 'Jan/2026'}
                </div>
            </div>
        </div>

        {/* 1. INFORMAÇÕES DA OSC */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>1. Informações da OSC</h3>
          <div className={styles.gridRow}>
            <InputField label="Nome Fantasia*" name="name" value={formData.name} onChange={handleChange} disabled={!isEditing} />
            <InputField label="Razão Social*" name="razao_social" value={formData.razao_social} onChange={handleChange} disabled={!isEditing} />
            <InputField label="CNPJ*" name="cnpj" value={formData.cnpj} disabled={true} />
            <InputField label="Data de Fundação" name="data_fundacao" type="date" value={formData.data_fundacao} onChange={handleChange} disabled={!isEditing} />
          </div>
        </div>

        {/* 2. CONTATO E ENDEREÇO */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>2. Contato e Endereço</h3>
          <div className={styles.gridRow}>
            <InputField label="E-mail de Contato*" name="email" value={formData.email} onChange={handleChange} disabled={!isEditing} />
            <InputField label="Telefone/Whatsapp*" name="phone" value={formData.phone} onChange={handleChange} disabled={!isEditing} />
            <InputField label="Website" name="website" value={formData.website} onChange={handleChange} disabled={!isEditing} />
            <InputField label="Instagram" name="instagram" value={formData.instagram} onChange={handleChange} disabled={!isEditing} />
            <InputField label="CEP*" name="cep" value={formData.cep} onChange={handleChange} disabled={!isEditing} />
            <InputField label="Logradouro*" name="address" value={formData.address} onChange={handleChange} disabled={!isEditing} />
            <InputField label="Número*" name="numero" value={formData.numero} onChange={handleChange} disabled={!isEditing} />
            <InputField label="Bairro*" name="bairro" value={formData.bairro} onChange={handleChange} disabled={!isEditing} />
            <InputField label="Cidade*" name="cidade" value={formData.cidade} onChange={handleChange} disabled={!isEditing} />
            <InputField label="Estado*" name="estado" value={formData.estado} onChange={handleChange} disabled={!isEditing} />
            <InputField label="País*" name="pais" value={formData.pais} onChange={handleChange} disabled={!isEditing} />
          </div>
        </div>

        {/* 3. RESPONSÁVEL LEGAL */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>3. Responsável Legal (Presidente)</h3>
          <div className={styles.gridRow}>
            <InputField label="Nome*" name="responsible" value={formData.responsible} onChange={handleChange} disabled={!isEditing} />
            <InputField label="CPF*" name="responsible_cpf" value={formData.responsible_cpf} onChange={handleChange} disabled={!isEditing} />
          </div>
        </div>

        {/* 4. COORDENADOR DO PROGRAMA */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>4. Coordenador do Programa (Usuário)</h3>
          <div className={styles.gridRow}>
            <InputField label="Nome Completo*" name="login_name" value={formData.name} disabled={true} />
            <InputField label="CPF do Coordenador*" name="login_cpf" value={formData.login_cpf} onChange={handleChange} disabled={!isEditing} />
            <InputField label="E-mail (Login)*" name="login_email" value={formData.login_email} onChange={handleChange} disabled={!isEditing} />
            <InputField label="Telefone*" name="login_phone" value={formData.login_phone} onChange={handleChange} disabled={!isEditing} />
          </div>
        </div>
      </div>
    </div>
  );
}