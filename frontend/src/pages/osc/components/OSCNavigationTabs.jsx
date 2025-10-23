// src/pages/osc/components/OSCNavigationTabs.jsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './OSCNavigationTabs.module.css'; // Criaremos este CSS a seguir

// Define os links das abas
const tabs = [
  { name: 'Início', path: '/osc/inicio' },
  { name: 'Documentos', path: '/osc/documentos' },
  { name: 'Mensagens', path: '/osc/mensagens' },
  { name: 'Meu Perfil', path: '/osc/perfil' },
];

export default function OSCNavigationTabs() {
  return (
    // Container das abas (com fundo branco e borda inferior)
    <div className={styles.tabsContainer}>
      <nav className={styles.nav}>
        {tabs.map((tab) => (
          <NavLink
            key={tab.name}
            to={tab.path}
            // NavLink passa { isActive } para a função className
            className={({ isActive }) =>
              `${styles.tabLink} ${isActive ? styles.active : ''}`
            }
          >
            {tab.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}