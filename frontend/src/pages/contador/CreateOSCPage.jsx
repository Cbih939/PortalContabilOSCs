// src/pages/contador/CreateOSCPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import InputMask from 'react-input-mask';
import styles from './CreateOSCPage.module.css';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import useApi from '../../hooks/useApi.jsx';
import * as oscService from '../../services/oscService.js';
// Importa o componente Input.jsx para consistência (Opcional, requer refatoração do Input)
// Por simplicidade, usaremos inputs nativos estilizados via RHF

// --- Schema de Validação (Yup) ---
// (Define regras para os campos do formulário)
const schema = yup.object().shape({
  nomeFantasia: yup.string().required('O nome fantasia é obrigatório.'),
  razaoSocial: yup.string().required('A razão social é obrigatória.'),
  cnpj: yup.string().required('O CNPJ é obrigatório.').matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ inválido (Formato: 99.999.999/9999-99).'),
  dataFundacao: yup.date().nullable().transform((curr, orig) => orig === '' ? null : curr),
  
  emailContato: yup.string().email('Email de contato inválido.').required('O email de contato é obrigatório.'),
  telefone: yup.string().required('O telefone é obrigatório.'),
  website: yup.string().url('URL do website inválida.').nullable().transform((curr, orig) => orig === '' ? null : curr),
  instagram: yup.string().nullable().transform((curr, orig) => orig === '' ? null : curr),
  
  cep: yup.string().required('O CEP é obrigatório.').matches(/^\d{5}-\d{3}$/, 'CEP inválido (Formato: 99999-999).'),
  endereco: yup.string().required('O endereço é obrigatório.'),
  numero: yup.string().required('O número é obrigatório.'),
  bairro: yup.string().required('O bairro é obrigatório.'),
  cidade: yup.string().required('A cidade é obrigatória.'),
  estado: yup.string().required('O estado é obrigatório.'),
  pais: yup.string().default('Brasil'),

  respNome: yup.string().required('O nome do responsável é obrigatório.'),
  respCpf: yup.string().required('O CPF do responsável é obrigatório.').matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido (Formato: 999.999.999-99).'),
  
  coordNome: yup.string().required('O nome do coordenador é obrigatório.'),
  coordCpf: yup.string().required('O CPF do coordenador é obrigatório.').matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido (Formato: 999.999.999-99).'),
  coordEmail: yup.string().email('Email de login inválido.').required('O email de login é obrigatório.'),
  coordTelefone: yup.string().required('O telefone do coordenador é obrigatório.'),
  coordSenha: yup.string().required('A senha é obrigatória.').min(8, 'A senha deve ter no mínimo 8 caracteres.'),
});

// --- Componentes Helper RHF ---
// (Estilizados para parecer com Input.jsx)
const RHFInput = React.memo(({ label, id, error, type = "text", ...props }) => (
    <div className={styles.field}>
        <label htmlFor={id} className={styles.formLabel}>{label}</label>
        <input id={id} type={type} {...props} className={`${styles.formInput} ${error ? styles.formInputError : ''}`} />
        {error && <span className={styles.errorMessage}>{error.message}</span>}
    </div>
));

const RHFMaskedInput = React.memo(({ label, id, mask, error, onBlur = () => {}, ...props }) => (
     <div className={styles.field}>
        <label htmlFor={id} className={styles.formLabel}>{label}</label>
        <InputMask mask={mask} maskPlaceholder={null} {...props} onBlur={onBlur}>
            {(inputProps) => (
                <input {...inputProps} id={id} className={`${styles.formInput} ${error ? styles.formInputError : ''}`} />
            )}
        </InputMask>
        {error && <span className={styles.errorMessage}>{error.message}</span>}
    </div>
));
// --- Fim Componentes Helper ---


export default function CreateOSCPage() {
    const navigate = useNavigate();
    const addNotification = useNotification();
    const { request: createOSCRequest, isLoading } = useApi(oscService.createOSC);

    const { register, handleSubmit, control, setValue, clearErrors, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
        defaultValues: { pais: 'Brasil' } // Define valor padrão
    });

    // Handler Busca CEP (ViaCEP)
    const handleCepBlur = async (e) => {
        const cep = e.target.value.replace(/\D/g, ''); // Remove máscara
        if (cep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                if (!response.ok) throw new Error('CEP não encontrado');
                const data = await response.json();
                if (data.erro) throw new Error('CEP não localizado');
                
                // Preenche os campos
                setValue('endereco', data.logradouro, { shouldValidate: true });
                setValue('bairro', data.bairro, { shouldValidate: true });
                setValue('cidade', data.localidade, { shouldValidate: true });
                setValue('estado', data.uf, { shouldValidate: true });
                clearErrors(['endereco', 'bairro', 'cidade', 'estado']);
            } catch (err) {
                console.error("Erro ao buscar CEP", err);
                addNotification(err.message, 'error');
            }
        }
    };

    // Handler Submissão
    const onSubmit = async (data) => {
        console.log("Enviando formulário:", data);
        try {
            const newOSC = await createOSCRequest(data); // Chama API
            addNotification(`OSC "${newOSC.name}" criada com sucesso!`, 'success');
            navigate('/contador/oscs'); // Volta para a lista
        } catch (err) {
             console.error('Falha ao criar OSC:', err);
             // useApi já mostra notificação (ex: Email duplicado), mas podemos adicionar:
             addNotification(`Falha ao criar OSC: ${err.response?.data?.message || err.message}`, 'error');
        }
    };

    // (Secção 2. Documentos não implementada nesta fase)

    return (
        <div className={styles.pageContainer}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className={styles.formHeader}>
                    <h1 className={styles.title}>Cadastrar Nova Organização</h1>
                    <p className={styles.subtitle}>Preencha os dados abaixo para registar uma nova Organização da Sociedade Civil.</p>
                </div>

                {/* --- Secção 1: Informações da OSC --- */}
                <section className={styles.formSection}>
                    <h2 className={styles.sectionTitle}>1. Informações da OSC</h2>
                    <div className={styles.grid}>
                        <RHFInput label="Nome Fantasia da OSC *" id="nomeFantasia" {...register('nomeFantasia')} error={errors.nomeFantasia} />
                        <RHFInput label="Razão Social *" id="razaoSocial" {...register('razaoSocial')} error={errors.razaoSocial} />
                        <RHFMaskedInput label="CNPJ *" id="cnpj" mask="99.999.999/9999-99" {...register('cnpj')} error={errors.cnpj} placeholder="00.000.000/0000-00" />
                        <RHFInput label="Data de Fundação" id="dataFundacao" type="date" {...register('dataFundacao')} error={errors.dataFundacao} />
                    </div>
                </section>

                {/* --- Secção 3: Contato e Endereço --- */}
                <section className={styles.formSection}>
                    <h2 className={styles.sectionTitle}>3. Contato e Endereço</h2>
                    <div className={styles.grid}>
                        <RHFInput label="E-mail de Contato *" id="emailContato" type="email" {...register('emailContato')} error={errors.emailContato} />
                        <RHFMaskedInput label="Telefone / WhatsApp *" id="telefone" mask="(99) 99999-9999" {...register('telefone')} error={errors.telefone} placeholder="(00) 00000-0000" />
                        <RHFInput label="Website" id="website" type="url" {...register('website')} error={errors.website} placeholder="https://..." />
                        <RHFInput label="Instagram" id="instagram" {...register('instagram')} error={errors.instagram} placeholder="@seu_perfil" />
                        
                        <RHFMaskedInput label="CEP *" id="cep" mask="99999-999" {...register('cep')} error={errors.cep} onBlur={handleCepBlur} placeholder="XXXXX-XXX" />
                        <RHFInput label="Endereço *" id="endereco" {...register('endereco')} error={errors.endereco} />
                        <RHFInput label="Número *" id="numero" {...register('numero')} error={errors.numero} />
                        <RHFInput label="Bairro *" id="bairro" {...register('bairro')} error={errors.bairro} />
                        <RHFInput label="Cidade *" id="cidade" {...register('cidade')} error={errors.cidade} />
                        <RHFInput label="Estado *" id="estado" {...register('estado')} error={errors.estado} />
                        <RHFInput label="País" id="pais" {...register('pais')} error={errors.pais} disabled />
                    </div>
                </section>
                
                {/* --- Secção 4: Responsável Legal --- */}
                <section className={styles.formSection}>
                     <h2 className={styles.sectionTitle}>4. Responsável Legal (Presidente)</h2>
                     <div className={styles.grid}>
                        <RHFInput label="Nome *" id="respNome" {...register('respNome')} error={errors.respNome} />
                        <RHFMaskedInput label="CPF *" id="respCpf" mask="999.999.999-99" {...register('respCpf')} error={errors.respCpf} placeholder="000.000.000-00" />
                     </div>
                </section>

                {/* --- Secção 5: Coordenador (Utilizador OSC) --- */}
                 <section className={styles.formSection}>
                     <h2 className={styles.sectionTitle}>5. Coordenador do Programa (Utilizador)</h2>
                     <div className={styles.grid}>
                        <RHFInput label="Nome Completo do Coordenador *" id="coordNome" {...register('coordNome')} error={errors.coordNome} />
                        <RHFMaskedInput label="CPF do Coordenador *" id="coordCpf" mask="999.999.999-99" {...register('coordCpf')} error={errors.coordCpf} placeholder="000.000.000-00" />
                        <RHFInput label="E-mail do Coordenador (será o login) *" id="coordEmail" type="email" {...register('coordEmail')} error={errors.coordEmail} />
                        <RHFMaskedInput label="Telefone do Coordenador *" id="coordTelefone" mask="(99) 99999-9999" {...register('coordTelefone')} error={errors.coordTelefone} placeholder="(00) 00000-0000" />
                        <RHFInput label="Senha Provisória (Mín. 8 caracteres) *" id="coordSenha" type="password" {...register('coordSenha')} error={errors.coordSenha} />
                     </div>
                </section>

                {/* (Falta Secção 2: Upload de Documentos - pode ser adicionada depois) */}

                <div className={styles.submitContainer}>
                    <Button type="submit" variant="primary" size="lg" disabled={isLoading} style={{backgroundImage: 'linear-gradient(to right, #f97316, #ef4444)'}}>
                         {isLoading ? <Spinner size="sm" className="mr-2" /> : "Finalizar Cadastro da OSC"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

// Adicionar estilos de erro ao CreateOSCPage.module.css se necessário
/*
.formInputError {
  border-color: #ef4444;
}
.formInputError:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.3);
}
.errorMessage {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #dc2626;
}
*/