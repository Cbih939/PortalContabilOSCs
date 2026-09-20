import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import styles from './SideNav.module.css';

export default function SideNav({ nav, user, onLogout }) {
  const items = [...nav.primary, ...nav.more];

  return (
    <aside className={styles.sidebar} aria-label="Menu principal">
      <Link to="/" className={styles.brand} aria-label="Conta Comigo — início">
        <img src="/logo_portal.png" alt="Conta Comigo" className={styles.logo} />
      </Link>

      {nav.cta && (
        <Link to={nav.cta.to} className={styles.cta} data-tour={nav.cta.tour}>
          <nav.cta.icon aria-hidden="true" />
          {nav.cta.label}
        </Link>
      )}

      <nav className={styles.nav}>
        {items.map((item) => {
          const content = (
            <>
              <item.icon className={styles.icon} aria-hidden="true" />
              <span>{item.label}</span>
            </>
          );
          return item.external ? (
            <a key={item.key} href={item.to} target="_blank" rel="noreferrer" className={styles.item}>
              {content}
            </a>
          ) : (
            <NavLink
              key={item.key}
              to={item.to}
              data-tour={item.tour ? `${item.tour}-side` : undefined}
              className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
            >
              {content}
            </NavLink>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <div className={styles.userBox}>
          <span className={styles.avatar} aria-hidden="true">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
          <div className={styles.userText}>
            <strong>{user?.name || 'Usuário'}</strong>
            <small>{nav.roleLabel}</small>
          </div>
        </div>
        <button type="button" onClick={onLogout} className={styles.logout}>
          <FiLogOut aria-hidden="true" /> Sair
        </button>
      </div>
    </aside>
  );
}
