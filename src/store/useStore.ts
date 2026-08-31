import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StudySession, Goal, UserPreferences } from '../types';

interface AppStore {
  preferences: UserPreferences;
  sessions: StudySession[];
  goals: Goal[];
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  addSession: (session: StudySession) => void;
  addGoal: (goal: Goal) => void;
  toggleGoal: (id: string) => void;
  deleteGoal: (id: string) => void;
}

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      preferences: {
        theme: 'dark',
        language: 'pt',
        pushNotifications: true,
        biometricAuth: false,
        calendarSync: false,
        offlineMode: true,
      },
      sessions: [
        { id: '1', subject: 'Matemática', durationMinutes: 120, date: new Date().toISOString() },
        { id: '2', subject: 'Física', durationMinutes: 90, date: new Date(Date.now() - 86400000).toISOString() },
        { id: '3', subject: 'História', durationMinutes: 45, date: new Date(Date.now() - 86400000 * 2).toISOString() },
        { id: '4', subject: 'Biologia', durationMinutes: 60, date: new Date(Date.now() - 86400000 * 3).toISOString() },
      ],
      goals: [
        { id: '1', title: 'Estudar Matemática', targetHours: 10, currentHours: 4, completed: false },
        { id: '2', title: 'Revisar Física', targetHours: 5, currentHours: 1.5, completed: false },
        { id: '3', title: 'Ler Livro de História', targetHours: 3, currentHours: 3, completed: true },
      ],
      updatePreferences: (prefs) => set((state) => ({ preferences: { ...state.preferences, ...prefs } })),
      addSession: (session) => set((state) => ({ sessions: [...state.sessions, session] })),
      addGoal: (goal) => set((state) => ({ goals: [...state.goals, goal] })),
      toggleGoal: (id) => set((state) => ({
        goals: state.goals.map((g) => g.id === id ? { ...g, completed: !g.completed } : g)
      })),
      deleteGoal: (id) => set((state) => ({
        goals: state.goals.filter((g) => g.id !== id)
      })),
    }),
    {
      name: 'estudosync-storage',
    }
  )
);
