import React, { useState, useEffect } from 'react';
import styles from './FinanceiroList.module.css';
import api from '../../services/api';

export default function FinanceiroPage() {
  const [oscs, setOscs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchOSCs = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/financeiro/oscs?query=${search}`);
      setOscs(response.data);
    } catch (err) {
      console.error("Erro ao buscar lista de OSCs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchOSCs();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const toggleStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/admin/financeiro/oscs/${id}/status`, { is_in_debt: !currentStatus });
      fetchOSCs(); // Recarrega a lista
    } catch (err) {
      alert("Erro ao alterar situação financeira");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerAction}>
        <h2>Controle de Débitos - OSCs</h2>
        <div className={styles.searchBar}>
          <input 
            type="text" 
            placeholder="Buscar por Nome ou CNPJ..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>OSC</th>
              <th>CNPJ</th>
              <th>Situação</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {oscs.map(osc => (
              <tr key={osc.id}>
                <td>{osc.name}</td>
                <td>{osc.cnpj}</td>
                <td>
                  <span className={osc.is_in_debt ? styles.badgeDanger : styles.badgeSuccess}>
                    {osc.is_in_debt ? 'Inadimplente' : 'Em Dia'}
                  </span>
                </td>
                <td>
                  <button 
                    className={styles.actionBtn}
                    onClick={() => toggleStatus(osc.id, osc.is_in_debt)}
                  >
                    {osc.is_in_debt ? 'Dar Baixa' : 'Bloquear'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}