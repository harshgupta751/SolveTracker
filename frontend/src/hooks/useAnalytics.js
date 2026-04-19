import { useState, useEffect, useCallback } from 'react';
import { analyticsAPI } from '@/api';

// For teacher dashboards — full class with topic breakdown
export function useClassAnalytics() {
  const [classData, setClassData] = useState([]);
  const [topicData, setTopicData] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [classRes, topicRes] = await Promise.all([
        analyticsAPI.getClass(),
        analyticsAPI.getTopics(),
      ]);
      setClassData(classRes.data);
      setTopicData(topicRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { classData, topicData, loading, error, refetch: fetch };
}

// For leaderboard — works for BOTH students and teachers via /analytics/leaderboard
export function useLeaderboard() {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await analyticsAPI.getLeaderboard();
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}