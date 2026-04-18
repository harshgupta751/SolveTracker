import { useState, useEffect, useCallback } from 'react';
import { analyticsAPI } from '@/api';

export function useClassAnalytics() {
  const [classData,   setClassData]   = useState([]);
  const [topicData,   setTopicData]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

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