import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiBell } from 'react-icons/fi';
import api from '../../services/api.js';
import { getAlerts, markAlertAsRead } from '../../services/alertService.js';
import { ROLES, normalizeRole } from '../../utils/constants.js';
import AlertsModal from '../../pages/osc/components/AlertsModal.jsx';
import styles from './TopBar.module.css';

/** Barra superior: identidade + notificações reais (avisos da contabilidade / mensagens não lidas). */
export default function TopBar({ nav, user }) {
  const navigate = useNavigate();
  const role = normalizeRole(user?.role);
  const [alerts, setAlerts] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [marking, setMarking] = useState(false);

  const profile = nav.more.find((i) => i.key === 'perfil');

  const load = useCallback(async () => {
    try {
      if (role === ROLES.OSC && Number(user?.is_in_debt) !== 1) {
        const { data } = await getAlerts();
        const list = Array.isArray(data) ? data : [];
        setAlerts(list.map((a) => ({ ...a, is_read: !!(a.read_status ?? a.is_read) })));
      } else if (role === ROLES.CONTADOR) {
        const { data } = await api.get('/contador/dashboard/stats');
        const stats = Array.isArray(data) ? data[0] : data;
        setUnreadMessages(Number(stats?.unreadMessages) || 0);
      }
    } catch {
      // Notificações são complementares: falha silenciosa, sem travar a navegação.
    }
  }, [role, user?.is_in_debt]);

  useEffect(() => { load(); }, [load]);

  const unreadAlerts = alerts.filter((a) => !a.is_read).length;
  const count = role === ROLES.OSC ? unreadAlerts : unreadMessages;

  const handleBell = () => {
    if (role === ROLES.OSC) setAlertsOpen(true);
    else if (role === ROLES.CONTADOR) navigate('/contador/mensagens');
    else navigate('/admin/avisos');
  };

  const handleMarkRead = async (alertId) => {
    setMarking(true);
    try {
      await markAlertAsRead(alertId);
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, is_read: true } : a)));
    } finally {
      setMarking(false);
    }
  };

  const bellLabel = count > 0 ? `Notificações: ${count} não lida${count > 1 ? 's' : ''}` : 'Notificações: nenhuma nova';

  return (
    <header className={styles.bar}>
      <Link to="/" className={styles.brand} aria-label="Conta Comigo — início">
        <img src="/logo_portal.png" alt="" className={styles.logo} />
      </Link>

      <div className={styles.right}>
        <span className={styles.roleChip}>{nav.roleLabel}</span>

        <button type="button" className={styles.bell} onClick={handleBell} aria-label={bellLabel} data-tour="bell">
          <FiBell aria-hidden="true" />
          {count > 0 && <span className={styles.badge} aria-hidden="true">{count > 9 ? '9+' : count}</span>}
        </button>

        {profile && (
          <Link to={profile.to} className={styles.avatar} aria-label="Meu perfil" title={user?.name}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Link>
        )}
      </div>

      {role === ROLES.OSC && (
        <AlertsModal
          isOpen={alertsOpen}
          onClose={() => setAlertsOpen(false)}
          alerts={alerts}
          onMarkAsRead={handleMarkRead}
          isLoading={marking}
        />
      )}
    </header>
  );
}
