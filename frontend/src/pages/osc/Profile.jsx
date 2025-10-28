// src/pages/osc/Profile.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form'; // Importa RHF
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { IMaskInput } from 'react-imask'; // Importa Máscara
// Hooks
import { useAuth } from '../../hooks/useAuth.jsx';
import useApi from '../../hooks/useApi.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
// Serviços API
import * as oscService from '../../services/oscService.js';
// Componentes
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
// Estilos (Reutiliza o CSS do CreateOSCPage e o seu próprio)
import pageStyles from './OSCDashboard.module.css'; // Reutiliza estilo de card/página (ou Profile.module.css)
import formStyles from '../contador/CreateOSCPage.module.css'; // Reutiliza estilos do formulário grande

// --- Schema de Validação (Yup) ---
// Similar ao CreateOSCPage, mas sem a senha obrigatória
const schema = yup.object().shape({
  name: yup.string().required('O nome fantasia é obrigatório.'), // Vem da tabela users
  razao_social: yup.string().required('A razão social é obrigatória.'), // Tabela oscs
  cnpj: yup.string().required('O CNPJ é obrigatório.'), // Tabela oscs (não editável)
  data_fundacao: yup.date().nullable().transform((curr, orig) => orig === '' ? null : curr),
  
  email: yup.string().email('Email de contato inválido.').required('O email de contato é obrigatório.'), // Tabela oscs (email de contacto)
  phone: yup.string().required('O telefone é obrigatório.'), // Tabela oscs (telefone principal)
  website: yup.string().url('URL do website inválida.').nullable(),
  instagram: yup.string().nullable(),
  
  cep: yup.string().required('O CEP é obrigatório.'),
  address: yup.string().required('O endereço é obrigatório.'),
  numero: yup.string().required('O número é obrigatório.'),
  bairro: yup.string().required('O bairro é obrigatório.'),
  cidade: yup.string().required('A cidade é obrigatória.'),
  estado: yup.string().required('O estado é obrigatório.'),
  pais: yup.string().default('Brasil'),

  responsible: yup.string().required('O nome do responsável é obrigatório.'), // Tabela oscs
  responsible_cpf: yup.string().required('O CPF do responsável é obrigatório.'), // Tabela oscs
  
  // Dados do Coordenador (da tabela Users)
  login_name: yup.string().required('O nome do coordenador é obrigatório.'), // Mapeado para users.name
  login_cpf: yup.string().required('O CPF do coordenador é obrigatório.'), // Mapeado para users.cpf
  login_email: yup.string().email('Email de login inválido.').required('O email de login é obrigatório.'), // Mapeado para users.email
  login_phone: yup.string().required('O telefone do coordenador é obrigatório.'), // Mapeado para users.phone
  // Senha não é editada aqui
});

// --- Componentes Helper RHF (Input simples e Máscara) ---
const RHFInput = React.memo(({ label, id, error, type = "text", ...props }) => (
    <div className={formStyles.field}>
        <label htmlFor={id} className={formStyles.formLabel}>{label}</label>
        <input id={id} type={type} {...props} className={`${formStyles.formInput} ${error ? formStyles.formInputError : ''}`} />
        {error && <span className={formStyles.errorMessage}>{error.message}</span>}
    </div>
));

const RHFMaskedInput = React.memo(({ control, name, label, id, mask, placeholder, error, onBlurCEP = () => {}, ...props }) => (
     <div className={formStyles.field}>
        <label htmlFor={id} className={formStyles.formLabel}>{label}</label>
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <IMaskInput
                    {...field}
                    mask={mask}
                    id={id}
                    placeholder={placeholder}
                    onBlur={onBlurCEP}
                    className={`${formStyles.formInput} ${error ? formStyles.formInputError : ''}`}
                    disabled={props.disabled} // Passa disabled
                />
            )}
        />
        {error && <span className={formStyles.errorMessage}>{error.message}</span>}
    </div>
));
// --- Fim Componentes Helper ---

export default function OSCProfilePage() {
  const { user, login } = useAuth(); // 'login' para atualizar o contexto
  const addNotification = useNotification();
  const navigate = useNavigate();

  // Estado para controlar modo de edição
  const [isEditing, setIsEditing] = useState(false);
  
  // Hook para buscar dados
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errorLoading, setErrorLoading] = useState(null);

  // Hook para salvar (atualizar)
  const { request: updateProfile, isLoading: isSaving } = useApi(oscService.updateOSC);

  // Configuração RHF
  const { register, handleSubmit, control, setValue, clearErrors, reset, formState: { errors, isDirty } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {} // Inicia vazio, será preenchido pelo useEffect
  });

  // --- Efeito para Buscar Dados da API ---
  useEffect(() => {
    if (!user?.id) return; // Espera o user estar disponível

    const fetchProfileData = async () => {
      setIsLoadingData(true);
      setErrorLoading(null);
      try {
        const response = await oscService.getOSCById(user.id);
        const profileData = response.data;
        
        // Preenche o react-hook-form com os dados da API
        reset({
            name: profileData.name, // users.name
            razao_social: profileData.razao_social,
            cnpj: profileData.cnpj,
            data_fundacao: profileData.data_fundacao ? new Date(profileData.data_fundacao).toISOString().split('T')[0] : null, // Formata data
            
            email: profileData.email, // oscs.email (contacto)
            phone: profileData.phone, // oscs.phone (principal)
            website: profileData.website,
            instagram: profileData.instagram,
            cep: profileData.cep,
            address: profileData.address,
            numero: profileData.numero,
            bairro: profileData.bairro,
            cidade: profileData.cidade,
            estado: profileData.estado,
            pais: profileData.pais,

            responsible: profileData.responsible, // oscs.responsible
            responsible_cpf: profileData.responsible_cpf,

            login_name: profileData.name, // users.name (o backend usa 'name' para o coordenador)
            login_cpf: profileData.login_cpf, // users.cpf
            login_email: profileData.login_email, // users.email (login)
            login_phone: profileData.login_phone, // users.phone
        });
      } catch (err) {
        console.error("Erro ao buscar dados do perfil:", err);
        setErrorLoading(err.response?.data?.message || "Não foi possível carregar os dados do perfil.");
        addNotification("Erro ao carregar perfil.", "error");
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchProfileData();
  }, [user?.id, addNotification, reset]); // 'reset' é estável

  // Handler Busca CEP
  const handleCepBlur = async (e) => { /* ... (mesma lógica do CreateOSCPage) ... */ };

  // Handler Submissão (Salvar)
  const onSubmit = async (data) => {
    console.log("A salvar dados:", data);
    try {
      // O backend espera 'login_email', 'login_cpf', etc. para a tabela users
      // e os outros campos para a tabela oscs. O 'data' já está nesse formato.
      const updatedOSCResponse = await updateProfile(user.id, data);
      const updatedOSC = updatedOSCResponse; // API retorna dados atualizados

      addNotification('Perfil salvo com sucesso!', 'success');
      
      // Atualiza o AuthContext com o novo nome/email (se mudou)
      login({ user: updatedOSC, token: localStorage.getItem('token') });
      
      // Reseta o formulário para os novos valores (limpa 'isDirty')
      reset(updatedOSC); 
      setIsEditing(false); // Sai do modo de edição
    } catch (err) {
       console.error('Falha ao salvar perfil:', err);
       addNotification(`Falha ao salvar: ${err.response?.data?.message || err.message}`, 'error');
    }
  };
  
  // Handler Cancelar
  const handleCancel = () => {
    reset(); // Reseta para os valores originais (buscados da API)
    setIsEditing(false);
  };

  // --- Renderização ---
  if (isLoadingData) {
    return (
      <div className={pageStyles.pageContainer}> {/* Reutiliza estilo da pág. dashboard */}
        <div className={pageStyles.card} style={{ textAlign: 'center' }}>
          <Spinner text="Carregando perfil..." />
        </div>
      </div>
    );
  }
  if (errorLoading) {
      return <div className={pageStyles.pageContainer} style={{ color: 'red', textAlign: 'center' }}>{errorLoading}</div>;
  }

  return (
    <div className={pageStyles.pageContainer}>
      {/* Usamos handleSubmit do RHF, mas onSubmit só é chamado se 'isEditing' for true */}
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Usamos o estilo de card do Dashboard (ou Profile.module.css) */}
        <div className={pageStyles.card} style={{ textAlign: 'left' }}>
          
          <div className={formStyles.formHeader} style={{ borderBottom: 'none', marginBottom: 0 }}> {/* Reutiliza estilo do form */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h1 className={formStyles.title} style={{ marginBottom: 0 }}>Meu Perfil</h1>
              {!isEditing && (
                <Button variant="primary" onClick={() => setIsEditing(true)}>
                  Editar Perfil
                </Button>
              )}
            </div>
          </div>

          {/* O formulário é sempre renderizado, mas os campos são desabilitados
              se 'isEditing' for false. */}

          {/* --- Secção 1: Informações da OSC --- */}
          <section className={formStyles.formSection} style={{ boxShadow: 'none', padding: '1.5rem 0 0 0' }}>
            <h2 className={formStyles.sectionTitle}>1. Informações da OSC</h2>
            <div className={formStyles.grid}>
              <RHFInput label="Nome Fantasia *" id="name" registerProps={register('name')} error={errors.name} disabled={!isEditing} />
              <RHFInput label="Razão Social *" id="razao_social" registerProps={register('razao_social')} error={errors.razao_social} disabled={!isEditing} />
              <RHFMaskedInput control={control} name="cnpj" label="CNPJ *" id="cnpj" mask="00.000.000/0000-00" error={errors.cnpj} disabled /> {/* CNPJ não pode ser editado */}
              <RHFInput label="Data de Fundação" id="data_fundacao" type="date" registerProps={register('data_fundacao')} error={errors.data_fundacao} disabled={!isEditing} />
            </div>
          </section>

          {/* --- Secção 3: Contato e Endereço --- */}
          <section className={formStyles.formSection} style={{ boxShadow: 'none', padding: '1.5rem 0 0 0' }}>
            <h2 className={formStyles.sectionTitle}>3. Contato e Endereço</h2>
            <div className={formStyles.grid}>
              <RHFInput label="E-mail de Contato *" id="email" type="email" registerProps={register('email')} error={errors.email} disabled={!isEditing} />
              <RHFMaskedInput control={control} name="phone" label="Telefone / WhatsApp *" id="phone" mask="(00) 00000-0000" error={errors.phone} placeholder="(00) 00000-0000" disabled={!isEditing} />
              <RHFInput label="Website" id="website" type="url" registerProps={register('website')} error={errors.website} placeholder="https://..." disabled={!isEditing} />
              <RHFInput label="Instagram" id="instagram" registerProps={register('instagram')} error={errors.instagram} placeholder="@seu_perfil" disabled={!isEditing} />
              <RHFMaskedInput control={control} name="cep" label="CEP *" id="cep" mask="00000-000" error={errors.cep} onBlurCEP={handleCepBlur} placeholder="XXXXX-XXX" disabled={!isEditing} />
              <RHFInput label="Endereço *" id="endereco" registerProps={register('endereco')} error={errors.endereco} disabled={!isEditing} />
              <RHFInput label="Número *" id="numero" registerProps={register('numero')} error={errors.numero} disabled={!isEditing} />
              <RHFInput label="Bairro *" id="bairro" registerProps={register('bairro')} error={errors.bairro} disabled={!isEditing} />
              <RHFInput label="Cidade *" id="cidade" registerProps={register('cidade')} error={errors.cidade} disabled={!isEditing} />
              <RHFInput label="Estado *" id="estado" registerProps={register('estado')} error={errors.estado} disabled={!isEditing} />
              <RHFInput label="País" id="pais" registerProps={register('pais')} error={errors.pais} disabled />
            </div>
          </section>
          
          {/* --- Secção 4: Responsável Legal --- */}
          <section className={formStyles.formSection} style={{ boxShadow: 'none', padding: '1.5rem 0 0 0' }}>
               <h2 className={formStyles.sectionTitle}>4. Responsável Legal (Presidente)</h2>
               <div className={formStyles.grid}>
                  <RHFInput label="Nome *" id="responsible" registerProps={register('responsible')} error={errors.responsible} disabled={!isEditing} />
                  <RHFMaskedInput control={control} name="responsible_cpf" label="CPF *" id="responsible_cpf" mask="000.000.000-00" error={errors.responsible_cpf} placeholder="000.000.000-00" disabled={!isEditing} />
               </div>
          </section>

          {/* --- Secção 5: Coordenador (Utilizador) --- */}
           <section className={formStyles.formSection} style={{ boxShadow: 'none', padding: '1.5rem 0 0 0' }}>
               <h2 className={formStyles.sectionTitle}>5. Coordenador do Programa (Utilizador)</h2>
               <div className={formStyles.grid}>
                  <RHFInput label="Nome Completo do Coordenador *" id="login_name" registerProps={register('login_name')} error={errors.login_name} disabled={!isEditing} />
                  <RHFMaskedInput control={control} name="login_cpf" label="CPF do Coordenador *" id="login_cpf" mask="000.000.000-00" error={errors.login_cpf} placeholder="000.000.000-00" disabled={!isEditing} />
                  <RHFInput label="E-mail do Coordenador (login) *" id="login_email" type="email" registerProps={register('login_email')} error={errors.login_email} disabled={!isEditing} />
                  <RHFMaskedInput control={control} name="login_phone" label="Telefone do Coordenador *" id="login_phone" mask="(00) 00000-0000" error={errors.login_phone} placeholder="(00) 00000-0000" disabled={!isEditing} />
                  {/* (Não mostramos/editamos a senha aqui, isso seria numa página separada "Alterar Senha") */}
               </div>
           </section>

          {/* Ações (Salvar/Cancelar) - Só aparecem no modo de edição */}
          {isEditing && (
            <div className={formStyles.formActions}>
              <Button type="button" variant="secondary" onClick={handleCancel} disabled={isSaving}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={isSaving || !isDirty}>
                {isSaving ? <Spinner size="sm" className="mr-2" /> : null}
                {isSaving ? 'Guardando...' : 'Guardar Alterações'}
              </Button>
            </div>
          )}

        </div>
      </form>
    </div>
  );
}