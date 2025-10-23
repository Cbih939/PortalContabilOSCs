// src/pages/osc/components/OSCHeader.jsx

import React from 'react';
import Header from '../../../components/layout/Header.jsx';
import { AlertTriangleIcon } from '../../../components/common/Icons.jsx';
import Button from '../../../components/common/Button.jsx';
import { useAuth } from '../../../hooks/useAuth.jsx';
import styles from './OSCHeader.module.css'; // Importa o CSS Module

export default function OSCHeader() {
  const { user, logout } = useAuth();
  const unreadAlertsCount = 1; // Placeholder para teste do badge

  const handleLogout = () => {
    logout();
  };

  const leftContent = (
    <h1 className="text-2xl font-bold text-gray-800">Portal da OSC</h1>
  );

  // --- ATUALIZAÇÃO DO rightContent ---
  const rightContent = (
    // Usa o container do CSS Module para gerir o espaçamento (gap)
    <div className={styles.rightContentContainer}>
      {/* Botão de Alertas */}
      <button
        className={styles.alertButton}
        title="Ver Avisos"
      >
        <AlertTriangleIcon className={styles.alertIcon} /> {/* Aplica classe ao ícone */}
        {/* Badge de Alertas */}
        {unreadAlertsCount > 0 && (
          <span className={styles.alertBadge}>
            {unreadAlertsCount}
          </span>
        )}
      </button>

      {/* Texto de Boas-vindas */}
      {/* Aplica a classe que o esconde/mostra responsivamente */}
      <span className={styles.welcomeText}>
        Bem-vindo(a), {user?.name || 'Utilizador'}
      </span>

      {/* Botão de Logout */}
      <Button
        variant="danger" // Garante que usa a variante vermelha
        size="sm"        // Tamanho pequeno
        onClick={handleLogout}
        className={styles.logoutButton} // Classe opcional para ajustes finos
      >
        Sair
      </Button>
    </div>
  );
  // --- FIM DA ATUALIZAÇÃO ---

  return <Header leftContent={leftContent} rightContent={rightContent} />;
}