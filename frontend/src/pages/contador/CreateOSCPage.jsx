// src/pages/contador/CreateOSCPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form'; // <-- Importa o Controller
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { IMaskInput } from 'react-imask'; // <-- Importa o IMaskInput
import styles from './CreateOSCPage.module.css';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import FileUpload from '../../components/common/FileUpload.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import * as oscService from '../../services/oscService.js';
// (Opcional: ícones de senha)
// import { EyeIcon, EyeOffIcon } from '../../components/common/Icons.jsx';

// --- Schema de Validação (Yup) ---
// (Atualiza as máscaras para o formato do Yup)
const schema = yup.object().shape({
  nomeFantasia: yup.string().required('O nome fantasia é obrigatório.'),
  razaoSocial: yup.string().required('A razão social é obrigatória.'),
  cnpj: yup.string().required('O CNPJ é obrigatório.').matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ inválido.'),
  dataFundacao: yup.date().nullable().transform((curr, orig) => orig === '' ? null : curr),
  logotipo: yup.mixed().nullable(),
  ata: yup.mixed().nullable(),
  estatuto: yup.mixed().nullable(),
  emailContato: yup.string().email('Email de contato inválido.').required('O email de contato é obrigatório.'),
  telefone: yup.string().required('O telefone é obrigatório.'),
  website: yup.string().url('URL do website inválida.').nullable().transform((curr, orig) => orig === '' ? null : curr),
  instagram: yup.string().nullable().transform((curr, orig) => orig === '' ? null : curr),
  cep: yup.string().required('O CEP é obrigatório.').matches(/^\d{5}-\d{3}$/, 'CEP inválido.'),
  endereco: yup.string().required('O endereço é obrigatório.'),
  numero: yup.string().required('O número é obrigatório.'),
  bairro: yup.string().required('O bairro é obrigatório.'),
  cidade: yup.string().required('A cidade é obrigatória.'),
  estado: yup.string().required('O estado é obrigatório.'),
  pais: yup.string().default('Brasil'),
  respNome: yup.string().required('O nome do responsável é obrigatório.'),
  respCpf: yup.string().required('O CPF do responsável é obrigatório.').matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido.'),
  coordNome: yup.string().required('O nome do coordenador é obrigatório.'),
  coordCpf: yup.string().required('O CPF do coordenador é obrigatório.').matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido.'),
  coordEmail: yup.string().email('Email de login inválido.').required('O email de login é obrigatório.'),
  coordTelefone: yup.string().required('O telefone do coordenador é obrigatório.'),
  coordSenha: yup.string().required('A senha é obrigatória.').min(8, 'A senha deve ter no mínimo 8 caracteres.'),
});

// --- Componentes Helper RHF (Input simples e Máscara) ---
// RHFInput (Input simples)
const RHFInput = React.memo(({ label, id, error, type = "text", registerProps }) => (
    <div className={styles.field}>
        <label htmlFor={id} className={styles.formLabel}>{label}</label>
        <input id={id} type={type} {...registerProps} className={`${styles.formInput} ${error ? styles.formInputError : ''}`} />
        {error && <span className={styles.errorMessage}>{error.message}</span>}
    </div>
));

// RHFMaskedInput (ATUALIZADO para react-imask e Controller)
const RHFMaskedInput = React.memo(({ control, name, label, id, mask, placeholder, error, onBlurCEP = () => {}, ...props }) => (
     <div className={styles.field}>
        <label htmlFor={id} className={styles.formLabel}>{label}</label>
        <Controller
            name={name}
            control={control}
            render={({ field }) => ( // 'field' contém { onChange, onBlur, value, ref }
                <IMaskInput
                    {...field} // Passa props do RHF (value, onChange, etc.)
                    mask={mask}
                    id={id}
                    placeholder={placeholder}
                    onBlur={(e) => { field.onBlur(e); onBlurCEP(e); }} // Combina onBlur
                    className={`${styles.formInput} ${error ? styles.formInputError : ''}`}
                    disabled={props.disabled}
                />
            )}
        />
        {error && <span className={styles.errorMessage}>{error.message}</span>}
    </div>
));
// --- Fim Componentes Helper ---


export default function CreateOSCPage() {
    const navigate = useNavigate();
    const addNotification = useNotification();
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, control, setValue, clearErrors, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
        defaultValues: { pais: 'Brasil' }
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

    // Handler Submissão (Envia FormData)
    const onSubmit = async (data) => {
        setIsLoading(true);
        const formData = new FormData();
        
        for (const key in data) {
            if (data[key] !== null && data[key] !== undefined) {
                if (typeof data[key] !== 'object' || data[key] === null || !(data[key] instanceof File)) {
                    formData.append(key, data[key]);
                }
            }
        }
        if (data.logotipo && data.logotipo instanceof File) {
            formData.append('logotipo', data.logotipo);
        }
        if (data.ata && data.ata instanceof File) {
            formData.append('ata', data.ata);
        }
        if (data.estatuto && data.estatuto instanceof File) {
            formData.append('estatuto', data.estatuto);
        }

        try {
            const response = await oscService.createOSC(formData); 
            const newOSC = response.data;
            addNotification(`OSC "${newOSC.name}" criada com sucesso!`, 'success');
            navigate('/contador/oscs');
        } catch (err) {
             console.error('Falha ao criar OSC:', err);
             addNotification(`Falha ao criar OSC: ${err.response?.data?.message || err.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const pdfOnly = { 'application/pdf': ['.pdf'] };
    const imageOnly = { 'image/jpeg': [], 'image/png': [], 'image/gif': [] };

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
                        <RHFInput label="Nome Fantasia da OSC *" id="nomeFantasia" registerProps={register('nomeFantasia')} error={errors.nomeFantasia} />
                        <RHFInput label="Razão Social *" id="razaoSocial" registerProps={register('razaoSocial')} error={errors.razaoSocial} />
                        <RHFMaskedInput
                            control={control} name="cnpj"
                            label="CNPJ *" id="cnpj"
                            mask="00.000.000/0000-00" // Formato react-imask
                            error={errors.cnpj}
                            placeholder="00.000.000/0000-00"
                        />
                        <RHFInput label="Data de Fundação" id="dataFundacao" type="date" registerProps={register('dataFundacao')} error={errors.dataFundacao} />
                    </div>
                </section>

                {/* --- Secção 2: Documentos --- */}
                <section className={styles.formSection}>
                    <h2 className={styles.sectionTitle}>2. Documentos</h2>
                    <div className={styles.grid}>
                        <Controller
                            name="logotipo"
                            control={control}
                            render={({ field: { onChange } }) => (
                                <FileUpload
                                    label="Logotipo"
                                    onFileSelect={onChange}
                                    acceptedTypes={imageOnly}
                                    hint="JPG, PNG, GIF (máx. 5MB)"
                                />
                            )}
                        />
                        <Controller
                            name="ata"
                            control={control}
                            render={({ field: { onChange } }) => (
                                <FileUpload
                                    label="Última ATA (.pdf)"
                                    onFileSelect={onChange}
                                    acceptedTypes={pdfOnly}
                                    hint="Apenas .pdf (máx. 5MB)"
                                />
                            )}
                        />
                         <Controller
                            name="estatuto"
                            control={control}
                            render={({ field: { onChange } }) => (
                                <FileUpload
                                    label="Estatuto Social (.pdf)"
                                    onFileSelect={onChange}
                                    acceptedTypes={pdfOnly}
                                    hint="Apenas .pdf (máx. 5MB)"
                                />
                            )}
                        />
                    </div>
                </section>

                {/* --- Secção 3: Contato e Endereço --- */}
                <section className={styles.formSection}>
                    <h2 className={styles.sectionTitle}>3. Contato e Endereço</h2>
                    <div className={styles.grid}>
                        <RHFInput label="E-mail de Contato *" id="emailContato" type="email" registerProps={register('emailContato')} error={errors.emailContato} />
                        <RHFMaskedInput
                            control={control} name="telefone"
                            label="Telefone / WhatsApp *" id="telefone"
                            mask="(00) 00000-0000" // Formato react-imask
                            error={errors.telefone}
                            placeholder="(00) 00000-0000"
                        />
                        <RHFInput label="Website" id="website" type="url" registerProps={register('website')} error={errors.website} placeholder="https://..." />
                        <RHFInput label="Instagram" id="instagram" registerProps={register('instagram')} error={errors.instagram} placeholder="@seu_perfil" />
                        
                        <RHFMaskedInput
                            control={control} name="cep"
                            label="CEP *" id="cep"
                            mask="00000-000" // Formato react-imask
                            error={errors.cep}
                            onBlurCEP={handleCepBlur}
                            placeholder="XXXXX-XXX"
                        />
                        <RHFInput label="Endereço *" id="endereco" registerProps={register('endereco')} error={errors.endereco} />
                        <RHFInput label="Número *" id="numero" registerProps={register('numero')} error={errors.numero} />
                        <RHFInput label="Bairro *" id="bairro" registerProps={register('bairro')} error={errors.bairro} />
                        <RHFInput label="Cidade *" id="cidade" registerProps={register('cidade')} error={errors.cidade} />
                        <RHFInput label="Estado *" id="estado" registerProps={register('estado')} error={errors.estado} />
                        <RHFInput label="País" id="pais" registerProps={register('pais')} error={errors.pais} disabled />
                    </div>
                </section>
                
                {/* --- Secção 4: Responsável Legal --- */}
                <section className={styles.formSection}>
                     <h2 className={styles.sectionTitle}>4. Responsável Legal (Presidente)</h2>
                     <div className={styles.grid}>
                        <RHFInput label="Nome *" id="respNome" registerProps={register('respNome')} error={errors.respNome} />
                        <RHFMaskedInput
                            control={control} name="respCpf"
                            label="CPF *" id="respCpf"
                            mask="000.000.000-00" // Formato react-imask
                            error={errors.respCpf}
                            placeholder="000.000.000-00"
                        />
                     </div>
                </section>

                {/* --- Secção 5: Coordenador (Utilizador OSC) --- */}
                 <section className={styles.formSection}>
                     <h2 className={styles.sectionTitle}>5. Coordenador do Programa (Utilizador)</h2>
                     <div className={styles.grid}>
                        <RHFInput label="Nome Completo do Coordenador *" id="coordNome" registerProps={register('coordNome')} error={errors.coordNome} />
                        <RHFMaskedInput
                            control={control} name="coordCpf"
                            label="CPF do Coordenador *" id="coordCpf"
                            mask="000.000.000-00" // Formato react-imask
                            error={errors.coordCpf}
                            placeholder="000.000.000-00"
                        />
                        <RHFInput label="E-mail do Coordenador (será o login) *" id="coordEmail" type="email" registerProps={register('coordEmail')} error={errors.coordEmail} />
                        <RHFMaskedInput
                            control={control} name="coordTelefone"
                            label="Telefone do Coordenador *" id="coordTelefone"
                            mask="(00) 00000-0000" // Formato react-imask
                            error={errors.coordTelefone}
                            placeholder="(00) 00000-0000"
                        />
                        <RHFInput label="Senha Provisória (Mín. 8 caracteres) *" id="coordSenha" type="password" registerProps={register('coordSenha')} error={errors.coordSenha} />
                     </div>
                </section>

                {/* --- Submissão --- */}
                <div className={styles.submitContainer}>
                    <Button type="submit" variant="primary" size="lg" disabled={isLoading} style={{backgroundImage: 'linear-gradient(to right, #f97316, #ef4444)'}}>
                         {isLoading ? <Spinner size="sm" className="mr-2" /> : "Finalizar Cadastro da OSC"}
                    </Button>
                </div>
            </form>
        </div>
    );
}