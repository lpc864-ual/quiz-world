import { create } from 'zustand';

interface QuizStore {
  isValid: boolean;
  score: number;
  setIsValid: (isValid: boolean)  => void;
  setScore: (score: number) => void;
  clear: () => void;
}

export const useQuizStore = create<QuizStore>((set) => ({
  isValid: false,
  score: 0,
  setIsValid: (isValid) => set({ isValid }),
  setScore: (score) => set({ score }),
  clear: () => set({ isValid: false, score: 0 }),
}));