import { useState, useEffect, useCallback } from 'react';
import { sheetsAPI } from '@/api';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';

export function useSheets() {
  const { isTeacher } = useAuthStore();
  const [sheets,        setSheets]        = useState([]);
  const [sheetProgress, setSheetProgress] = useState([]); // server-side progress
  const [loading,       setLoading]       = useState(true);

  const fetchSheets = useCallback(async () => {
    setLoading(true);
    try {
      // Teachers load all their sheets (drafts + published); students load published only
      const sheetsRes  = isTeacher()
        ? await sheetsAPI.getTeacherAll()
        : await sheetsAPI.getMySheets();
      setSheets(sheetsRes.data);

      // Load student progress from server
      if (!isTeacher()) {
        const progRes = await sheetsAPI.getMyProgress();
        setSheetProgress(progRes.data.sheetProgress ?? []);
      }
    } catch {
      toast.error('Failed to load sheets');
    } finally {
      setLoading(false);
    }
  }, [isTeacher]);

  useEffect(() => { fetchSheets(); }, [fetchSheets]);

  // ── Write methods ──────────────────────────────────────────────────────────
  const createSheet = async (data) => {
    const res = await sheetsAPI.create(data);
    setSheets((prev) => [res.data, ...prev]);
    return res.data;
  };

  const updateSheet = async (id, data) => {
    const res = await sheetsAPI.update(id, data);
    setSheets((prev) => prev.map((s) => (s._id === id ? res.data : s)));
    return res.data;
  };

  const removeSheet = async (id) => {
    await sheetsAPI.remove(id);
    setSheets((prev) => prev.filter((s) => s._id !== id));
  };

  // Toggle a problem done/undone — updates local state optimistically,
  // then syncs with server
  const toggleProblem = useCallback(async (sheetId, problemIdx) => {
    // Optimistic update
    setSheetProgress((prev) => {
      const existing = prev.find(
        (sp) => sp.sheet === sheetId || sp.sheet?._id === sheetId
      );
      if (!existing) {
        return [...prev, { sheet: sheetId, completedProblems: [problemIdx] }];
      }
      const alreadyDone = existing.completedProblems.includes(problemIdx);
      return prev.map((sp) =>
        sp.sheet === sheetId || sp.sheet?._id === sheetId
          ? {
              ...sp,
              completedProblems: alreadyDone
                ? sp.completedProblems.filter((i) => i !== problemIdx)
                : [...sp.completedProblems, problemIdx],
            }
          : sp
      );
    });

    try {
      const res = await sheetsAPI.toggleComplete(sheetId, problemIdx);
      // Sync authoritative server state back
      setSheetProgress(res.data.sheetProgress);
    } catch {
      toast.error('Failed to save progress — reverting');
      // Revert on error
      setSheetProgress((prev) => {
        const existing = prev.find(
          (sp) => sp.sheet === sheetId || sp.sheet?._id === sheetId
        );
        if (!existing) return prev;
        const wasDone = existing.completedProblems.includes(problemIdx);
        return prev.map((sp) =>
          sp.sheet === sheetId || sp.sheet?._id === sheetId
            ? {
                ...sp,
                completedProblems: wasDone
                  ? sp.completedProblems.filter((i) => i !== problemIdx)
                  : [...sp.completedProblems, problemIdx],
              }
            : sp
        );
      });
    }
  }, []);

  // Helper: get completed problems for a specific sheet
  const getSheetProgress = useCallback(
    (sheetId) => {
      const sp = sheetProgress.find(
        (s) => s.sheet === sheetId || s.sheet?._id === sheetId
      );
      return sp?.completedProblems ?? [];
    },
    [sheetProgress]
  );

  return {
    sheets,
    sheetProgress,
    loading,
    refetch:         fetchSheets,
    createSheet,
    updateSheet,
    removeSheet,
    toggleProblem,
    getSheetProgress,
  };
}