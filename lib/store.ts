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
  cushion: null,
  terrain: null,
  support: null,
  fit: null,
  priorities: [],
};

export const useQuizStore = create<QuizStore>((set) => ({
  answers: { ...initialAnswers },
  currentStep: 1,
  setAnswer: (key, value) =>
    set((state) => ({
      answers: { ...state.answers, [key]: value },
    })),
  setStep: (step) => set({ currentStep: step }),
  reset: () => set({ answers: { ...initialAnswers }, currentStep: 1 }),
}));
