import { create } from 'zustand';

type Entry = { id: string; weight: number | '' };
type NutritionStore = { entries: Entry[]; add: (id: string) => void; replace: (id: string, nextId: string) => void; update: (id: string, weight: number | '') => void; remove: (id: string) => void; clear: () => void };

export const useNutrition = create<NutritionStore>((set) => ({
  entries: [{ id: 'rice', weight: 150 }, { id: 'chicken', weight: 100 }, { id: 'broccoli', weight: 80 }],
  add: (id) => set((state) => ({ entries: state.entries.some((item) => item.id === id) ? state.entries.map((item) => item.id === id ? { ...item, weight: Number(item.weight) + 100 } : item) : [...state.entries, { id, weight: 100 }] })),
  replace: (id, nextId) => set((state) => ({ entries: state.entries.map((item) => item.id === id ? { ...item, id: nextId } : item) })),
  update: (id, weight) => set((state) => ({ entries: state.entries.map((item) => item.id === id ? { ...item, weight } : item) })),
  remove: (id) => set((state) => ({ entries: state.entries.filter((item) => item.id !== id) })),
  clear: () => set({ entries: [] }),
}));
