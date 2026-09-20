import React from 'react';
import { Link } from 'react-router-dom';
import { FiPlayCircle } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth.jsx';
import { homePathFor } from '../../utils/constants.js';

/** "Ver tutorial novamente": abre a tela inicial do perfil já com o tour ativo (?tutorial=1). */
export default function ReplayTutorial({ style }) {
  const { user } = useAuth();
  return (
    <Link
      to={`${homePathFor(user)}?tutorial=1`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, padding: '0 16px',
        border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: '#fff',
        color: 'var(--text-dark)', fontWeight: 700, fontSize: 'var(--fs-secondary)', margin: '4px 0 16px', ...style,
      }}
    >
      <FiPlayCircle aria-hidden="true" style={{ color: 'var(--primary-color)', fontSize: 20 }} />
      Ver tutorial novamente
    </Link>
  );
}
