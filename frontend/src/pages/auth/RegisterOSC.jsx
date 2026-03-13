import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { IMaskInput } from 'react-imask';
import styles from './RegisterOSC.module.css';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import FileUpload from '../../components/common/FileUpload.jsx';
import api from '@/services/api';

// --- Schema de Validação ---
const schema = yup.object().shape({
  nomeFantasia: yup.string().required('O nome fantasia é obrigatório.'),
  razaoSocial: yup.string().required('A razão social é obrigatória.'),
  cnpj: yup.string().required('O CNPJ é obrigatório.').matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ inválido.'),
  dataFundacao: yup.date().nullable().transform((curr, orig) => orig === '' ? null : curr),
  dataOrigemEstatuto: yup.date().nullable().transform((curr, orig) => orig === '' ? null : curr),
  
  // NOVO: Validação restrita de Tamanho (5MB) e Tipo (.png)
  logotipo: yup.mixed()
    .nullable()
    .test('fileSize', 'O arquivo deve ter no máximo 5MB.', (value) => {
      if (!value) return true; // Se não enviou nada, passa (pois é opcional)
      const size = value.size || (value[0] && value[0].size); // Trata objeto File ou Array
      return !size || size <= 5 * 1024 * 1024;
    })
    .test('fileType', 'Somente arquivos .png são permitidos.', (value) => {
      if (!value) return true;
      const type = value.type || (value[0] && value[0].type);
      return !type || type === 'image/png';
    }),
    
  estatuto: yup.mixed().nullable(),
  emailContato: yup.string().email('Email inválido.').required('O email de contato é obrigatório.'),
  telefone: yup.string().required('O telefone é obrigatório.'),
  cep: yup.string().required('CEP obrigatório.').matches(/^\d{5}-\d{3}$/, 'CEP inválido.'),
  endereco: yup.string().required('Endereço obrigatório.'),
  numero: yup.string().required('Número obrigatório.'),
  bairro: yup.string().required('Bairro obrigatório.'),
  cidade: yup.string().required('Cidade obrigatória.'),
  estado: yup.string().required('Estado obrigatório.'),
  respNome: yup.string().required('Nome do responsável obrigatório.'),
  respCpf: yup.string().required('CPF do responsável obrigatório.').matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido.'),
  coordNome: yup.string().required('Nome do responsável obrigatório.'),
  coordEmail: yup.string().email('Email inválido.').required('Email de login obrigatório.'),
  coordSenha: yup.string().required('Senha obrigatória.').min(8, 'Mínimo 8 caracteres.'),
  aceiteTermos: yup.boolean()
    .oneOf([true], 'Você precisa aceitar os Termos de Uso e a Política de Privacidade para continuar.')
    .required('Aceite obrigatório.'),
});

const RHFInput = React.memo(({ label, id, error, type = "text", registerProps, placeholder }) => (
    <div className={styles.field}>
        <label htmlFor={id} className={styles.formLabel}>{label}</label>
        <input id={id} type={type} {...registerProps} placeholder={placeholder} className={`${styles.formInput} ${error ? styles.formInputError : ''}`} />
        {error && <span className={styles.errorMessage}>{error.message}</span>}
    </div>
));

const RHFMaskedInput = React.memo(({ control, name, label, id, mask, placeholder, error, onBlurCEP = () => {} }) => (
     <div className={styles.field}>
        <label htmlFor={id} className={styles.formLabel}>{label}</label>
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <IMaskInput
                    {...field}
                    mask={mask}
                    id={id}
                    placeholder={placeholder}
                    onBlur={(e) => { field.onBlur(e); onBlurCEP(e); }}
                    className={`${styles.formInput} ${error ? styles.formInputError : ''}`}
                />
            )}
        />
        {error && <span className={styles.errorMessage}>{error.message}</span>}
    </div>
));

export default function RegisterOSC() {
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, control, setValue, clearErrors, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
        defaultValues: { pais: 'Brasil', aceiteTermos: false }
    });

    const handleCepBlur = async (e) => {
        const cep = e.target.value.replace(/\D/g, '');
        if (cep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    setValue('endereco', data.logradouro, { shouldValidate: true });
                    setValue('bairro', data.bairro, { shouldValidate: true });
                    setValue('cidade', data.localidade, { shouldValidate: true });
                    setValue('estado', data.uf, { shouldValidate: true });
                    clearErrors(['endereco', 'bairro', 'cidade', 'estado']);
                }
            } catch (err) { console.error("Erro CEP", err); }
        }
    };

    const onSubmit = async (data) => {
        setIsLoading(true);
        const formData = new FormData();
        
        const dataContratoAutomatica = new Date().toISOString().split('T')[0];
        formData.append('data_contrato_conta_comigo', dataContratoAutomatica);

        Object.keys(data).forEach(key => {
            if (key === 'aceiteTermos') return; 

            if (data[key] instanceof File) {
                formData.append(key, data[key]);
            } else if (data[key] instanceof Date && !isNaN(data[key])) {
                formData.append(key, data[key].toISOString().split('T')[0]);
            } else if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });

        try {
            const response = await api.post('/auth/register-osc', formData);
            const { token } = response.data;

            const paymentRes = await api.post('/webhooks/create-checkout-session', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (paymentRes.data.url) {
                window.location.href = paymentRes.data.url;
            }
        } catch (err) {
            alert(`Falha no cadastro: ${err.response?.data?.message || err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <h1 className={styles.title}>Cadastre sua OSC</h1>
                <p className={styles.subtitle}>Após o cadastro, você será redirecionado para a ativação do seu plano.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className={styles.formContainer}>
                {/* Secção 1: Dados da OSC */}
                <section className={styles.formSection}>
                    <h2 className={styles.sectionTitle}>1. Dados da Organização</h2>
                    <div className={styles.grid}>
                        <RHFInput label="Nome Fantasia *" id="nomeFantasia" registerProps={register('nomeFantasia')} error={errors.nomeFantasia} placeholder="Ex: Instituto Mão Amiga" />
                        <RHFInput label="Razão Social *" id="razaoSocial" registerProps={register('razaoSocial')} error={errors.razaoSocial} placeholder="Ex: Instituto Mão Amiga do Brasil" />
                        <RHFMaskedInput control={control} name="cnpj" label="CNPJ *" id="cnpj" mask="00.000.000/0000-00" error={errors.cnpj} placeholder="00.000.000/0000-00" />
                        <RHFInput label="Data de Fundação" id="dataFundacao" type="date" registerProps={register('dataFundacao')} error={errors.dataFundacao} />
                        <RHFInput label="Data do Estatuto Social" id="dataOrigemEstatuto" type="date" registerProps={register('dataOrigemEstatuto')} error={errors.dataOrigemEstatuto} />
                    </div>
                </section>

                {/* Secção 2: Documentação */}
                <section className={styles.formSection}>
                    <h2 className={styles.sectionTitle}>2. Documentação Inicial</h2>
                    <div className={styles.grid}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <Controller name="logotipo" control={control} render={({ field: { onChange } }) => (
                                <FileUpload 
                                    label="Logotipo" 
                                    onFileSelect={onChange} 
                                    // Limita o file picker do navegador apenas a imagens PNG
                                    acceptedTypes={{'image/png': ['.png']}} 
                                />
                            )} />
                            {/* Dica visual e mensagem de erro do Yup */}
                            <span style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '4px' }}>
                                Apenas .PNG | Máx: 5MB | Resolução ideal: 1080x1080px
                            </span>
                            {errors.logotipo && <span className={styles.errorMessage}>{errors.logotipo.message}</span>}
                        </div>
                    </div>
                </section>

                {/* Secção 3: Localização */}
                <section className={styles.formSection}>
                    <h2 className={styles.sectionTitle}>3. Contato e Endereço</h2>
                    <div className={styles.grid}>
                        <RHFInput label="E-mail de Contato *" id="emailContato" registerProps={register('emailContato')} error={errors.emailContato} placeholder="Ex: contato@instituto.org.br" />
                        <RHFMaskedInput control={control} name="telefone" label="Telefone *" id="telefone" mask="(00) 00000-0000" error={errors.telefone} placeholder="(00) 00000-0000" />
                        <RHFMaskedInput control={control} name="cep" label="CEP *" id="cep" mask="00000-000" error={errors.cep} onBlurCEP={handleCepBlur} placeholder="00000-000" />
                        <RHFInput label="Endereço *" id="endereco" registerProps={register('endereco')} error={errors.endereco} placeholder="Ex: Rua das Rosas" />
                        <RHFInput label="Número *" id="numero" registerProps={register('numero')} error={errors.numero} placeholder="Ex: 123" />
                        <RHFInput label="Bairro *" id="bairro" registerProps={register('bairro')} error={errors.bairro} placeholder="Ex: Centro" />
                        <RHFInput label="Cidade *" id="cidade" registerProps={register('cidade')} error={errors.cidade} placeholder="Ex: São Paulo" />
                        <RHFInput label="Estado *" id="estado" registerProps={register('estado')} error={errors.estado} placeholder="Ex: SP" />
                    </div>
                </section>

                {/* Secção 4: Acesso do Coordenador */}
                <section className={styles.formSection}>
                    <h2 className={styles.sectionTitle}>4. Dados de Acesso (Login)</h2>
                    <div className={styles.grid}>
                        <RHFInput label="Nome do Responsável *" id="coordNome" registerProps={register('coordNome')} error={errors.coordNome} placeholder="Ex: João da Silva" />
                        <RHFMaskedInput control={control} name="respCpf" label="CPF do Responsável *" id="respCpf" mask="000.000.000-00" error={errors.respCpf} placeholder="000.000.000-00" />
                        <RHFInput label="E-mail de Login *" id="coordEmail" type="email" registerProps={register('coordEmail')} error={errors.coordEmail} placeholder="Ex: joao@instituto.org.br" />
                        <RHFInput label="Crie sua Senha *" id="coordSenha" type="password" registerProps={register('coordSenha')} error={errors.coordSenha} placeholder="No mínimo 8 caracteres" />
                    </div>
                </section>

                {/* Secção 5: Termos de Uso */}
                <section className={styles.termsSection}>
                    <label className={styles.termsLabel}>
                        <input 
                            type="checkbox" 
                            {...register('aceiteTermos')} 
                            className={styles.termsCheckbox} 
                        />
                        <span className={styles.termsText}>
                            Li e concordo com a Política de Privacidade e autorizo o tratamento dos meus dados pessoais para as finalidades descritas, em conformidade com a LGPD. Utilizamos cookies para personalizar anúncios e melhorar a sua experiência no site. Ao continuar navegando, você concorda com a nossa <a href="/politica-privacidade" target="_blank" rel="noopener noreferrer">Política de Privacidade</a> e <a href="/termos-uso" target="_blank" rel="noopener noreferrer">Termo de Uso</a>.
                        </span>
                    </label>
                    {errors.aceiteTermos && (
                        <span className={styles.errorMessage} style={{ display: 'block', marginTop: '0.5rem', textAlign: 'center' }}>
                            {errors.aceiteTermos.message}
                        </span>
                    )}
                </section>

                <div className={styles.submitContainer}>
                    <Button type="submit" variant="primary" disabled={isLoading} className={styles.btnFull}>
                        {isLoading ? <Spinner size="sm" /> : "Cadastrar e Ir para Pagamento"}
                    </Button>
                </div>
            </form>
        </div>
    );
}