// src/pages/contador/Profile.jsx

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import useApi from '../../hooks/useApi.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import Input from '../../components/common/Input.jsx'; // Usa Input refatorado
import Button from '../../components/common/Button.jsx'; // Usa Button refatorado
import Spinner from '../../components/common/Spinner.jsx';
import styles from './Profile.module.css'; // Importa CSS Module da página

// --- Mock API ---
const mockUpdateProfileApi = (userId, data) => new Promise(resolve => setTimeout(() => resolve({ data: { ...data, id: userId } }), 1000));
// ---

/**
 * Página de Perfil do Contador (CSS Modules).
 */
export default function ContadorProfilePage() {
  const { user, login } = useAuth(); // Pega 'login' para atualizar o user localmente
  const addNotification = useNotification();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const { request: updateProfile, isLoading, error } = useApi(mockUpdateProfileApi);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedUserData = await updateProfile(user.id, formData);
      addNotification('Perfil salvo com sucesso!', 'success');
      // Atualiza o utilizador no AuthContext (frontend)
      // Em API real, usaria a resposta `updatedUserData`
      login({ ...user, name: formData.name, email: formData.email }); // Simulação de atualização local
    } catch (err) {
      console.error('Falha ao salvar perfil:', err);
      // useApi já mostra notificação
    }
  };

  // Reseta o formulário para os dados atuais do 'user' (do AuthContext)
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
            error={error?.data?.field === 'name' ? error.data.message : null}
          />
          <Input
            label="Endereço de E-mail"
            id="email" name="email" type="email"
            value={formData.email} onChange={handleChange}
            required
            error={error?.data?.field === 'email' ? error.data.message : null}
          />

          {/* Ações */}
          <div className={styles.formActions}>
            <Button type="button" variant="secondary" onClick={handleCancel} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}