// src/pages/admin/components/EditUserModal.jsx

import React, { useState, useEffect } from 'react';
import Modal from '../../../components/common/Modal.jsx';
import Input from '../../../components/common/Input.jsx';
import Button from '../../../components/common/Button.jsx';
import api from '../../../services/api.js';
import styles from './Modals.module.css';

export default function EditUserModal({ isOpen, onClose, onSave, isLoading, userData }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    status: '',
    office_id: ''
  });
  const [offices, setOffices] = useState([]);

  // Carrega dados do usuário e lista de escritórios ao abrir
  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        role: userData.role || '',
        status: userData.status || 'Ativo',
        office_id: userData.office_id || ''
      });
    }

    const fetchOffices = async () => {
      try {
        const response = await api.get('/admin/offices');
        setOffices(response.data || []);
      } catch (err) {
        console.error("Erro ao carregar escritórios", err);
      }
    };

    if (isOpen) fetchOffices();
  }, [userData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(userData.id, formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Utilizador">
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label="Nome Completo"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        
        <Input
          label="Email / Identificador"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <div className={styles.formGroup}>
          <label className={styles.label}>Perfil (Role)</label>
          <select 
            name="role" 
            value={formData.role} 
            onChange={handleChange} 
            className={styles.select}
          >
            <option value="ADMIN">Administrador</option>
            <option value="CONTADOR">Contador</option>
            <option value="OSC">OSC</option>
            <option value="FINANCEIRO">Financeiro</option>
          </select>
        </div>

        {/* --- NOVO CAMPO DE STATUS --- */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Status de Pagamento / Acesso</label>
          <select 
            name="status" 
            value={formData.status} 
            onChange={handleChange} 
            className={styles.select}
            style={{ border: '2px solid #fbbf24' }} // Destaque visual
          >
            <option value="Ativo">Ativo (Pagamento Regular)</option>
            <option value="Pendente">Pendente (Aguardando Confirmação)</option>
            <option value="Inativo">Inativo (Inadimplente)</option>
          </select>
        </div>

        {/* --- CAMPO DE ESCRITÓRIO (Exibe para Contador e OSC) --- */}
        {(formData.role === 'CONTADOR' || formData.role === 'OSC') && (
          <div className={styles.formGroup}>
            <label className={styles.label}>Vincular ao Escritório</label>
            <select 
              name="office_id" 
              value={formData.office_id} 
              onChange={handleChange} 
              className={styles.select}
              required
            >
              <option value="">Selecione um escritório...</option>
              {offices.map(office => (
                <option key={office.id} value={office.id}>
                  {office.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className={styles.actions}>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Guardar Alterações
          </Button>
        </div>
      </form>
    </Modal>
  );
}