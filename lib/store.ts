"use client";

import { create } from "zustand";
import { QuizAnswers } from "./types";

interface QuizStore {
  answers: QuizAnswers;
  currentStep: number;
  setAnswer: <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) => void;
  setStep: (step: number) => void;
  reset: () => void;
}

const initialAnswers: QuizAnswers = {
  activity: null,
  terrain: null,
  context: null,
  cushion: null,
  support: null,
  fit: null,
  priorities: [],
};

export const useQuizStore = create<QuizStore>((set) => ({
  answers: { ...initialAnswers },
  currentStep: 1,
  setAnswer: (key, value) =>
    set((state) => {
      // Changing the activity switches the question branch — clear the
      // branch-specific answers so stale values can't leak into scoring.
      if (key === "activity" && state.answers.activity !== value) {
        return {
          answers: { ...initialAnswers, activity: value as QuizAnswers["activity"] },
        };
      }
      return { answers: { ...state.answers, [key]: value } };
    }),
  setStep: (step) => set({ currentStep: step }),
  reset: () => set({ answers: { ...initialAnswers }, currentStep: 1 }),
}));
