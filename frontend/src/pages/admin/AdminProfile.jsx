import React, { useState } from 'react';
import api from '../../services/api.js';
import Button from '../../components/ui/Button.jsx';
import Card, { CardBody, CardHeader } from '../../components/ui/Card.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { FiSave, FiLock } from 'react-icons/fi';
import styles from './AdminProfile.module.css';

export default function AdminProfile() {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const addNotification = useNotification();

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      addNotification('A nova senha e a confirmação não coincidem.', 'error');
      return;
    }

    if (passwords.newPassword.length < 6) {
      addNotification('A nova senha deve ter pelo menos 6 caracteres.', 'info');
      return;
    }

    setIsLoading(true);
    try {
      await api.put('/admin/profile/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      
      addNotification('Senha alterada com sucesso!', 'success');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erro ao alterar a senha.';
      addNotification(errorMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Meu Perfil</h1>
        <p className={styles.pageSubtitle}>Gerencie suas credenciais de acesso ao sistema.</p>
      </div>

      <Card padding="none" className={styles.securitySection}>
        <CardHeader 
          title={
            <div className={styles.cardTitleGroup}>
              <FiLock className={styles.titleIcon} />
              Segurança: Alterar Senha
            </div>
          } 
        />
        <CardBody className={styles.cardBody}>
          <form onSubmit={handleSubmit} className={styles.formGrid}>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Senha Atual</label>
              <input
                type="password"
                name="currentPassword"
                value={passwords.currentPassword}
                onChange={handleChange}
                required
                placeholder="Digite sua senha atual"
                className={styles.formInput}
              />
            </div>

            <div className={styles.divider}></div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nova Senha</label>
              <input
                type="password"
                name="newPassword"
                value={passwords.newPassword}
                onChange={handleChange}
                required
                placeholder="Mínimo 6 caracteres"
                className={styles.formInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Confirmar Nova Senha</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Repita a nova senha"
                className={styles.formInput}
              />
            </div>

            <div className={styles.formAction}>
              <Button 
                type="submit" 
                variant="primary" 
                loading={isLoading}
                icon={!isLoading && <FiSave />}
              >
                {isLoading ? 'A atualizar...' : 'Atualizar Senha de Acesso'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}