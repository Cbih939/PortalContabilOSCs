// src/pages/admin/ManageUsers.jsx

import React, { useState, useMemo, useEffect } from 'react';
import * as userService from '../../services/userService.js'; // Serviço API
import { ROLES } from '../../utils/constants.js';
// Componentes
import { EditIcon, UsersIcon, SearchIcon } from '../../components/common/Icons.jsx';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import styles from './ManageUsers.module.css'; // CSS Module
import CreateUserModal from './components/CreateUserModal.jsx';
import EditUserModal from './components/EditUserModal.jsx';
import useApi from '../../hooks/useApi.jsx'; // Hook API

/**
 * Página de Gerenciamento de Usuários do Admin (Conectada à API).
 */
export default function ManageUsers() {
  const [allUsers, setAllUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterName, setFilterName] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const addNotification = useNotification();
  
  // --- Estados dos Modais ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  // --- Hooks API ---
  const { request: createUserRequest, isLoading: isCreating } = useApi(
      userService.createUser, { showErrorNotification: false }
  );
  const { request: updateUserRequest, isLoading: isUpdating } = useApi(
      userService.updateUser, { showErrorNotification: false }
  );

  // Efeito para Buscar Dados
  const fetchUsers = async (showLoadingSpinner = true) => {
      if (showLoadingSpinner) setIsLoading(true);
      setError(null);
      try {
        const response = await userService.getAllUsers();
        // Ordena por nome
        setAllUsers((response.data || []).sort((a, b) => a.name.localeCompare(b.name)));
      } catch (err) {
        console.error("Erro ao buscar utilizadores:", err);
        const errorMsg = err.response?.data?.message || "Não foi possível carregar os utilizadores.";
        setError(errorMsg);
        addNotification("Erro ao carregar utilizadores.", "error");
      } finally {
        if (showLoadingSpinner) setIsLoading(false);
      }
  };
  
  // Busca utilizadores na montagem do componente
  useEffect(() => {
    fetchUsers(true);
  }, []); // Removida dependência addNotification (se assumirmos que é estável)

  // Filtros
  const filteredUsers = useMemo(() => {
    return allUsers.filter(
      (user) =>
        (user.name.toLowerCase().includes(filterName.toLowerCase()) ||
          (user.email && user.email.toLowerCase().includes(filterName.toLowerCase()))) &&
        (filterRole === '' || user.role === filterRole)
    );
  }, [allUsers, filterName, filterRole]);

  // --- Handlers ---
  const handleEdit = (user) => setUserToEdit(user);
  const handleCreate = () => setIsCreateModalOpen(true);
  
  const handleCloseModals = () => {
      setIsCreateModalOpen(false);
      setUserToEdit(null);
  };

  // Handler para Salvar (Criação)
  const handleSaveCreate = async (formData) => {
      try {
          const newUser = await createUserRequest(formData);
          // Adiciona novo user e reordena
          setAllUsers(prev => [...prev, newUser].sort((a,b) => a.name.localeCompare(b.name)));
          addNotification(`Utilizador "${newUser.name}" criado com sucesso!`, 'success');
          handleCloseModals();
      } catch (err) {
           console.error('Falha ao criar utilizador:', err);
           addNotification(`Falha ao criar: ${err.response?.data?.message || err.message}`, 'error');
      }
  };

  // Handler para Salvar (Edição)
  const handleSaveEdit = async (userId, formData) => {
      try {
          const updatedUser = await updateUserRequest(userId, formData);
          // Atualiza o utilizador na lista local e reordena
          setAllUsers(prev => 
              prev.map(u => (u.id === userId ? updatedUser : u))
                  .sort((a,b) => a.name.localeCompare(b.name))
          );
          addNotification(`Utilizador "${updatedUser.name}" atualizado com sucesso!`, 'success');
          handleCloseModals();
      } catch (err) {
          console.error('Falha ao atualizar utilizador:', err);
           addNotification(`Falha ao atualizar: ${err.response?.data?.message || err.message}`, 'error');
      }
  };

  // Helper para classe do badge de perfil
  const getRoleClass = (role) => {
    switch (role) {
      case ROLES.ADMIN: return styles.roleAdmin;
      case ROLES.CONTADOR: return styles.roleContador;
      case ROLES.OSC: return styles.roleOsc;
      default: return styles.roleDefault;
    }
  };

  // Helper para classe do badge de status
  const getStatusClass = (status) => {
    switch (status) {
      case 'Ativo': return styles.statusBadgeActive;
      case 'Inativo': return styles.statusBadgeInactive;
      default: return '';
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Gerenciamento de Usuários</h2>
        <Button variant="primary" onClick={handleCreate} className={styles.createButton}>
          <UsersIcon className="w-5 h-5 mr-2" /> {/* Classe global (pode precisar de ajuste CSS) */}
          Criar Novo Usuário
        </Button>
      </div>

      {/* Filtros */}
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
              aria-label="Filtrar por Perfil"
            >
              <option value="">Todos os Perfis</option>
              <option value={ROLES.ADMIN}>Administrador</option>
              <option value={ROLES.CONTADOR}>Contador</option>
              <option value={ROLES.OSC}>OSC</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className={styles.tableContainer}>
        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <Spinner text="Carregando utilizadores..." />
          </div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
            {error}
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
                  <td>{user.email || user.cnpj || 'N/A'}</td>
                  <td>
                    <span className={`${styles.roleBadge} ${getRoleClass(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                   <td>
                    {/* --- BADGE DE STATUS CORRIGIDO --- */}
                    <span className={`
                      ${styles.statusBadge}
                      ${getStatusClass(user.status)}
                    `}>
                      <span></span> {/* Fundo */}
                      <span className={styles.statusText}>{user.status}</span> {/* Texto */}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionsContainer}>
                      <button
                        onClick={() => handleEdit(user)}
                        className={`${styles.actionButton} ${styles.editButton}`}
                        title="Editar Usuário"
                        // Desabilita edição de OSCs nesta página (deve ser em ManageOSCs)
                        disabled={user.role === ROLES.OSC} 
                      >
                        <EditIcon />
                      </button>
                    </div>
                  </td>
                </tr>
                  ))
              ) : (
                  <tr className={styles.emptyRow}>
                      {/* Atualiza colSpan para 5 */}
                      <td colSpan="5">Nenhum utilizador encontrado com os filtros aplicados.</td>
                  </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      
      {/* --- MODAIS --- */}
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