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

  // Estado do formulário, inicializado com os dados do utilizador logado e campos de senha vazios
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
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

    // Validações locais para a senha
    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        addNotification('Por favor, insira a sua senha atual para definir uma nova.', 'warning');
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        addNotification('A nova senha e a confirmação não coincidem.', 'error');
        return;
      }
      if (formData.newPassword.length < 6) {
        addNotification('A nova senha deve ter pelo menos 6 caracteres.', 'warning');
        return;
      }
    }

    try {
      // Monta o payload apenas com os dados principais
      const payload = {
        name: formData.name,
        email: formData.email,
      };

      // Se o utilizador preencheu a nova senha, adiciona ao payload
      if (formData.newPassword) {
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }

      // Chama a API real (PUT /api/users/:id)
      // Nota: Certifique-se que o backend aceita e processa 'currentPassword' e 'newPassword'
      const updatedUserResponse = await updateProfile(user.id, payload);
      
      // Assumindo que a API retorna o utilizador atualizado (sem o hash da senha)
      const updatedUser = updatedUserResponse.data || updatedUserResponse; 

      addNotification('Perfil atualizado com sucesso!', 'success');
      
      // Limpa os campos de senha após o sucesso
      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));

      // ATUALIZA O ESTADO GLOBAL:
      // Usa a função 'login' do AuthContext para atualizar os dados do utilizador
      // Passamos o token existente para manter a sessão ininterrupta.
      login({ user: updatedUser, token: localStorage.getItem('token') }); 

    } catch (err) {
      console.error('Falha ao atualizar perfil:', err);
      addNotification(`Falha ao guardar: ${err.response?.data?.message || err.message}`, 'error');
    }
  };

  // Handler para cancelar (reseta o formulário para os dados atuais do contexto e limpa senhas)
  const handleCancel = () => {
     setFormData({ 
       name: user?.name || '', 
       email: user?.email || '',
       currentPassword: '',
       newPassword: '',
       confirmPassword: '',
     });
  };

  return (
    <div className={styles.pageContainer}>
      <h2 className={styles.title}>
        Editar Meu Perfil
      </h2>

      <div className={styles.formCard}>
        <form onSubmit={handleSubmit} className={styles.formFields}>
          
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#374151', marginBottom: '15px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
              Informações Pessoais
            </h3>
          </div>

          <Input
            label="Nome Completo"
            id="name" name="name" type="text"
            value={formData.name} onChange={handleChange}
            required
            error={apiError?.data?.errors?.name}
          />
          <Input
            label="Endereço de E-mail"
            id="email" name="email" type="email"
            value={formData.email} onChange={handleChange}
            required
            error={apiError?.data?.errors?.email}
          />
          
          {/* Secção de mudança de senha */}
          <div style={{ marginTop: '35px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#374151', marginBottom: '5px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
              Alterar Senha
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '15px' }}>
              Deixe estes campos em branco se não quiser alterar a sua senha atual.
            </p>
          </div>

          <Input
            label="Senha Atual"
            id="currentPassword" name="currentPassword" type="password"
            value={formData.currentPassword} onChange={handleChange}
            placeholder="Insira a sua senha atual"
            error={apiError?.data?.errors?.currentPassword}
          />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
            <Input
              label="Nova Senha"
              id="newPassword" name="newPassword" type="password"
              value={formData.newPassword} onChange={handleChange}
              placeholder="Mínimo de 6 caracteres"
              error={apiError?.data?.errors?.newPassword}
            />
            <Input
              label="Confirmar Nova Senha"
              id="confirmPassword" name="confirmPassword" type="password"
              value={formData.confirmPassword} onChange={handleChange}
              placeholder="Repita a nova senha"
            />
          </div>

          {/* Botões de Ação */}
          <div className={styles.formActions} style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '35px' }}>
            <Button type="button" variant="secondary" onClick={handleCancel} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? <Spinner size="sm" style={{ marginRight: '8px' }} /> : null}
              {isLoading ? 'A Guardar...' : 'Guardar Alterações'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}