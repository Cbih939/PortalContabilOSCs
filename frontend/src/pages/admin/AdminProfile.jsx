import React, { useState } from 'react';
import api from '../../services/api.js';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
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
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Meu Perfil</h1>
        <p className={styles.subtitle}>Gerencie suas credenciais de acesso ao sistema.</p>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Alterar Senha</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          
          <Input
            label="Senha Atual"
            type="password"
            name="currentPassword"
            value={passwords.currentPassword}
            onChange={handleChange}
            required
            placeholder="Digite sua senha atual"
          />

          <div className={styles.divider}></div>

          <Input
            label="Nova Senha"
            type="password"
            name="newPassword"
            value={passwords.newPassword}
            onChange={handleChange}
            required
            placeholder="Digite a nova senha"
          />

          <Input
            label="Confirmar Nova Senha"
            type="password"
            name="confirmPassword"
            value={passwords.confirmPassword}
            onChange={handleChange}
            required
            placeholder="Repita a nova senha"
          />

          <div className={styles.actions}>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Salvar Nova Senha
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}