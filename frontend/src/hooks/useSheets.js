import { useState, useEffect, useCallback } from 'react';
import { sheetsAPI } from '@/api';
import toast from 'react-hot-toast';

export function useSheets() {
  const [sheets,  setSheets]  = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sheetsAPI.getMySheets();
      setSheets(res.data);
    } catch {
      toast.error('Failed to load sheets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const createSheet = async (data) => {
    const res = await sheetsAPI.create(data);
    setSheets(prev => [res.data, ...prev]);
    return res.data;
  };

  const updateSheet = async (id, data) => {
    const res = await sheetsAPI.update(id, data);
    setSheets(prev => prev.map(s => s._id === id ? res.data : s));
    return res.data;
  };

  const removeSheet = async (id) => {
    await sheetsAPI.remove(id);
    setSheets(prev => prev.filter(s => s._id !== id));
  };

  const markComplete = async (sheetId, idx) => {
    const res = await sheetsAPI.markComplete(sheetId, idx);
    return res.data.sheetProgress;
  };

  return { sheets, loading, refetch: fetch, createSheet, updateSheet, removeSheet, markComplete };
}