// src/pages/admin/ManageUsers.jsx

import React, { useState, useMemo, useEffect } from 'react';
import * as userService from '../../services/userService.js';
import { ROLES } from '../../utils/constants.js';
import { EditIcon, UsersIcon, SearchIcon } from '../../components/common/Icons.jsx';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import styles from './ManageUsers.module.css';
import CreateUserModal from './components/CreateUserModal.jsx';
import EditUserModal from './components/EditUserModal.jsx';
import useApi from '../../hooks/useApi.jsx';

export default function ManageUsers() {
  const [allUsers, setAllUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterName, setFilterName] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const addNotification = useNotification();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  const { request: createUserRequest, isLoading: isCreating } = useApi(
      userService.createUser, { showErrorNotification: false }
  );
  const { request: updateUserRequest, isLoading: isUpdating } = useApi(
      userService.updateUser, { showErrorNotification: false }
  );

  const fetchUsers = async (showLoadingSpinner = true) => {
      if (showLoadingSpinner) setIsLoading(true);
      setError(null);
      try {
        const response = await userService.getAllUsers();
        // O backend retorna a lista diretamente ou dentro de .data
        const data = Array.isArray(response) ? response : response.data;
        setAllUsers((data || []).sort((a, b) => a.name.localeCompare(b.name)));
      } catch (err) {
        console.error("Erro ao buscar utilizadores:", err);
        setError("Não foi possível carregar os utilizadores.");
        addNotification("Erro ao carregar utilizadores.", "error");
      } finally {
        if (showLoadingSpinner) setIsLoading(false);
      }
  };
  
  useEffect(() => {
    fetchUsers(true);
  }, []);

  const filteredUsers = useMemo(() => {
    return allUsers.filter(
      (user) =>
        (user.name.toLowerCase().includes(filterName.toLowerCase()) ||
          (user.email && user.email.toLowerCase().includes(filterName.toLowerCase()))) &&
        (filterRole === '' || user.role === filterRole)
    );
  }, [allUsers, filterName, filterRole]);

  const handleEdit = (user) => setUserToEdit(user);
  const handleCreate = () => setIsCreateModalOpen(true);
  
  const handleCloseModals = () => {
      setIsCreateModalOpen(false);
      setUserToEdit(null);
  };

  const handleSaveCreate = async (formData) => {
      try {
          const response = await createUserRequest(formData);
          // Suporta retorno { user } ou objeto direto
          const newUser = response.user || response;
          setAllUsers(prev => [...prev, newUser].sort((a,b) => a.name.localeCompare(b.name)));
          addNotification(`Utilizador criado com sucesso!`, 'success');
          handleCloseModals();
      } catch (err) {
           addNotification(`Falha ao criar: ${err.response?.data?.message || err.message}`, 'error');
      }
  };

  const handleSaveEdit = async (userId, formData) => {
      try {
          const response = await updateUserRequest(userId, formData);
          const updatedUser = response.user || response;
          setAllUsers(prev => 
              prev.map(u => (u.id === userId ? updatedUser : u))
                  .sort((a,b) => a.name.localeCompare(b.name))
          );
          addNotification(`Utilizador atualizado com sucesso!`, 'success');
          handleCloseModals();
      } catch (err) {
           addNotification(`Falha ao atualizar: ${err.response?.data?.message || err.message}`, 'error');
      }
  };

  // HELPER DE CORES PARA ROLES (ADICIONADO FINANCEIRO)
  const getRoleClass = (role) => {
    const r = role?.toUpperCase();
    switch (r) {
      case 'ADMIN': return styles.roleAdmin;
      case 'CONTADOR': return styles.roleContador;
      case 'OSC': return styles.roleOsc;
      case 'FINANCEIRO': return styles.roleFinanceiro; // Nova classe CSS
      default: return styles.roleDefault;
    }
  };

  const getStatusClass = (status) => {
    return status === 'Ativo' ? styles.statusBadgeActive : styles.statusBadgeInactive;
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Gerenciamento de Usuários</h2>
        <Button variant="primary" onClick={handleCreate} className={styles.createButton}>
          <UsersIcon className="w-5 h-5 mr-2" />
          Criar Novo Usuário
        </Button>
      </div>

      <div className={styles.filtersContainer}>
        <div className={styles.filtersGrid}>
          <Input
            icon={SearchIcon}
            placeholder="Buscar por Nome ou Email..."
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
          />
          <div>
            <select
              className={styles.filterSelect}
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="">Todos os Perfis</option>
              <option value="ADMIN">Administrador</option>
              <option value="CONTADOR">Contador</option>
              <option value="OSC">OSC</option>
              <option value="FINANCEIRO">Financeiro</option> {/* Opção Financeiro */}
            </select>
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <Spinner text="Carregando utilizadores..." />
          </div>
        ) : (
          <table className={styles.table}>
             <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email / Identificador</th>
                  <th>Perfil (Role)</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email || 'N/A'}</td>
                  <td>
                    <span className={`${styles.roleBadge} ${getRoleClass(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                   <td>
                    <span className={`${styles.statusBadge} ${getStatusClass(user.status)}`}>
                      <span className={styles.statusText}>{user.status}</span>
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionsContainer}>
                      <button
                        onClick={() => handleEdit(user)}
                        className={`${styles.actionButton} ${styles.editButton}`}
                        disabled={user.role === 'OSC'} 
                      >
                        <EditIcon />
                      </button>
                    </div>
                  </td>
                </tr>
                  ))
              ) : (
                  <tr className={styles.emptyRow}>
                      <td colSpan="5">Nenhum utilizador encontrado.</td>
                  </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModals}
        onSave={handleSaveCreate}
        isLoading={isCreating}
      />
      
      <EditUserModal
        isOpen={!!userToEdit}
        onClose={handleCloseModals}
        onSave={handleSaveEdit}
        isLoading={isUpdating}
        userData={userToEdit}
      />
    </div>
  );
}