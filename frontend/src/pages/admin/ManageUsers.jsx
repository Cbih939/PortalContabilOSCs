// src/pages/admin/ManageUsers.jsx

import React, { useState, useMemo, useEffect } from 'react';
import * as userService from '../../services/userService.js';
import { ROLES } from '../../utils/constants.js';
// Adicionado MessageIcon para as mensagens de pagamento
import { EditIcon, UsersIcon, SearchIcon, TrashIcon, MessageIcon } from '../../components/common/Icons.jsx';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import styles from './ManageUsers.module.css';
import CreateUserModal from './components/CreateUserModal.jsx';
import EditUserModal from './components/EditUserModal.jsx';
import CreateOfficeModal from './components/CreateOfficeModal.jsx';
import PaymentMessageModal from './components/PaymentMessageModal.jsx'; // Novo Modal
import useApi from '../../hooks/useApi.jsx';
import api from '../../services/api.js';

/**
 * Página de Gerenciamento de Usuários e Escritórios (Atualizada com Mensagens de Pagamento)
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
  const [isOfficeModalOpen, setIsOfficeModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [userToMessage, setUserToMessage] = useState(null); // Estado para o modal de pagamento

  // --- Hooks API ---
  const { request: createUserRequest, isLoading: isCreating } = useApi(
      userService.createUser, { showErrorNotification: false }
  );
  const { request: updateUserRequest, isLoading: isUpdating } = useApi(
      userService.updateUser, { showErrorNotification: false }
  );

  // Busca lista de utilizadores
  const fetchUsers = async (showLoadingSpinner = true) => {
      if (showLoadingSpinner) setIsLoading(true);
      setError(null);
      try {
        const response = await userService.getAllUsers();
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

  // Filtros de busca
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
  const handleCreateOffice = () => setIsOfficeModalOpen(true);
  const handleOpenMessage = (user) => setUserToMessage(user);
  
  const handleCloseModals = () => {
      setIsCreateModalOpen(false);
      setIsOfficeModalOpen(false);
      setUserToEdit(null);
      setUserToMessage(null);
  };

  // Handler para Exclusão de Usuário
  const handleDeleteUser = async (user) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário ${user.name}? Esta ação não pode ser desfeita.`)) {
      try {
        await userService.deleteUser(user.id);
        setAllUsers(prev => prev.filter(u => u.id !== user.id));
        addNotification(`Usuário "${user.name}" excluído com sucesso!`, 'success');
      } catch (err) {
        console.error("Erro ao excluir usuário:", err);
        addNotification(`Erro ao excluir: ${err.response?.data?.message || err.message}`, 'error');
      }
    }
  };

  const handleSaveCreate = async (formData) => {
      try {
          const response = await createUserRequest(formData);
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
        // Garantimos que pegamos o objeto correto da resposta
        const updatedUser = response.user || response.data || response;

        setAllUsers(prev => 
            prev.map(u => (u.id === userId ? { ...u, ...updatedUser } : u))
                // Adicionamos uma verificação extra antes do localeCompare
                .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
        );
        addNotification(`Utilizador atualizado com sucesso!`, 'success');
        handleCloseModals();
    } catch (err) {
         addNotification(`Falha ao atualizar: ${err.response?.data?.message || err.message}`, 'error');
    }
};

  const handleSaveOffice = async (officeData) => {
    try {
      await api.post('/admin/offices', officeData);
      addNotification(`Escritório "${officeData.name}" cadastrado com sucesso!`, 'success');
      handleCloseModals();
    } catch (err) {
      addNotification(`Erro ao criar escritório: ${err.response?.data?.message || err.message}`, 'error');
    }
  };

  const getRoleClass = (role) => {
    const r = role?.toUpperCase();
    switch (r) {
      case 'ADMIN': return styles.roleAdmin;
      case 'CONTADOR': return styles.roleContador;
      case 'OSC': return styles.roleOsc;
      case 'FINANCEIRO': return styles.roleFinanceiro;
      default: return styles.roleDefault;
    }
  };

  const getStatusClass = (status) => {
  switch (status) {
    case 'Ativo': return styles.statusBadgeActive;
    case 'Pendente': return styles.statusBadgePending;
    case 'Inativo': return styles.statusBadgeInactive;
    default: return styles.statusBadgeDefault;
  }
};

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Gerenciamento de Usuários</h2>
        <div className={styles.headerActions}>
          <Button variant="secondary" onClick={handleCreateOffice} className="mr-2">
            + Novo Escritório
          </Button>
          <Button variant="primary" onClick={handleCreate}>
            <UsersIcon className="w-5 h-5 mr-2" />
            Criar Novo Usuário
          </Button>
        </div>
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
              <option value="FINANCEIRO">Financeiro</option>
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
                      {/* BOTÃO MENSAGEM - Novo para Pagamentos */}
                      <button
                        onClick={() => handleOpenMessage(user)}
                        className={`${styles.actionButton} ${styles.messageButton}`}
                        title="Enviar Mensagem de Pagamento"
                        disabled={user.role !== 'OSC'} // Geralmente focado em OSCs
                      >
                        <MessageIcon />
                      </button>

                      {/* BOTÃO EDITAR */}
                      <button
                        onClick={() => handleEdit(user)}
                        className={`${styles.actionButton} ${styles.editButton}`}
                        title="Editar Usuário"
                      >
                        <EditIcon />
                      </button>

                      {/* BOTÃO EXCLUIR */}
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        title="Excluir Usuário"
                      >
                        <TrashIcon />
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

      <CreateOfficeModal
        isOpen={isOfficeModalOpen}
        onClose={handleCloseModals}
        onSave={handleSaveOffice}
      />

      {/* MODAL DE MENSAGENS DE PAGAMENTO */}
      <PaymentMessageModal
        isOpen={!!userToMessage}
        onClose={handleCloseModals}
        userData={userToMessage}
      />
    </div>
  );
}