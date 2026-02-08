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
    // Usar o objeto params garante que a URL fique: /api/admin/financeiro/oscs?query=termo
    const response = await api.get('/admin/financeiro/oscs', {
      params: { query: search }
    });
    setOscs(response.data);
  } catch (err) {
    console.error("Erro ao buscar lista de OSCs:", err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchOSCs();
    }, 500); // Debounce de 500ms para não sobrecarregar o banco enquanto digita
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const toggleStatus = async (id, currentStatus) => {
    if (!window.confirm(`Deseja alterar o status financeiro desta OSC?`)) return;

    try {
      await api.patch(`/admin/financeiro/oscs/${id}/status`, { 
        is_in_debt: !currentStatus 
      });
      fetchOSCs(); 
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
        {loading ? (
          <div className={styles.infoText}>Carregando organizações...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>OSC</th>
                <th>CNPJ</th>
                <th>Situação</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {oscs.length > 0 ? (
                oscs.map(osc => (
                  <tr key={osc.id}>
                    <td>{osc.name}</td>
                    <td>{osc.cnpj || 'Não informado'}</td>
                    <td>
                      <span className={osc.is_in_debt ? styles.badgeDanger : styles.badgeSuccess}>
                        {osc.is_in_debt ? 'Inadimplente' : 'Em Dia'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className={osc.is_in_debt ? styles.actionBtnSuccess : styles.actionBtnDanger}
                        onClick={() => toggleStatus(osc.id, osc.is_in_debt)}
                      >
                        {osc.is_in_debt ? 'Dar Baixa' : 'Bloquear'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className={styles.infoText}>Nenhuma OSC encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}