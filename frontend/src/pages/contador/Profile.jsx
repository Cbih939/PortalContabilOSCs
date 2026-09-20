import React, { useState } from 'react';
import ReplayTutorial from '../../components/onboarding/ReplayTutorial.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';
import useApi from '../../hooks/useApi.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import * as userService from '../../services/userService.js';

import Card, { CardBody } from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import styles from './Profile.module.css';

import { FiUser, FiLock, FiSave, FiX } from 'react-icons/fi';

export default function ContadorProfilePage() {
  const { user, login } = useAuth();
  const addNotification = useNotification();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const { request: updateProfile, isLoading, error: apiError } = useApi(userService.updateMyProfile);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) return addNotification('Por favor, insira a sua senha atual para definir uma nova.', 'warning');
      if (formData.newPassword !== formData.confirmPassword) return addNotification('A nova senha e a confirmação não coincidem.', 'error');
      if (formData.newPassword.length < 6) return addNotification('A nova senha deve ter pelo menos 6 caracteres.', 'warning');
    }

    try {
      const payload = { name: formData.name, email: formData.email };
      if (formData.newPassword) {
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }

      const updatedUserResponse = await updateProfile(user.id, payload);
      const updatedUser = updatedUserResponse.data || updatedUserResponse; 

      addNotification('Perfil atualizado com sucesso!', 'success');
      
      setFormData((prev) => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      login({ user: updatedUser, token: localStorage.getItem('token') }); 

    } catch (err) {
      addNotification(`Falha ao guardar: ${err.response?.data?.message || err.message}`, 'error');
    }
  };

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
      <h2 className={styles.title}>Meu Perfil</h2>
      <ReplayTutorial />

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className={styles.formFields}>
            
            <div>
              <h3 className={styles.sectionTitle}><FiUser style={{color: 'var(--primary-color)'}}/> Informações Pessoais</h3>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="name" className={styles.formLabel}>Nome Completo</label>
              <input
                id="name" name="name" type="text"
                value={formData.name} onChange={handleChange} required
                className={`${styles.formInput} ${apiError?.data?.errors?.name ? styles.formInputError : ''}`}
              />
              {apiError?.data?.errors?.name && <span className={styles.errorMessage}>{apiError.data.errors.name}</span>}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.formLabel}>Endereço de E-mail</label>
              <input
                id="email" name="email" type="email"
                value={formData.email} onChange={handleChange} required
                className={`${styles.formInput} ${apiError?.data?.errors?.email ? styles.formInputError : ''}`}
              />
              {apiError?.data?.errors?.email && <span className={styles.errorMessage}>{apiError.data.errors.email}</span>}
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <h3 className={styles.sectionTitle}><FiLock style={{color: 'var(--primary-color)'}}/> Alterar Senha</h3>
              <p className={styles.sectionSubtitle}>Deixe estes campos em branco se não quiser alterar a sua senha atual.</p>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="currentPassword" className={styles.formLabel}>Senha Atual</label>
              <input
                id="currentPassword" name="currentPassword" type="password"
                value={formData.currentPassword} onChange={handleChange}
                placeholder="Insira a sua senha atual"
                className={`${styles.formInput} ${apiError?.data?.errors?.currentPassword ? styles.formInputError : ''}`}
              />
              {apiError?.data?.errors?.currentPassword && <span className={styles.errorMessage}>{apiError.data.errors.currentPassword}</span>}
            </div>
            
            <div className={styles.gridInputs}>
              <div className={styles.inputGroup}>
                <label htmlFor="newPassword" className={styles.formLabel}>Nova Senha</label>
                <input
                  id="newPassword" name="newPassword" type="password"
                  value={formData.newPassword} onChange={handleChange}
                  placeholder="Mínimo de 6 caracteres"
                  className={`${styles.formInput} ${apiError?.data?.errors?.newPassword ? styles.formInputError : ''}`}
                />
                {apiError?.data?.errors?.newPassword && <span className={styles.errorMessage}>{apiError.data.errors.newPassword}</span>}
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword" className={styles.formLabel}>Confirmar Nova Senha</label>
                <input
                  id="confirmPassword" name="confirmPassword" type="password"
                  value={formData.confirmPassword} onChange={handleChange}
                  placeholder="Repita a nova senha"
                  className={styles.formInput}
                />
              </div>
            </div>

            <div className={styles.formActions}>
              <Button type="button" variant="secondary" icon={<FiX />} onClick={handleCancel} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" icon={<FiSave />} disabled={isLoading}>
                {isLoading ? <Spinner size="sm" /> : 'Guardar Alterações'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}