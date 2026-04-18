import { create } from 'zustand';

const useCommandStore = create((set) => ({
  open: false,
  openPalette:  () => set({ open: true }),
  closePalette: () => set({ open: false }),
  togglePalette:() => set((s) => ({ open: !s.open })),
}));

export default useCommandStore;