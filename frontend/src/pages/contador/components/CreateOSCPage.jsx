// src/pages/contador/CreateOSCPage.jsx
// (Versão simplificada focada nas máscaras)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputMask from 'react-input-mask'; // Importa a máscara diretamente
import styles from './CreateOSCPage.module.css'; // Criaremos este CSS
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
// (Imports para react-hook-form, yup, e useApi viriam aqui)

// Função auxiliar para aplicar estilos de input (simulação do Input.module.css)
const getInputClass = (hasError = false) => {
    const base = styles.formInput; // Classe base do CSS Module
    const error = hasError ? styles.formInputError : styles.formInputDefault;
    return `${base} ${error}`;
};
// Função auxiliar para label
const getLabelClass = () => styles.formLabel;


export default function CreateOSCPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    // (Estados para react-hook-form viriam aqui)
    const [formData, setFormData] = useState({}); // Estado simples por enquanto
    
    // Handler simples
    const handleChange = (e) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
    };
    
    // Handler para busca de CEP (exemplo)
    const handleCepBlur = async (e) => {
        const cep = e.target.value.replace(/\D/g, ''); // Remove máscara
        if (cep.length === 8) {
            try {
                // (Aqui faria a chamada à API de CEP, ex: viacep.com.br)
                // const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                // const data = await response.json();
                // setFormData(prev => ({...prev, endereco: data.logradouro, ...}));
                console.log("Buscando CEP:", cep);
            } catch (err) {
                console.error("Erro ao buscar CEP", err);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        console.log("Enviando formulário:", formData);
        // (Lógica de useApi(oscService.createOSC) viria aqui)
        setTimeout(() => {
            setIsLoading(false);
            alert("Cadastro (simulado) finalizado!");
            navigate('/contador/oscs'); // Volta para a lista
        }, 1500);
    };

    return (
        <div className={styles.pageContainer}>
            <form onSubmit={handleSubmit}>
                <div className={styles.formHeader}>
                    <h1 className={styles.title}>Cadastrar Nova Organização</h1>
                    <p className={styles.subtitle}>Preencha os dados abaixo para registar uma nova Organização da Sociedade Civil.</p>
                </div>

                {/* --- Secção 1: Informações da OSC --- */}
                <section className={styles.formSection}>
                    <h2 className={styles.sectionTitle}>1. Informações da OSC</h2>
                    <div className={styles.grid}>
                        <div className={styles.field}>
                            <label htmlFor="nomeFantasia" className={getLabelClass()}>Nome Fantasia da OSC</label>
                            <input id="nomeFantasia" name="nomeFantasia" onChange={handleChange} className={getInputClass()} />
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="razaoSocial" className={getLabelClass()}>Razão Social</label>
                            <input id="razaoSocial" name="razaoSocial" onChange={handleChange} className={getInputClass()} />
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="cnpj" className={getLabelClass()}>CNPJ</label>
                            {/* Input com Máscara */}
                            <InputMask
                                mask="99.999.999/9999-99"
                                maskPlaceholder={null} // Não mostra placeholder da máscara
                                value={formData.cnpj || ''}
                                onChange={handleChange}
                            >
                                {(inputProps) => (
                                    <input {...inputProps} id="cnpj" name="cnpj" className={getInputClass()} placeholder="00.000.000/0000-00" />
                                )}
                            </InputMask>
                        </div>
                         <div className={styles.field}>
                            <label htmlFor="dataFundacao" className={getLabelClass()}>Data de Fundação</label>
                            <input id="dataFundacao" name="dataFundacao" type="date" onChange={handleChange} className={getInputClass()} />
                        </div>
                    </div>
                </section>

                {/* --- Secção 3: Contato e Endereço --- */}
                <section className={styles.formSection}>
                    <h2 className={styles.sectionTitle}>3. Contato e Endereço</h2>
                    <div className={styles.grid}>
                        <div className={styles.field}>
                            <label htmlFor="emailContato" className={getLabelClass()}>E-mail de Contato</label>
                            <input id="emailContato" name="emailContato" type="email" onChange={handleChange} className={getInputClass()} />
                        </div>
                         <div className={styles.field}>
                            <label htmlFor="telefone" className={getLabelClass()}>Telefone / WhatsApp</label>
                            <InputMask
                                mask="(99) 99999-9999"
                                maskPlaceholder={null}
                                value={formData.telefone || ''}
                                onChange={handleChange}
                            >
                                {(inputProps) => (
                                    <input {...inputProps} id="telefone" name="telefone" className={getInputClass()} placeholder="(00) 00000-0000" />
                                )}
                            </InputMask>
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="website" className={getLabelClass()}>Website</label>
                            <input id="website" name="website" type="url" onChange={handleChange} className={getInputClass()} placeholder="https://..." />
                        </div>
                         <div className={styles.field}>
                            <label htmlFor="instagram" className={getLabelClass()}>Instagram</label>
                            <input id="instagram" name="instagram" onChange={handleChange} className={getInputClass()} placeholder="@seu_perfil" />
                        </div>
                         <div className={styles.field}>
                            <label htmlFor="cep" className={getLabelClass()}>CEP</label>
                            <InputMask
                                mask="99999-999"
                                maskPlaceholder={null}
                                value={formData.cep || ''}
                                onChange={handleChange}
                                onBlur={handleCepBlur} // Adiciona validador de CEP
                            >
                                {(inputProps) => (
                                    <input {...inputProps} id="cep" name="cep" className={getInputClass()} placeholder="XXXXX-XXX" />
                                )}
                            </InputMask>
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="endereco" className={getLabelClass()}>Endereço</label>
                            <input id="endereco" name="endereco" onChange={handleChange} className={getInputClass()} />
                        </div>
                        {/* ... (Número, Bairro, Cidade, Estado, País) ... */}
                    </div>
                </section>
                
                {/* --- Secção 4: Responsável Legal --- */}
                <section className={styles.formSection}>
                     <h2 className={styles.sectionTitle}>4. Responsável Legal (Presidente)</h2>
                     <div className={styles.grid}>
                        <div className={styles.field}>
                            <label htmlFor="respNome" className={getLabelClass()}>Nome</label>
                            <input id="respNome" name="respNome" onChange={handleChange} className={getInputClass()} />
                        </div>
                         <div className={styles.field}>
                            <label htmlFor="respCpf" className={getLabelClass()}>CPF</label>
                             <InputMask
                                mask="999.999.999-99"
                                maskPlaceholder={null}
                                value={formData.respCpf || ''}
                                onChange={handleChange}
                            >
                                {(inputProps) => (
                                    <input {...inputProps} id="respCpf" name="respCpf" className={getInputClass()} placeholder="000.000.000-00" />
                                )}
                            </InputMask>
                        </div>
                     </div>
                </section>

                {/* --- Secção 5: Coordenador (Utilizador OSC) --- */}
                 <section className={styles.formSection}>
                     <h2 className={styles.sectionTitle}>5. Coordenador do Programa (Utilizador)</h2>
                     <div className={styles.grid}>
                        <div className={styles.field}>
                            <label htmlFor="coordNome" className={getLabelClass()}>Nome Completo do Coordenador</label>
                            <input id="coordNome" name="coordNome" onChange={handleChange} className={getInputClass()} />
                        </div>
                         <div className={styles.field}>
                            <label htmlFor="coordCpf" className={getLabelClass()}>CPF do Coordenador</label>
                             <InputMask
                                mask="999.999.999-99"
                                maskPlaceholder={null}
                                value={formData.coordCpf || ''}
                                onChange={handleChange}
                            >
                                {(inputProps) => (
                                    <input {...inputProps} id="coordCpf" name="coordCpf" className={getInputClass()} placeholder="000.000.000-00" />
                                )}
                            </InputMask>
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="coordEmail" className={getLabelClass()}>E-mail do Coordenador (será o login)</label>
                            <input id="coordEmail" name="coordEmail" type="email" onChange={handleChange} className={getInputClass()} />
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="coordTelefone" className={getLabelClass()}>Telefone do Coordenador</label>
                             <InputMask
                                mask="(99) 99999-9999"
                                maskPlaceholder={null}
                                value={formData.coordTelefone || ''}
                                onChange={handleChange}
                            >
                                {(inputProps) => (
                                    <input {...inputProps} id="coordTelefone" name="coordTelefone" className={getInputClass()} placeholder="(00) 00000-0000" />
                                )}
                            </InputMask>
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="coordSenha" className={getLabelClass()}>Senha Provisória para o Coordenador</label>
                            <input id="coordSenha" name="coordSenha" type="password" onChange={handleChange} className={getInputClass()} />
                        </div>
                     </div>
                </section>

                <div className={styles.submitContainer}>
                    <Button type="submit" variant="primary" size="lg" disabled={isLoading}>
                         {isLoading ? <Spinner size="sm" /> : "Finalizar Cadastro da OSC"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

// TODO: Adicionar o CSS Module 'CreateOSCPage.module.css' com os estilos .pageContainer, .formHeader, .formSection, .grid, .field, .formInput, etc.
// TODO: Adicionar a rota /contador/oscs/novo em AppRoutes.jsx
// TODO: Atualizar o botão "+ Cadastrar Nova OSC" em OSCsPage.jsx para usar <Link to="/contador/oscs/novo">
// TODO: Atualizar o backend (migrações e controlador) para aceitar TODOS estes novos campos.