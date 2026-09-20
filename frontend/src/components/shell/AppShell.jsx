import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import Footer from '../layout/Footer.jsx';
import SideNav from './SideNav.jsx';
import BottomNav from './BottomNav.jsx';
import TopBar from './TopBar.jsx';
import OnboardingTour from '../onboarding/OnboardingTour.jsx';
import { getNavigation } from './navigation.config.js';
import styles from './AppShell.module.css';

/**
 * Layout único para todos os perfis. Celular/tablet: barra inferior; desktop: menu lateral.
 * O conteúdo de cada tela entra pelo <Outlet />.
 */
export default function AppShell() {
  const { user, isOfficeAdmin, logout } = useAuth();
  const nav = getNavigation(user, isOfficeAdmin);

  return (
    <div className={styles.shell}>
      <a href="#conteudo" className="skip-link">Ir para o conteúdo</a>

      <SideNav nav={nav} user={user} onLogout={logout} />

      <div className={styles.main}>
        <TopBar nav={nav} user={user} />

        <main id="conteudo" tabIndex={-1} className={styles.content}>
          <Outlet />
        </main>

        <div className={`${styles.footer} no-print`}>
          <Footer />
        </div>
      </div>

      <BottomNav nav={nav} user={user} onLogout={logout} />
      <OnboardingTour />
    </div>
  );
}
