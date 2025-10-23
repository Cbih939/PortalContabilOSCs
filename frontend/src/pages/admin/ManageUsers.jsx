// src/pages/admin/ManageUsers.jsx

import React, { useState, useMemo } from 'react';
// Mocks e Constantes
import { mockUsers } from '../../utils/mockData.js'; // Precisa do mockUsers
import { ROLES } from '../../utils/constants.js';
// Componentes Comuns
import { EditIcon, UsersIcon, SearchIcon } from '../../components/common/Icons.jsx';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
// CSS Module
import styles from './ManageUsers.module.css';

/**
 * Página de Gerenciamento de Usuários do Admin (CSS Modules).
 */
export default function ManageUsers() {
  const [filterName, setFilterName] = useState('');
  const [filterRole, setFilterRole] = useState('');

  // Prepara os dados (simulação)
  const allUsers = useMemo(() => Object.values(mockUsers), []);

  const filteredUsers = allUsers.filter(
    (user) =>
      (user.name.toLowerCase().includes(filterName.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(filterName.toLowerCase()))) &&
      (filterRole === '' || user.role === filterRole)
  );

  // Handlers (placeholders)
  const handleEdit = (user) => alert(`(Admin) Editando usuário: ${user.name}`);
  const handleCreate = () => alert(`(Admin) Abrindo modal para criar usuário...`);

  // Helper para classe do badge de Role
  const getRoleClass = (role) => {
    switch (role) {
      case ROLES.ADMIN: return styles.roleAdmin;
      case ROLES.CONTADOR: return styles.roleContador;
      case ROLES.OSC: return styles.roleOsc;
      default: return styles.roleDefault;
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Gerenciamento de Usuários</h2>
        <Button variant="primary" onClick={handleCreate} className={styles.createButton}>
          <UsersIcon /> {/* CSS Module pode estilizar */}
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
          {/* Filtro Dropdown */}
          <div>
            {/* Usamos select nativo com classe do CSS Module */}
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
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email / Identificador</th>
              <th>Perfil (Role)</th>
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
                  <div className={styles.actionsContainer}>
                    <button
                      onClick={() => handleEdit(user)}
                      className={`${styles.actionButton} ${styles.editButton}`}
                      title="Editar Usuário"
                    >
                      <EditIcon />
                    </button>
                    {/* Botão Desativar/Ativar (Futuro) */}
                  </div>
                </td>
              </tr>
                ))
            ) : (
                <tr className={styles.emptyRow}>
                    <td colSpan="4">Nenhum utilizador encontrado com os filtros aplicados.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}