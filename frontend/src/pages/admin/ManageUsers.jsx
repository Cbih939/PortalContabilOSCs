import React, { useState, useMemo, useEffect } from 'react';
import * as userService from '../../services/userService.js';
import Button from '../../components/ui/Button.jsx';
import Card, { CardBody } from '../../components/ui/Card.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import styles from './ManageUsers.module.css';
import CreateUserModal from './components/CreateUserModal.jsx';
import EditUserModal from './components/EditUserModal.jsx';
import CreateOfficeModal from './components/CreateOfficeModal.jsx';
import PaymentMessageModal from './components/PaymentMessageModal.jsx';
import useApi from '../../hooks/useApi.jsx';
import api from '../../services/api.js';
import { FiUsers, FiSearch, FiEdit2, FiTrash2, FiMessageCircle, FiPlus } from 'react-icons/fi';

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
  const [userToMessage, setUserToMessage] = useState(null);

  // --- Hooks API ---
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
        const updatedUser = response.user || response.data || response;

        setAllUsers(prev => 
            prev.map(u => (u.id === userId ? { ...u, ...updatedUser } : u))
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
        <div>
          <h1 className={styles.pageTitle}>Gerenciamento de Usuários</h1>
          <p className={styles.pageSubtitle}>Adicione, edite ou remova acessos ao sistema.</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="secondary" onClick={handleCreateOffice} icon={<FiPlus />}>
            Novo Escritório
          </Button>
          <Button variant="primary" onClick={handleCreate} icon={<FiUsers />}>
            Criar Usuário
          </Button>
        </div>
      </div>

      <div className={styles.filtersContainer}>
        <div className={styles.filtersGrid}>
          <div className={styles.searchGroup}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar por Nome ou Email..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className={styles.searchInput}
            />
          </div>
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

      <Card padding="none">
        <CardBody className={styles.tableBody}>
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <Spinner text="Carregando utilizadores..." />
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email / Identificador</th>
                    <th>Perfil (Role)</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Ações</th>
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
                            {user.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className={styles.actionsContainer}>
                            <button
                              onClick={() => handleOpenMessage(user)}
                              className={styles.actionBtn}
                              title="Enviar Mensagem de Pagamento"
                              disabled={user.role !== 'OSC'}
                            >
                              <FiMessageCircle size={16} />
                            </button>
                            <button
                              onClick={() => handleEdit(user)}
                              className={styles.actionBtn}
                              title="Editar Usuário"
                            >
                              <FiEdit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                              title="Excluir Usuário"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className={styles.emptyState}>Nenhum utilizador encontrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
      
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

      <PaymentMessageModal
        isOpen={!!userToMessage}
        onClose={handleCloseModals}
        userData={userToMessage}
      />
    </div>
  );
}