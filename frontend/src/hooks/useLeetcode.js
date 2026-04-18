import { useState, useEffect, useCallback } from 'react';
import { leetcodeAPI } from '@/api';

export function useLeetcodeStats(studentId = null) {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = studentId
        ? await leetcodeAPI.getStudentStats(studentId)
        : await leetcodeAPI.getStats();
      setStats(res.data.leetcode);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetch();
    if (!studentId) {
      const onSync = (e) => setStats(e.detail);
      window.addEventListener('leetcode-synced', onSync);
      return () => window.removeEventListener('leetcode-synced', onSync);
    }
  }, [fetch, studentId]);

  return { stats, loading, error, refetch: fetch };
}