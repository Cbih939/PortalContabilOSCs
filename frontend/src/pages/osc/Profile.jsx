// src/pages/osc/Profile.jsx

import React, { useState, useEffect } from 'react';
// Hooks
import { useAuth } from '../../hooks/useAuth.jsx';
import useApi from '../../hooks/useApi.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
// Serviços API (Reais)
import * as oscService from '../../services/oscService.js';
// REMOVIDO: import { mockOSCs } from '../../utils/mockData.js';
// Componentes
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
// Estilos
import styles from './Profile.module.css';

/**
 * Página de Perfil da OSC (Conectada à API).
 */
export default function OSCProfilePage() {
  // Pega o utilizador atual (para obter o ID) e a função 'login' (para atualizar o estado local)
  const { user, login } = useAuth();
  const addNotification = useNotification();

  // --- Estados ---
  const [formData, setFormData] = useState(null); // Armazena dados do perfil vindo da API
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true); // Loading da busca inicial
  const [errorLoading, setErrorLoading] = useState(null); // Erro da busca inicial

  // Hook para a API de *salvar* (Atualizar Perfil)
  const { request: updateProfile, isLoading: isSaving, error: saveError } = useApi(oscService.updateOSC);

  // --- Efeito para Buscar Dados do Perfil da API ---
  useEffect(() => {
    // Garante que temos um ID de utilizador antes de buscar
    if (!user?.id) {
      setIsLoadingData(false);
      setErrorLoading("Informações do utilizador não encontradas. Faça login novamente.");
      return;
    }

    const fetchProfileData = async () => {
      setIsLoadingData(true);
      setErrorLoading(null);
      try {
        // Busca os detalhes completos da OSC usando o ID do utilizador logado
        const response = await oscService.getOSCById(user.id);
        setFormData(response.data); // Guarda os dados da API no estado do formulário
      } catch (err) {
        console.error("Erro ao buscar dados do perfil:", err);
        const errorMsg = err.response?.data?.message || "Não foi possível carregar os dados do perfil.";
        setErrorLoading(errorMsg);
        addNotification("Erro ao carregar perfil.", "error");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchProfileData();
  }, [user?.id, addNotification]); // Depende do ID do utilizador

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // O 'formData' já contém os dados corretos (incluindo o 'login_email' se o backend o enviar)
      // O backend espera 'email' (contacto) e 'login_email' (login)
      const payload = {
          name: formData.name,
          responsible: formData.responsible,
          email: formData.email, // Email de contacto
          login_email: formData.login_email, // Email de login (se editável)
          phone: formData.phone,
          address: formData.address,
      };
      
      const updatedOSCResponse = await updateProfile(formData.id, payload);
      const updatedOSC = updatedOSCResponse; // Assumindo que a API retorna a OSC atualizada

      addNotification('Perfil salvo com sucesso!', 'success');
      
      // Atualiza o estado local do formulário e o AuthContext
      setFormData(updatedOSC); // Atualiza com os dados frescos da API
      login({ user: updatedOSC, token: localStorage.getItem('token') }); // Atualiza o nome no header

      setIsEditing(false); // Sai do modo de edição
    } catch (err) {
      console.error('Falha ao salvar perfil:', err);
      addNotification(`Falha ao salvar: ${err.response?.data?.message || err.message}`, 'error');
      // useApi já pode ter mostrado o erro, mas este é mais específico
    }
  };

  const handleCancel = async () => {
    // Reverte alterações buscando dados frescos da API
    setIsLoadingData(true); // Mostra feedback
    try {
        const response = await oscService.getOSCById(user.id);
        setFormData(response.data);
    } catch (err) {
        addNotification("Erro ao reverter alterações.", "error");
    } finally {
        setIsLoadingData(false);
        setIsEditing(false); // Sai do modo de edição
    }
  };

  // --- Renderização ---
  if (isLoadingData) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner text="Carregando perfil..." />
      </div>
    );
  }

  if (errorLoading || !formData) { // Se deu erro ou não encontrou dados
    return (
      <div className={`${styles.pageContainer} ${styles.errorContainer}`}>
        {errorLoading || "Erro: Não foi possível carregar os dados do perfil."}
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        {/* Cabeçalho */}
        <div className={styles.header}>
          <h2 className={styles.title}>Meu Perfil</h2>
          {!isEditing && (
            <Button variant="primary" onClick={() => setIsEditing(true)}>
              Editar Perfil
            </Button>
          )}
        </div>

        {/* Conteúdo (Visualização ou Edição) */}
        {!isEditing ? (
          // --- MODO DE VISUALIZAÇÃO (Lendo de formData) ---
          <div className={styles.viewGrid}>
            <div className={styles.fieldValue}>
              <strong className={styles.fieldLabel}>Nome da OSC</strong>
              <p>{formData.name}</p>
            </div>
            {/* ... (restante dos campos: cnpj, responsible, email, phone, address) ... */}
            <div><strong className={styles.fieldLabel}>CNPJ</strong><p>{formData.cnpj}</p></div>
            <div><strong className={styles.fieldLabel}>Responsável</strong><p>{formData.responsible}</p></div>
            <div><strong className={styles.fieldLabel}>Email de Contato</strong><p>{formData.email}</p></div>
            <div><strong className={styles.fieldLabel}>Email de Login</strong><p>{formData.login_email}</p></div>
            <div><strong className={styles.fieldLabel}>Telefone</strong><p>{formData.phone}</p></div>
            <div className={styles.span2}><strong className={styles.fieldLabel}>Endereço</strong><p>{formData.address}</p></div>
          </div>
        ) : (
          // --- MODO DE EDIÇÃO (Formulário) ---
          <form onSubmit={handleSave}>
            <div className={styles.formGrid}>
              <Input
                label="Nome da OSC" id="name" name="name"
                value={formData.name} onChange={handleChange} required
                error={saveError?.data?.errors?.name}
              />
              <Input
                label="CNPJ" id="cnpj" name="cnpj"
                value={formData.cnpj} onChange={handleChange}
                required disabled // CNPJ geralmente não é editável
              />
              <Input
                label="Responsável" id="responsible" name="responsible"
                value={formData.responsible} onChange={handleChange}
              />
              <Input
                label="Email de Contato" id="email" name="email" type="email"
                value={formData.email} onChange={handleChange}
              />
               <Input
                label="Email de Login" id="login_email" name="login_email" type="email"
                value={formData.login_email} onChange={handleChange}
                required
                error={saveError?.data?.errors?.login_email || saveError?.data?.errors?.email}
              />
              <Input
                label="Telefone" id="phone" name="phone"
                value={formData.phone} onChange={handleChange}
              />
              <div className={styles.span2Form}>
                <Input
                  label="Endereço" id="address" name="address"
                  value={formData.address} onChange={handleChange}
                />
              </div>
            </div>
            {/* Botões */}
            <div className={styles.formActions}>
              <Button type="button" variant="secondary" onClick={handleCancel} disabled={isSaving}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={isSaving}>
                {isSaving ? <Spinner size="sm" className="mr-2" /> : null}
                {isSaving ? 'Guardando...' : 'Guardar Alterações'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}