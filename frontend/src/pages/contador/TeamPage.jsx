import React, { useEffect, useState, useCallback } from 'react';
import { FiUserPlus, FiUsers, FiCheckCircle, FiSlash, FiShield } from 'react-icons/fi';
import api from '../../services/api.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import ds from '../../components/dashboard/dashboard.module.css';
import EmptyState from '../../components/dashboard/EmptyState.jsx';
import ErrorState from '../../components/dashboard/ErrorState.jsx';
import styles from './TeamPage.module.css';

/**
 * Equipe do escritório — exclusiva do ADM Contador.
 * O servidor só lista/cria/altera contadores do PRÓPRIO escritório (e nunca outro ADM ou Admin).
 */
export default function TeamPage() {
  const addNotification = useNotification();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/users');
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Não foi possível carregar a equipe.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const create = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (form.password.length < 8) { setFormError('A senha deve ter no mínimo 8 caracteres.'); return; }
    setSaving(true);
    try {
      await api.post('/users', { ...form, role: 'CONTADOR' });
      addNotification('Contador cadastrado com sucesso.', 'success');
      setForm({ name: '', email: '', password: '' });
      setShowForm(false);
      await load();
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Não foi possível cadastrar o contador.');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (member) => {
    const next = member.status === 'Ativo' ? 'Inativo' : 'Ativo';
    if (!window.confirm(`${next === 'Inativo' ? 'Desativar' : 'Reativar'} o acesso de ${member.name}?`)) return;
    setBusyId(member.id);
    try {
      await api.put(`/users/${member.id}`, { name: member.name, email: member.email, status: next });
      addNotification(`Acesso ${next === 'Ativo' ? 'reativado' : 'desativado'}.`, 'success');
      await load();
    } catch (err) {
      addNotification(err?.response?.data?.message || 'Não foi possível alterar o acesso.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className={ds.page}>
      <header className={ds.pageHead}>
        <div>
          <h1 className={ds.hello}>Equipe do escritório</h1>
          <p className={ds.sub}>Gerencie os contadores que atendem as OSCs do seu escritório.</p>
        </div>
        <div className={ds.headActions}>
          <button type="button" className={ds.primaryBtn} onClick={() => setShowForm((v) => !v)} aria-expanded={showForm}>
            <FiUserPlus aria-hidden="true" /> {showForm ? 'Cancelar' : 'Adicionar contador'}
          </button>
        </div>
      </header>

      {showForm && (
        <form className={`${ds.card} ${styles.form}`} onSubmit={create} aria-label="Novo contador">
          <h2 className={ds.cardTitle}>Novo contador</h2>
          <div className={styles.field}>
            <label htmlFor="team-name">Nome completo</label>
            <input id="team-name" name="name" value={form.name} onChange={change} required autoComplete="off" />
          </div>
          <div className={styles.field}>
            <label htmlFor="team-email">E-mail (usado para entrar)</label>
            <input id="team-email" name="email" type="email" value={form.email} onChange={change} required autoComplete="off" />
          </div>
          <div className={styles.field}>
            <label htmlFor="team-password">Senha inicial (mínimo 8 caracteres)</label>
            <input id="team-password" name="password" type="password" value={form.password} onChange={change} required minLength={8} autoComplete="new-password" />
          </div>
          {formError && <p className={styles.error} role="alert">{formError}</p>}
          <button type="submit" className={ds.primaryBtn} disabled={saving}>{saving ? 'Salvando…' : 'Cadastrar contador'}</button>
        </form>
      )}

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading ? (
        <div className={ds.chartSkeleton} aria-label="Carregando equipe" />
      ) : members.length === 0 ? (
        <EmptyState icon={FiUsers} title="Nenhum contador cadastrado" text="Cadastre os contadores do escritório para distribuir as OSCs." action={{ label: 'Adicionar contador', onClick: () => setShowForm(true) }} />
      ) : (
        <ul className={ds.docList}>
          {members.map((m) => (
            <li key={m.id} className={`${ds.docItem} ${styles.member}`}>
              <span className={ds.docIcon}>{m.name?.charAt(0).toUpperCase()}</span>
              <div className={ds.docInfo}>
                <strong>{m.name}</strong>
                <small>{m.email}</small>
              </div>
              <div className={styles.tags}>
                {Number(m.is_office_admin) === 1 && <span className={`${ds.badge} ${ds.badge_warning}`}><FiShield aria-hidden="true" />ADM</span>}
                {m.status === 'Ativo'
                  ? <span className={`${ds.badge} ${ds.badge_success}`}><FiCheckCircle aria-hidden="true" />Ativo</span>
                  : <span className={`${ds.badge} ${ds.badge_danger}`}><FiSlash aria-hidden="true" />Inativo</span>}
              </div>
              {Number(m.is_office_admin) !== 1 && Number(m.id) !== 0 && (
                <button type="button" className={ds.secondaryBtn} disabled={busyId === m.id} onClick={() => toggleStatus(m)}>
                  {m.status === 'Ativo' ? 'Desativar' : 'Reativar'}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
