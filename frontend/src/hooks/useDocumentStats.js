import { useCallback, useEffect, useRef, useState } from 'react';
import { getDocumentStats } from '../services/dashboardService.js';

/** Carrega as estatísticas do dashboard. Reexecuta quando o período muda. */
export default function useDocumentStats(params = {}) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);
  const key = JSON.stringify(params);

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setIsLoading(true);
    setError(null);
    try {
      const result = await getDocumentStats(JSON.parse(key));
      if (id === requestId.current) setData(result);
    } catch (err) {
      if (id === requestId.current) {
        setError(err?.response?.data?.message || 'Não foi possível carregar os dados.');
        setData(null);
      }
    } finally {
      if (id === requestId.current) setIsLoading(false);
    }
  }, [key]);

  useEffect(() => { load(); }, [load]);

  return { data, isLoading, error, reload: load };
}
