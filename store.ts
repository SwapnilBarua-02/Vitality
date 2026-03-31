import { create } from 'zustand';

export type SetEntry = {
  id: number;
  reps: string;
  weight: string;
};

export type Exercise = {
  id: number;
  name: string;
  sets: SetEntry[];
};

export type Block = {
  id: number;
  isSuperset: boolean;
  exercises: Exercise[];
};

export type WorkoutSession = {
  id: number;
  date: string;
  label: string;
  blocks: Block[];
};

export type TimerSession = {
  id: number;
  methodName: string;
  goalSecs: number;
  elapsedSecs: number;
  date: string;
};

type TimerState = {
  startTime: number | null;
  goalSecs: number;
  running: boolean;
  methodName: string;
  pausedElapsed: number;
};

type StoreState = {
  blocks: Block[];
  addBlock: () => void;
  addSuperset: () => void;
  deleteBlock: (blockId: number) => void;
  updateExerciseName: (blockId: number, exId: number, name: string) => void;
  addSet: (blockId: number, exId: number) => void;
  deleteSet: (blockId: number, exId: number, setId: number) => void;
  updateSet: (blockId: number, exId: number, setId: number, field: keyof SetEntry, value: string) => void;
  clearBlocks: () => void;

  workoutSessions: WorkoutSession[];
  saveWorkoutSession: (label: string) => void;
  resetWorkoutData: () => void;

  timerSessions: TimerSession[];
  addTimerSession: (session: Omit<TimerSession, 'id' | 'date'>) => void;
  resetTimerData: () => void;

  timer: TimerState;
  startTimer: (goalSecs: number, methodName: string) => void;
  pauseTimer: (elapsed: number) => void;
  resumeTimer: () => void;
  stopTimer: () => void;

  resetAllMainStoreData: () => void;
};

function newSet(): SetEntry {
  return { id: Date.now() + Math.random(), reps: '', weight: '' };
}

function newExercise(): Exercise {
  return { id: Date.now() + Math.random(), name: '', sets: [newSet()] };
}

function newBlock(isSuperset = false): Block {
  return {
    id: Date.now() + Math.random(),
    isSuperset,
    exercises: isSuperset ? [newExercise(), newExercise()] : [newExercise()],
  };
}

export { newBlock, newExercise, newSet };

const EMPTY_TIMER: TimerState = {
  startTime: null,
  goalSecs: 3600,
  running: false,
  methodName: '',
  pausedElapsed: 0,
};

export const useStore = create<StoreState>((set, get) => ({
  blocks: [],

  addBlock: () =>
    set((state) => ({ blocks: [...state.blocks, newBlock()] })),

  addSuperset: () =>
    set((state) => ({ blocks: [...state.blocks, newBlock(true)] })),

  deleteBlock: (blockId) =>
    set((state) => ({ blocks: state.blocks.filter(b => b.id !== blockId) })),

  updateExerciseName: (blockId, exId, name) =>
    set((state) => ({
      blocks: state.blocks.map(b => b.id !== blockId ? b : {
        ...b,
        exercises: b.exercises.map(e => e.id !== exId ? e : { ...e, name }),
      }),
    })),

  addSet: (blockId, exId) =>
    set((state) => ({
      blocks: state.blocks.map(b => b.id !== blockId ? b : {
        ...b,
        exercises: b.exercises.map(e => e.id !== exId ? e : {
          ...e, sets: [...e.sets, newSet()],
        }),
      }),
    })),

  deleteSet: (blockId, exId, setId) =>
    set((state) => ({
      blocks: state.blocks.map(b => b.id !== blockId ? b : {
        ...b,
        exercises: b.exercises.map(e => e.id !== exId ? e : {
          ...e, sets: e.sets.filter(s => s.id !== setId),
        }),
      }),
    })),

  updateSet: (blockId, exId, setId, field, value) =>
    set((state) => ({
      blocks: state.blocks.map(b => b.id !== blockId ? b : {
        ...b,
        exercises: b.exercises.map(e => e.id !== exId ? e : {
          ...e, sets: e.sets.map(s => s.id !== setId ? s : { ...s, [field]: value }),
        }),
      }),
    })),

  clearBlocks: () => set({ blocks: [] }),

  workoutSessions: [],

  saveWorkoutSession: (label) => {
    const { blocks } = get();
    const session: WorkoutSession = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      label,
      blocks: JSON.parse(JSON.stringify(blocks)),
    };
    set((state) => ({
      workoutSessions: [session, ...state.workoutSessions],
      blocks: [],
    }));
  },

  resetWorkoutData: () =>
    set({
      blocks: [],
      workoutSessions: [],
    }),

  timerSessions: [],

  addTimerSession: (session) =>
    set((state) => ({
      timerSessions: [
        ...state.timerSessions,
        { ...session, id: Date.now(), date: new Date().toISOString().split('T')[0] },
      ],
    })),

  resetTimerData: () =>
    set({
      timerSessions: [],
      timer: EMPTY_TIMER,
    }),

  timer: EMPTY_TIMER,

  startTimer: (goalSecs, methodName) =>
    set({ timer: { startTime: Date.now(), goalSecs, running: true, methodName, pausedElapsed: 0 } }),

  pauseTimer: (elapsed) =>
    set((state) => ({
      timer: { ...state.timer, running: false, startTime: null, pausedElapsed: elapsed }
    })),

  resumeTimer: () =>
    set((state) => ({
      timer: { ...state.timer, running: true, startTime: Date.now() }
    })),

  stopTimer: () =>
    set({ timer: EMPTY_TIMER }),

  resetAllMainStoreData: () =>
    set({
      blocks: [],
      workoutSessions: [],
      timerSessions: [],
      timer: EMPTY_TIMER,
    }),
}));