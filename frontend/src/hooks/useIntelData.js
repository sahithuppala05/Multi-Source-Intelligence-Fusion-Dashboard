import { useState, useEffect, useCallback } from 'react';
import { fetchIntelData, deleteIntel } from '../utils/api';

export function useIntelData(activeFilter) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ OSINT: 0, HUMINT: 0, IMINT: 0, total: 0 });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchIntelData(activeFilter);
      setData(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  // Compute stats from unfiltered data when filter is 'all'
  useEffect(() => {
    const counts = { OSINT: 0, HUMINT: 0, IMINT: 0, total: 0 };
    data.forEach((d) => {
      if (counts[d.type] !== undefined) counts[d.type]++;
      counts.total++;
    });
    setStats(counts);
  }, [data]);

  const remove = async (id) => {
    try {
      await deleteIntel(id);
      setData((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Delete failed');
    }
  };

  return { data, loading, error, stats, refresh: load, remove };
}
