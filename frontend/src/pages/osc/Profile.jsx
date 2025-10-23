// src/pages/osc/Profile.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import useApi from '../../hooks/useApi.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { mockOSCs } from '../../utils/mockData.js'; // Importa mockOSCs
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import styles from './Profile.module.css'; // Importa CSS Module

// --- Mock API ---
const mockUpdateProfileApi = (id, data) => new Promise(resolve => setTimeout(() => resolve({ data }), 1000));
// ---

/**
 * Página de Perfil da OSC (CSS Modules).
 */
export default function OSCProfilePage() {
  const { user } = useAuth();
  const addNotification = useNotification();
  const [formData, setFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { request: updateProfile, isLoading: isSaving } = useApi(mockUpdateProfileApi);

  // Efeito para buscar dados do perfil
  useEffect(() => {
    setIsLoadingData(true);
    setTimeout(() => {
      // Busca os detalhes da OSC logada no mock
      const oscDetails = mockOSCs.find((o) => o.id === user?.id);
      setFormData(oscDetails || null); // Define como null se não encontrar
      setIsLoadingData(false);
    }, 300);
  }, [user?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const updatedData = await updateProfile(formData.id, formData);
      addNotification('Perfil salvo com sucesso!', 'success');
      setFormData(updatedData);
      setIsEditing(false);
      // TODO: Atualizar 'user.name' no AuthContext se ele mudou
    } catch (err) {
      console.error('Falha ao salvar perfil:', err);
      // O hook useApi já mostrou a notificação
    }
  };

  const handleCancel = () => {
    // Reverte alterações buscando dados originais
    const oscDetails = mockOSCs.find((o) => o.id === user?.id);
    setFormData(oscDetails);
    setIsEditing(false);
  };

  // --- Renderização ---
  if (isLoadingData) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner text="Carregando perfil..." />
      </div>
    );
  }

  if (!formData) {
    return (
      <div className={`${styles.pageContainer} ${styles.errorContainer}`}>
        Erro: Não foi possível carregar os dados do perfil.
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
          // --- MODO DE VISUALIZAÇÃO ---
          <div className={styles.viewGrid}>
            <div>
              <strong className={styles.fieldLabel}>Nome da OSC</strong>
              <p className={styles.fieldValue}>{formData.name}</p>
            </div>
            <div>
              <strong className={styles.fieldLabel}>CNPJ</strong>
              <p className={styles.fieldValue}>{formData.cnpj}</p>
            </div>
            <div>
              <strong className={styles.fieldLabel}>Responsável</strong>
              <p className={styles.fieldValue}>{formData.responsible}</p>
            </div>
            <div>
              <strong className={styles.fieldLabel}>Email</strong>
              <p className={styles.fieldValue}>{formData.email}</p>
            </div>
            <div>
              <strong className={styles.fieldLabel}>Telefone</strong>
              <p className={styles.fieldValue}>{formData.phone}</p>
            </div>
            <div className={styles.span2}> {/* Ocupa 2 colunas em telas maiores */}
              <strong className={styles.fieldLabel}>Endereço</strong>
              <p className={styles.fieldValue}>{formData.address}</p>
            </div>
          </div>
        ) : (
          // --- MODO DE EDIÇÃO (Formulário) ---
          <form onSubmit={handleSave}>
            <div className={styles.formGrid}>
              <Input
                label="Nome da OSC" id="name" name="name"
                value={formData.name} onChange={handleChange} required
              />
              <Input
                label="CNPJ" id="cnpj" name="cnpj"
                value={formData.cnpj} onChange={handleChange} required
              />
              <Input
                label="Responsável" id="responsible" name="responsible"
                value={formData.responsible} onChange={handleChange}
              />
              <Input
                label="Email" id="email" name="email" type="email"
                value={formData.email} onChange={handleChange}
              />
              <Input
                label="Telefone" id="phone" name="phone"
                value={formData.phone} onChange={handleChange}
              />
              <div className={styles.span2Form}> {/* Ocupa 2 colunas */}
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