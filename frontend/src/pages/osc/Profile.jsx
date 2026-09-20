import React, { useState, useEffect } from 'react';
import ReplayTutorial from '../../components/onboarding/ReplayTutorial.jsx';
import { useForm, Controller } from 'react-hook-form';
import { IMaskInput } from 'react-imask';
import api from '../../services/api.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import Button from '../../components/ui/Button.jsx';
import Card, { CardBody, CardHeader } from '../../components/ui/Card.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { FiSave, FiCheckCircle, FiBriefcase, FiFileText, FiShield, FiUsers, FiKey } from 'react-icons/fi';
import styles from './Profile.module.css';

export default function OSCProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const addNotification = useNotification();
  const { register, handleSubmit, control, reset, setValue } = useForm();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/oscs/me');
        const data = response.data.osc || response.data[0] || response.data;
        
        if (data.data_fundacao) data.data_fundacao = data.data_fundacao.split('T')[0];
        if (data.fim_mandato) data.fim_mandato = data.fim_mandato.split('T')[0];
        if (data.data_origem_estatuto) data.data_origem_estatuto = data.data_origem_estatuto.split('T')[0];

        // Transição de dados antigos para os novos
        if (!data.resp_nome && data.responsible) data.resp_nome = data.responsible;
        if (!data.resp_cpf && data.responsible_cpf) data.resp_cpf = data.responsible_cpf;

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
          setValue('address', data.logradouro);
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
      addNotification("Perfil da Organização atualizado com sucesso!", "success");
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

  if (isLoading) return <div className={styles.loadingContainer}><Spinner text="A carregar perfil..." /></div>;

  return (
    <div className={styles.pageContainer}>
      
      <div className={styles.header}>
        <FiCheckCircle className={styles.headerIcon} />
        <div>
          <h1 className={styles.pageTitle}>Perfil da Organização</h1>
          <p className={styles.pageSubtitle}>Complete o Checklist de Implantação para garantir a regularidade contábil e jurídica.</p>
        </div>
      <ReplayTutorial />
      </div>

      <div className={styles.formContainer}>
        
        <form id="profile-form" onSubmit={handleSubmit(onSubmitProfile)} className={styles.formContainer}>
          
          {/* BLOCO 1: IDENTIFICAÇÃO BÁSICA */}
          <Card padding="none" className={styles.sectionCard} style={{borderTopColor: 'var(--primary-color)'}}>
            <CardHeader 
              className={styles.sectionHeader} 
              title={<span className={styles.sectionTitle}><FiBriefcase /> 1. Identificação Básica</span>} 
            />
            <CardBody className={styles.sectionBody}>
              <div className={styles.gridColsAuto}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Razão Social</label>
                  <input {...register('razao_social')} className={styles.formInput} disabled />
                  <span className={styles.formHint}>Para alterar a Razão Social, contate o contador.</span>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Nome Fantasia</label>
                  <input {...register('name')} placeholder="Nome público da OSC" className={styles.formInput} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>CNPJ</label>
                  <input {...register('cnpj')} className={styles.formInput} disabled />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Natureza Jurídica</label>
                  <select {...register('natureza_juridica')} className={styles.formInput}>
                    <option value="">Selecione...</option>
                    <option value="Associação sem fins lucrativos">Associação sem fins lucrativos</option>
                    <option value="Organização da Sociedade Civil (OSC)">Organização da Sociedade Civil (OSC)</option>
                    <option value="OSCIP">OSCIP</option>
                    <option value="Cooperativa">Cooperativa</option>
                    <option value="Grupo Produtivo Informal">Grupo Produtivo Informal</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Atividade Principal</label>
                  <input {...register('atividade_principal')} placeholder="Ex: Assistência Social" className={styles.formInput} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Data de Fundação</label>
                  <input type="date" {...register('data_fundacao')} className={styles.formInput} />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* BLOCO 2: LOCALIZAÇÃO E CONTATOS */}
          <Card padding="none" className={styles.sectionCard} style={{borderTopColor: 'var(--primary-color)'}}>
            <CardHeader 
              className={styles.sectionHeader} 
              title={<span className={styles.sectionTitle}><FiBriefcase /> 2. Localização e Contatos Institucionais</span>} 
            />
            <CardBody className={styles.sectionBody}>
              <div className={styles.gridColsAuto} style={{marginBottom: '20px'}}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>CEP</label>
                  <Controller name="cep" control={control} render={({ field }) => (
                    <IMaskInput {...field} mask="00000-000" onBlur={(e) => { field.onBlur(e); handleCepBlur(e); }} className={styles.formInput} />
                  )} />
                </div>
                <div className={`${styles.formGroup} ${styles.spanTwo}`}>
                  <label className={styles.formLabel}>Logradouro (Endereço Sede)</label>
                  <input {...register('address')} className={styles.formInput} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Número</label>
                  <input {...register('numero')} className={styles.formInput} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Bairro</label>
                  <input {...register('bairro')} className={styles.formInput} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Cidade</label>
                  <input {...register('cidade')} className={styles.formInput} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Estado</label>
                  <input {...register('estado')} className={styles.formInput} />
                </div>
              </div>

              <div className={styles.highlightBox}>
                <div className={styles.gridColsAuto}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>E-mail Geral</label>
                    <input type="email" {...register('email')} className={styles.formInput} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Telefone Geral</label>
                    <Controller name="phone" control={control} render={({ field }) => (
                      <IMaskInput {...field} mask="(00) 00000-0000" className={styles.formInput} />
                    )} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Website</label>
                    <input {...register('website')} placeholder="https://..." className={styles.formInput} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Instagram / Redes</label>
                    <input {...register('instagram')} placeholder="@suaong" className={styles.formInput} />
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* BLOCO 3: RESPONSÁVEIS */}
          <Card padding="none" className={styles.sectionCard} style={{borderTopColor: 'var(--primary-color)'}}>
            <CardHeader 
              className={styles.sectionHeader} 
              title={<span className={styles.sectionTitle}><FiUsers /> 3. Responsáveis e Gestão</span>} 
            />
            <CardBody className={styles.sectionBody}>
              <div className={styles.gridColsTwo}>
                <div className={styles.responsibleBox}>
                  <h3 className={styles.responsibleTitle}>Responsável Legal (Presidente)</h3>
                  <div className={styles.formGroup} style={{marginBottom: '12px'}}>
                    <label className={styles.formLabel}>Nome Completo</label>
                    <input {...register('resp_nome')} className={styles.formInput} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>CPF</label>
                    <Controller name="resp_cpf" control={control} render={({ field }) => (
                      <IMaskInput {...field} mask="000.000.000-00" className={styles.formInput} />
                    )} />
                  </div>
                </div>

                <div className={styles.managerBox}>
                  <h3 className={styles.managerTitle}>Gestor / Coordenador</h3>
                  <div className={styles.formGroup} style={{marginBottom: '12px'}}>
                    <label className={styles.formLabel}>Nome Completo</label>
                    <input {...register('gestor_nome')} className={styles.formInput} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>CPF</label>
                    <Controller name="gestor_cpf" control={control} render={({ field }) => (
                      <IMaskInput {...field} mask="000.000.000-00" className={styles.formInput} />
                    )} />
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* BLOCO 4: FISCAL */}
          <Card padding="none" className={styles.sectionCard} style={{borderTopColor: 'var(--primary-color)'}}>
            <CardHeader 
              className={styles.sectionHeader} 
              title={<span className={styles.sectionTitle}><FiFileText /> 4. Informações Fiscais</span>} 
            />
            <CardBody className={styles.sectionBody}>
              <div className={styles.gridColsAuto} style={{marginBottom: '20px'}}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Inscrição Municipal</label>
                  <input {...register('inscricao_municipal')} placeholder="Apenas números, se houver" className={styles.formInput} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Inscrição Estadual</label>
                  <input {...register('inscricao_estadual')} placeholder="Apenas números, se houver" className={styles.formInput} />
                </div>
              </div>

              <div className={styles.highlightBox}>
                <div className={styles.gridColsAuto}>
                  <label className={styles.checkboxLabel}><input type="checkbox" {...register('presta_servico')} className={styles.checkboxInput} /> A organização presta serviços?</label>
                  <label className={styles.checkboxLabel}><input type="checkbox" {...register('vende_mercadorias')} className={styles.checkboxInput} /> A organização vende mercadorias?</label>
                  <label className={styles.checkboxLabel}><input type="checkbox" {...register('emite_nfse')} className={styles.checkboxInput} /> Costuma emitir NFS-e?</label>
                  <label className={styles.checkboxLabel}><input type="checkbox" {...register('emite_nfe')} className={styles.checkboxInput} /> Costuma emitir NF-e?</label>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* BLOCO 5: GOVERNANÇA */}
          <Card padding="none" className={styles.sectionCard} style={{borderTopColor: 'var(--primary-color)'}}>
            <CardHeader 
              className={styles.sectionHeader} 
              title={<span className={styles.sectionTitle}><FiShield /> 5. Governança e Financeiro</span>} 
            />
            <CardBody className={styles.sectionBody}>
              <div className={styles.gridColsAuto}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Data do Último Estatuto Social</label>
                  <input type="date" {...register('data_origem_estatuto')} className={styles.formInput} />
                  <span className={styles.formHintImportant}>Esta data define o início do Calendário de Conformidade.</span>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Término do Mandato Atual da Diretoria</label>
                  <input type="date" {...register('fim_mandato')} className={styles.formInput} />
                  <span className={styles.formHint}>O sistema avisará sobre as novas eleições 60 dias antes.</span>
                </div>
              </div>

              <div className={styles.highlightBox} style={{marginTop: '20px'}}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" {...register('banco_cadastrado')} className={styles.checkboxInput} />
                  A Organização possui conta bancária ativa no seu próprio CNPJ?
                </label>
              </div>
            </CardBody>
          </Card>

          <div className={styles.submitAction}>
            <Button 
              type="submit" 
              form="profile-form" 
              variant="primary" 
              loading={isSaving}
              icon={!isSaving && <FiSave />}
              size="lg"
            >
              {isSaving ? 'A salvar perfil...' : 'Salvar Perfil da Organização'}
            </Button>
          </div>
        </form>

        {/* SECURITY SECTION */}
        <Card padding="none" className={`${styles.sectionCard} ${styles.securitySection}`}>
          <CardHeader 
            className={styles.sectionHeader} 
            title={<span className={`${styles.sectionTitle} ${styles.securityTitle}`}><FiKey /> Segurança: Alterar Senha</span>} 
          />
          <CardBody className={styles.sectionBody}>
            <form onSubmit={handlePasswordChange}>
              <div className={styles.gridColsAuto}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Nova Senha</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 8 caracteres" className={styles.formInput} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Confirmar Nova Senha</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repita a nova senha" className={styles.formInput} />
                </div>
              </div>
              <div className={styles.submitAction}>
                <Button 
                  type="submit" 
                  loading={isChangingPassword}
                  style={{ backgroundColor: 'var(--color-danger)', color: 'white' }}
                >
                  {isChangingPassword ? 'Atualizando...' : 'Atualizar Senha de Acesso'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

      </div>
    </div>
  );
}