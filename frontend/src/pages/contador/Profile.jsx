// src/pages/contador/Profile.jsx

import React, { useState } from 'react';
// Hooks
import { useAuth } from '../../hooks/useAuth.jsx';
import useApi from '../../hooks/useApi.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
// Serviços API
import * as userService from '../../services/userService.js'; // Importa o serviço real
// Componentes
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
// Estilos
import styles from './Profile.module.css';

/**
 * Página de Perfil do Contador (Conectada à API).
 */
export default function ContadorProfilePage() {
  // Pega o utilizador atual e a função 'login' (para atualizar o estado local)
  const { user, login } = useAuth();
  const addNotification = useNotification();

  // Estado do formulário, inicializado com os dados do utilizador logado
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    // (Futuramente: adicionar campos de senha)
  });

  // Conecta o hook useApi ao serviço real
  const { request: updateProfile, isLoading, error: apiError } = useApi(userService.updateMyProfile);

  // Handler para mudanças nos inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler para submeter o formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Chama a API real (PUT /api/users/:id)
      const updatedUserResponse = await updateProfile(user.id, formData);
      
      // Assumindo que a API retorna o utilizador atualizado (sem o hash da senha)
      const updatedUser = updatedUserResponse.data; 

      addNotification('Perfil salvo com sucesso!', 'success');
      
      // ATUALIZA O ESTADO GLOBAL:
      // Usa a função 'login' do AuthContext para atualizar os dados
      // do utilizador (nome/email) no estado local da aplicação (e localStorage).
      // Passamos o token existente para manter a sessão.
      login({ user: updatedUser, token: localStorage.getItem('token') }); 

    } catch (err) {
      console.error('Falha ao salvar perfil:', err);
      // useApi já mostra notificação de erro vinda da API (ex: email duplicado)
      addNotification(`Falha ao salvar: ${err.response?.data?.message || err.message}`, 'error');
    }
  };

  // Handler para cancelar (reseta o formulário para os dados atuais do contexto)
  const handleCancel = () => {
     setFormData({ name: user?.name || '', email: user?.email || '' });
  };

  return (
    <div className={styles.pageContainer}>
      <h2 className={styles.title}>
        Editar Meu Perfil
      </h2>

      <div className={styles.formCard}>
        <form onSubmit={handleSubmit} className={styles.formFields}>
          <Input
            label="Nome Completo"
            id="name" name="name" type="text"
            value={formData.name} onChange={handleChange}
            required
            // Mostra erro da API (se o backend retornar erros formatados)
            error={apiError?.data?.errors?.name}
          />
          <Input
            label="Endereço de E-mail"
            id="email" name="email" type="email"
            value={formData.email} onChange={handleChange}
            required
            error={apiError?.data?.errors?.email} // Ajustado para formato de erro
          />
          
          {/* Futura seção de mudança de senha */}
          {/* <hr /> ... */}

          {/* Botões de Ação */}
          <div className={styles.formActions}>
            <Button type="button" variant="secondary" onClick={handleCancel} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? <Spinner size="sm" className="mr-2" /> : null} {/* mr-2 pode precisar CSS global */}
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}