import React, { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { FiMoreHorizontal, FiLogOut, FiX } from 'react-icons/fi';
import styles from './BottomNav.module.css';

/** Barra inferior (celular e tablet) + folha "Mais". Ícones: uma única biblioteca (Feather). */
export default function BottomNav({ nav, user, onLogout }) {
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const sheetRef = useRef(null);

  // Fecha a folha ao navegar
  useEffect(() => { setMoreOpen(false); }, [location.pathname, location.search]);

  // Esc fecha; bloqueia o scroll do fundo enquanto aberta; devolve o foco ao abrir
  useEffect(() => {
    if (!moreOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setMoreOpen(false); };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    sheetRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [moreOpen]);

  const moreActive = nav.more.some((item) => !item.external && location.pathname.startsWith(item.to.split('?')[0]));

  // Com CTA (OSC): [item, item, CTA, item, Mais]. Sem CTA: [item x4, Mais].
  const left = nav.cta ? nav.primary.slice(0, 2) : nav.primary.slice(0, 2);
  const right = nav.primary.slice(2);

  const renderItem = (item) => (
    <li key={item.key} className={styles.cell}>
      <NavLink
        to={item.to}
        data-tour={item.tour}
        className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
      >
        <item.icon className={styles.icon} aria-hidden="true" />
        <span className={styles.label}>{item.label}</span>
      </NavLink>
    </li>
  );

  return (
    <>
      <nav className={styles.bar} aria-label="Navegação principal">
        <ul className={styles.list}>
          {left.map(renderItem)}

          {nav.cta && (
            <li className={`${styles.cell} ${styles.ctaCell}`}>
              <Link to={nav.cta.to} className={styles.cta} data-tour={nav.cta.tour} aria-label={nav.cta.label}>
                <nav.cta.icon aria-hidden="true" />
              </Link>
              <span className={styles.ctaLabel}>Enviar</span>
            </li>
          )}

          {right.map(renderItem)}

          <li className={styles.cell}>
            <button
              type="button"
              className={`${styles.link} ${styles.moreBtn} ${moreActive || moreOpen ? styles.active : ''}`}
              onClick={() => setMoreOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={moreOpen}
            >
              <FiMoreHorizontal className={styles.icon} aria-hidden="true" />
              <span className={styles.label}>Mais</span>
            </button>
          </li>
        </ul>
      </nav>

      {moreOpen && (
        <div className={styles.backdrop} onClick={() => setMoreOpen(false)}>
          <div
            className={styles.sheet}
            role="dialog"
            aria-modal="true"
            aria-label="Mais opções"
            tabIndex={-1}
            ref={sheetRef}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.sheetHeader}>
              <div>
                <strong>{user?.name || 'Minha conta'}</strong>
                <small>{nav.roleLabel}</small>
              </div>
              <button type="button" className={styles.close} onClick={() => setMoreOpen(false)} aria-label="Fechar">
                <FiX aria-hidden="true" />
              </button>
            </div>

            <ul className={styles.grid}>
              {nav.more.map((item) => (
                <li key={item.key}>
                  {item.external ? (
                    <a href={item.to} target="_blank" rel="noreferrer" className={styles.tile}>
                      <item.icon aria-hidden="true" />
                      <span>{item.label}</span>
                    </a>
                  ) : (
                    <NavLink to={item.to} className={styles.tile}>
                      <item.icon aria-hidden="true" />
                      <span>{item.label}</span>
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>

            <button type="button" className={styles.logout} onClick={onLogout}>
              <FiLogOut aria-hidden="true" /> Sair da conta
            </button>
          </div>
        </div>
      )}
    </>
  );
}
