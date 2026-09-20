import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth.jsx';
import { normalizeRole } from '../../utils/constants.js';
import { HOME_PATHS, getTourSteps } from './tourSteps.js';
import styles from './OnboardingTour.module.css';

const sameRect = (a, b) => (!a && !b) || (a && b && Math.abs(a.top - b.top) < 1 && Math.abs(a.left - b.left) < 1 && Math.abs(a.width - b.width) < 1 && Math.abs(a.height - b.height) < 1);

const MARGIN = 12;
const POP_WIDTH = 340;

/** Devolve o primeiro elemento [data-tour=x] que esteja realmente visível (há versões mobile e desktop). */
const findVisibleTarget = (target) => {
  if (!target) return null;
  const candidates = document.querySelectorAll(`[data-tour="${target}"]`);
  for (const el of candidates) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return el;
  }
  return null;
};

/**
 * Tour de primeiro acesso: destaque do elemento real, Voltar / Próximo / Pular e progresso.
 * Aparece automaticamente na tela inicial do perfil enquanto não tiver sido concluído
 * (registrado no servidor) e sob demanda com ?tutorial=1 ("Ver tutorial novamente").
 */
export default function OnboardingTour() {
  const { user, isOfficeAdmin, hasCompletedOnboarding, completeOnboarding } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const role = normalizeRole(user?.role);
  const onHome = location.pathname === HOME_PATHS[role];
  const forced = new URLSearchParams(location.search).get('tutorial') === '1';
  const shouldRun = !!user && onHome && (forced || !hasCompletedOnboarding);

  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState(null);
  const [popPos, setPopPos] = useState({ top: 0, left: 0, placement: 'center' });
  const popRef = useRef(null);

  // Memoizado: um array novo a cada render faria o efeito de localização rodar em laço.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const steps = useMemo(() => getTourSteps({ role }, isOfficeAdmin), [role, isOfficeAdmin]);
  const step = steps[index];
  const last = index === steps.length - 1;

  // Dá um instante para o dashboard carregar os dados antes de iniciar.
  useEffect(() => {
    if (!shouldRun) { setActive(false); return undefined; }
    const timer = setTimeout(() => { setIndex(0); setActive(true); }, forced ? 300 : 1200);
    return () => clearTimeout(timer);
  }, [shouldRun, forced]);

  const finish = useCallback(async () => {
    setActive(false);
    if (forced) navigate(location.pathname, { replace: true });
    await completeOnboarding();
  }, [forced, navigate, location.pathname, completeOnboarding]);

  // Localiza o alvo (com tentativas, pois os cartões podem aparecer após o carregamento dos dados)
  useLayoutEffect(() => {
    if (!active || !step) return undefined;
    let tries = 0;
    let timer;
    let settle;

    const locate = () => {
      const el = findVisibleTarget(step.target);
      if (el) {
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        settle = setTimeout(() => setRect((prev) => { const n = el.getBoundingClientRect(); return sameRect(prev, n) ? prev : n; }), 320);
        setRect((prev) => { const n = el.getBoundingClientRect(); return sameRect(prev, n) ? prev : n; });
        return;
      }
      if (step.target && tries < 10) { tries += 1; timer = setTimeout(locate, 150); return; }
      setRect(null); // sem alvo visível: passo centralizado
    };

    setRect(null);
    locate();

    const onResize = () => {
      const el = findVisibleTarget(step.target);
      const next = el ? el.getBoundingClientRect() : null;
      setRect((prev) => (sameRect(prev, next) ? prev : next));
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      clearTimeout(timer);
      clearTimeout(settle);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [active, step]); // step é estável (steps memoizado)

  // Posiciona o balão perto do alvo (abaixo se couber; senão acima) e dentro da tela
  useLayoutEffect(() => {
    if (!active) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = Math.min(POP_WIDTH, vw - MARGIN * 2);
    const height = popRef.current?.offsetHeight || 220;

    if (!rect) {
      setPopPos({ top: Math.max(MARGIN, (vh - height) / 2), left: (vw - width) / 2, placement: 'center', width });
      return;
    }
    const below = rect.bottom + MARGIN + height <= vh - MARGIN;
    const top = below ? rect.bottom + MARGIN : Math.max(MARGIN, rect.top - MARGIN - height);
    let left = rect.left + rect.width / 2 - width / 2;
    left = Math.min(Math.max(MARGIN, left), vw - width - MARGIN);
    setPopPos({ top, left, placement: below ? 'below' : 'above', width });
  }, [active, rect, index]);

  // Teclado: Esc pula; setas navegam. Foco vai para o balão.
  useEffect(() => {
    if (!active) return undefined;
    popRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') finish();
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, steps.length - 1));
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0));
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active, index, steps.length, finish]);

  if (!active || !step) return null;

  const progress = ((index + 1) / steps.length) * 100;

  return (
    <div className={styles.layer} role="presentation">
      {rect ? (
        <div
          className={styles.spot}
          style={{ top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12 }}
          aria-hidden="true"
        />
      ) : (
        <div className={styles.dim} aria-hidden="true" />
      )}

      <div
        ref={popRef}
        className={`${styles.pop} ${styles[popPos.placement] || ''}`}
        style={{ top: popPos.top, left: popPos.left, width: popPos.width }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        aria-describedby="tour-text"
        tabIndex={-1}
      >
        <button type="button" className={styles.close} onClick={finish} aria-label="Fechar tutorial">
          <FiX aria-hidden="true" />
        </button>

        <p className={styles.counter} aria-live="polite">Passo {index + 1} de {steps.length}</p>
        <h2 id="tour-title" className={styles.title}>{step.title}</h2>
        <p id="tour-text" className={styles.text}>{step.text}</p>

        <div className={styles.bar} role="progressbar" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={index + 1} aria-label="Progresso do tutorial">
          <span style={{ width: `${progress}%` }} />
        </div>

        <div className={styles.actions}>
          {!last ? (
            <button type="button" className={styles.skip} onClick={finish}>Pular</button>
          ) : <span />}
          <div className={styles.nav}>
            <button type="button" className={styles.back} onClick={() => setIndex((i) => Math.max(i - 1, 0))} disabled={index === 0}>
              Voltar
            </button>
            <button type="button" className={styles.next} onClick={() => (last ? finish() : setIndex((i) => i + 1))}>
              {last ? 'Concluir' : 'Próximo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
