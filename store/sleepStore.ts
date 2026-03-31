import { create } from 'zustand';

type SleepEntry = {
  id: number;
  date: string;
  hours: number;
};

type SleepState = {
  entries: SleepEntry[];
  addSleep: (hours: number) => void;
};

export const useSleepStore = create<SleepState>((set) => ({
  entries: [],

  addSleep: (hours) =>
    set((state) => ({
      entries: [
        ...state.entries,
        {
          id: Date.now(),
          date: new Date().toISOString().split('T')[0],
          hours,
        },
      ],
    })),
}));