import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'dark', // default to dark — the cooler default for a DSA app

      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        set({ theme: next });
        document.documentElement.classList.toggle('dark', next === 'dark');
      },

      setTheme: (theme) => {
        set({ theme });
        document.documentElement.classList.toggle('dark', theme === 'dark');
      },

      isDark: () => get().theme === 'dark',
    }),
    { name: 'dac-theme' }
  )
);

// Apply theme immediately on module load (before React renders)
const savedTheme = JSON.parse(localStorage.getItem('dac-theme') || '{}')?.state?.theme ?? 'dark';
document.documentElement.classList.toggle('dark', savedTheme === 'dark');

export default useThemeStore;