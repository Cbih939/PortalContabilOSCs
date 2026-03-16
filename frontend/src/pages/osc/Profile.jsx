// src/pages/osc/Profile.jsx

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { IMaskInput } from 'react-imask';
import api from '../../services/api.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';

// --- Ícones Nativos ---
const SaveIcon = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
const CheckBadgeIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const BuildingIcon = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1v1H9V7zm5 0h1v1h-1V7zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1z" /></svg>;
const FiscalIcon = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg>;
const ShieldIcon = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
const UsersIcon = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const KeyIcon = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>;

export default function OSCProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Estados para a Senha
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const addNotification = useNotification();
  const { register, handleSubmit, control, reset, setValue } = useForm();

  // Buscar dados da OSC logada
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/oscs/me');
        const data = response.data.osc || response.data[0] || response.data;
        
        if (data.data_fundacao) data.data_fundacao = data.data_fundacao.split('T')[0];
        if (data.fim_mandato) data.fim_mandato = data.fim_mandato.split('T')[0];
        if (data.data_origem_estatuto) data.data_origem_estatuto = data.data_origem_estatuto.split('T')[0];

        const booleanFields = ['presta_servico', 'vende_mercadorias', 'emite_nfse', 'emite_nfe', 'banco_cadastrado'];
        booleanFields.forEach(field => {
            if (data[field] !== undefined) data[field] = !!data[field];
        });

        reset(data);
      } catch (error) {
        addNotification("Não foi possível carregar os dados da organização.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [reset, addNotification]);

  const handleCepBlur = async (e) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setValue('endereco', data.logradouro);
          setValue('bairro', data.bairro);
          setValue('cidade', data.localidade);
          setValue('estado', data.uf);
        }
      } catch (err) { console.error("Erro CEP", err); }
    }
  };

  const onSubmitProfile = async (data) => {
    setIsSaving(true);
    try {
      await api.put(`/oscs/${data.id}`, data);
      addNotification("Raio-X da Organização atualizado com sucesso!", "success");
    } catch (error) {
      addNotification("Erro ao salvar as informações. Tente novamente.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!newPassword) return addNotification("Digite a nova senha.", "error");
    if (newPassword !== confirmPassword) return addNotification("As senhas não coincidem.", "error");
    if (newPassword.length < 8) return addNotification("A senha deve ter pelo menos 8 caracteres.", "error");

    setIsChangingPassword(true);
    try {
      // Ajuste para a rota de alteração de senha da sua API de utilizadores
      await api.put('/users/change-password', { newPassword }); 
      addNotification("Senha alterada com sucesso!", "success");
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      addNotification("Erro ao alterar senha.", "error");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><Spinner text="Carregando Raio-X..." /></div>;

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <CheckBadgeIcon style={{ color: '#10b981', width: '32px', height: '32px' }} />
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>Raio-X da Organização</h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>Complete o Checklist de Implantação para garantir a regularidade contábil e jurídica.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* ========================================== */}
        {/* FORMULÁRIO DO PERFIL */}
        {/* ========================================== */}
        <form id="profile-form" onSubmit={handleSubmit(onSubmitProfile)} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* BLOCO 1: IDENTIFICAÇÃO BÁSICA */}
          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}><BuildingIcon /> 1. Identificação Básica</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Razão Social</label>
                <input {...register('razao_social')} style={inputStyle} disabled className="disabled-input" />
                <span style={hintStyle}>Para alterar a Razão Social, contate o contador.</span>
              </div>
              <div>
                <label style={labelStyle}>Nome Fantasia</label>
                <input {...register('name')} placeholder="Nome público da OSC" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>CNPJ</label>
                <input {...register('cnpj')} style={inputStyle} disabled className="disabled-input" />
              </div>
              <div>
                <label style={labelStyle}>Natureza Jurídica</label>
                <select {...register('natureza_juridica')} style={inputStyle}>
                  <option value="">Selecione...</option>
                  <option value="Associação sem fins lucrativos">Associação sem fins lucrativos</option>
                  <option value="Organização da Sociedade Civil (OSC)">Organização da Sociedade Civil (OSC)</option>
                  <option value="OSCIP">OSCIP</option>
                  <option value="Cooperativa">Cooperativa</option>
                  <option value="Grupo Produtivo Informal">Grupo Produtivo Informal</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Atividade Principal</label>
                <input {...register('atividade_principal')} placeholder="Ex: Assistência Social" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Data de Fundação</label>
                <input type="date" {...register('data_fundacao')} style={inputStyle} />
              </div>
            </div>
          </section>

          {/* BLOCO 2: LOCALIZAÇÃO E CONTATOS DA OSC */}
          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}><BuildingIcon /> 2. Localização e Contatos Institucionais</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>CEP</label>
                <Controller name="cep" control={control} render={({ field }) => (
                  <IMaskInput {...field} mask="00000-000" onBlur={(e) => { field.onBlur(e); handleCepBlur(e); }} style={inputStyle} />
                )} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Logradouro (Endereço Sede)</label>
                <input {...register('endereco')} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Número</label>
                <input {...register('numero')} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Bairro</label>
                <input {...register('bairro')} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Cidade</label>
                <input {...register('cidade')} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Estado</label>
                <input {...register('estado')} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
              <div>
                <label style={labelStyle}>E-mail Geral</label>
                <input type="email" {...register('email_contato')} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Telefone Geral</label>
                <Controller name="telefone" control={control} render={({ field }) => (
                  <IMaskInput {...field} mask="(00) 00000-0000" style={inputStyle} />
                )} />
              </div>
              <div>
                <label style={labelStyle}>Website</label>
                <input {...register('website')} placeholder="https://..." style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Instagram / Redes</label>
                <input {...register('instagram')} placeholder="@suaong" style={inputStyle} />
              </div>
            </div>
          </section>

          {/* BLOCO 3: RESPONSÁVEIS E GESTÃO */}
          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}><UsersIcon /> 3. Responsáveis e Gestão</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ backgroundColor: '#fffbeb', padding: '16px', borderRadius: '8px', border: '1px solid #fde68a' }}>
                <h3 style={{ fontSize: '14px', marginTop: 0, marginBottom: '12px', color: '#92400e' }}>Responsável Legal (Presidente)</h3>
                <div style={{ marginBottom: '12px' }}>
                  <label style={labelStyle}>Nome Completo</label>
                  <input {...register('resp_nome')} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>CPF</label>
                  <Controller name="resp_cpf" control={control} render={({ field }) => (
                    <IMaskInput {...field} mask="000.000.000-00" style={inputStyle} />
                  )} />
                </div>
              </div>

              <div style={{ backgroundColor: '#eff6ff', padding: '16px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                <h3 style={{ fontSize: '14px', marginTop: 0, marginBottom: '12px', color: '#1e40af' }}>Gestor / Coordenador</h3>
                <div style={{ marginBottom: '12px' }}>
                  <label style={labelStyle}>Nome Completo</label>
                  <input {...register('gestor_nome')} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>CPF</label>
                  <Controller name="gestor_cpf" control={control} render={({ field }) => (
                    <IMaskInput {...field} mask="000.000.000-00" style={inputStyle} />
                  )} />
                </div>
              </div>
            </div>
          </section>

          {/* BLOCO 4: FISCAL E TRIBUTÁRIO */}
          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}><FiscalIcon /> 4. Raio-X Fiscal</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>Inscrição Municipal</label>
                <input {...register('inscricao_municipal')} placeholder="Apenas números, se houver" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Inscrição Estadual</label>
                <input {...register('inscricao_estadual')} placeholder="Apenas números, se houver" style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <label style={checkboxLabelStyle}><input type="checkbox" {...register('presta_servico')} style={checkboxStyle} /> A organização presta serviços?</label>
              <label style={checkboxLabelStyle}><input type="checkbox" {...register('vende_mercadorias')} style={checkboxStyle} /> A organização vende mercadorias?</label>
              <label style={checkboxLabelStyle}><input type="checkbox" {...register('emite_nfse')} style={checkboxStyle} /> Costuma emitir NFS-e?</label>
              <label style={checkboxLabelStyle}><input type="checkbox" {...register('emite_nfe')} style={checkboxStyle} /> Costuma emitir NF-e?</label>
            </div>
          </section>

          {/* BLOCO 5: GOVERNANÇA E FINANCEIRO */}
          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}><ShieldIcon /> 5. Governança e Financeiro</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Data do Último Estatuto Social</label>
                <input type="date" {...register('data_origem_estatuto')} style={inputStyle} />
                <span style={{ fontSize: '11px', color: '#ea580c', fontWeight: 'bold' }}>Esta data define o início do Calendário de Conformidade.</span>
              </div>
              <div>
                <label style={labelStyle}>Término do Mandato Atual da Diretoria</label>
                <input type="date" {...register('fim_mandato')} style={inputStyle} />
                <span style={hintStyle}>O sistema avisará sobre as novas eleições 60 dias antes.</span>
              </div>
            </div>

            <div style={{ marginTop: '20px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <label style={checkboxLabelStyle}>
                <input type="checkbox" {...register('banco_cadastrado')} style={checkboxStyle} />
                A Organização possui conta bancária ativa no seu próprio CNPJ?
              </label>
            </div>
          </section>

          {/* BOTÃO DE SALVAR PERFIL */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <Button type="submit" form="profile-form" disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ea580c', color: '#fff', padding: '12px 24px', fontSize: '16px' }}>
              {isSaving ? <Spinner size="sm" /> : <SaveIcon />}
              {isSaving ? 'Salvando Raio-X...' : 'Salvar Raio-X da Organização'}
            </Button>
          </div>
        </form>

        <hr style={{ borderTop: '1px solid #e5e7eb', margin: '20px 0' }} />

        {/* ========================================== */}
        {/* FORMULÁRIO DE ALTERAÇÃO DE SENHA */}
        {/* ========================================== */}
        <form onSubmit={handlePasswordChange} style={{ ...sectionStyle, border: '1px solid #fca5a5' }}>
          <h2 style={{ ...sectionTitleStyle, color: '#b91c1c', borderBottomColor: '#fee2e2' }}><KeyIcon /> Segurança: Alterar Senha</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Nova Senha</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 8 caracteres" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Confirmar Nova Senha</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repita a nova senha" style={inputStyle} />
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <Button type="submit" disabled={isChangingPassword} style={{ backgroundColor: '#b91c1c', color: '#fff' }}>
              {isChangingPassword ? <Spinner size="sm" /> : 'Atualizar Senha de Acesso'}
            </Button>
          </div>
        </form>

      </div>

      <style>{`
        .disabled-input {
          background-color: #f3f4f6 !important;
          color: #6b7280 !important;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

// --- Variáveis de Estilo Inline ---
const sectionStyle = { backgroundColor: '#fff', borderRadius: '8px', padding: '24px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' };
const sectionTitleStyle = { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', color: '#374151', borderBottom: '2px solid #f3f4f6', paddingBottom: '12px', marginBottom: '20px', marginTop: 0 };
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#4b5563', marginBottom: '6px' };
const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '14px', color: '#1f2937', outline: 'none' };
const hintStyle = { fontSize: '11px', color: '#9ca3af' };
const checkboxLabelStyle = { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#374151', cursor: 'pointer', fontWeight: '500' };
const checkboxStyle = { width: '18px', height: '18px', accentColor: '#ea580c', cursor: 'pointer' };