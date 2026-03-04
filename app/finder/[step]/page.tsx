"use client";

import { useRouter, useParams } from "next/navigation";
import { useCallback, useRef, useEffect } from "react";
import QuizQuestionComponent from "@/components/QuizQuestion";
import { useQuizStore } from "@/lib/store";
import { questions } from "@/lib/questions";
import { QuizAnswers } from "@/lib/types";

const TOTAL_STEPS = 6;

const stepLabels = ["Activity", "Cushion", "Terrain", "Support", "Fit", "Priorities"];

export default function QuizStepPage() {
  const router = useRouter();
  const params = useParams();
  const stepNum = parseInt(params.step as string, 10);
  const autoAdvanceTimer = useRef<NodeJS.Timeout | null>(null);

  const { answers, setAnswer } = useQuizStore();

  const question = questions.find((q) => q.step === stepNum);

  const goNext = useCallback(() => {
    // Reset body styles before navigating away
    document.body.style.overflow = "";
    const footer = document.querySelector("footer");
    if (footer) (footer as HTMLElement).style.display = "";

    if (stepNum < TOTAL_STEPS) {
      router.push(`/finder/${stepNum + 1}`);
    } else {
      router.push("/finder/results");
    }
  }, [stepNum, router]);

  const handleSelect = useCallback(
    (value: string) => {
      if (!question) return;

      if (question.multiSelect) {
        const currentPriorities = answers.priorities || [];
        const maxSelections = question.maxSelections || 2;

        if (currentPriorities.includes(value)) {
          setAnswer("priorities", currentPriorities.filter((v) => v !== value));
        } else if (currentPriorities.length < maxSelections) {
          setAnswer("priorities", [...currentPriorities, value]);
        }
      } else {
        setAnswer(question.id as keyof QuizAnswers, value as never);

        if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
        autoAdvanceTimer.current = setTimeout(() => {
          goNext();
        }, 400);
      }
    },
    [question, answers.priorities, setAnswer, goNext]
  );

  const handleBack = useCallback(() => {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    if (stepNum > 1) {
      router.push(`/finder/${stepNum - 1}`);
    } else {
      // Reset body styles before leaving quiz
      document.body.style.overflow = "";
      const footer = document.querySelector("footer");
      if (footer) (footer as HTMLElement).style.display = "";
      router.push("/finder");
    }
  }, [stepNum, router]);

  // Hide footer on quiz pages
  useEffect(() => {
    const footer = document.querySelector("footer");
    if (footer) (footer as HTMLElement).style.display = "none";
    document.body.style.overflow = "";
    return () => {
      if (footer) (footer as HTMLElement).style.display = "";
      document.body.style.overflow = "";
    };
  }, []);

  if (!question || stepNum < 1 || stepNum > TOTAL_STEPS) {
    router.push("/finder");
    return null;
  }

  const currentValue = question.multiSelect
    ? answers.priorities
    : answers[question.id as keyof QuizAnswers];

  const hasSelection = question.multiSelect
    ? (answers.priorities || []).length > 0
    : currentValue !== null && currentValue !== undefined;

  const progressPercent = (stepNum / TOTAL_STEPS) * 100;

  return (
    <div className="relative flex min-h-[calc(100dvh-57px)] flex-col bg-[#363A4A]">
      {/* Progress Bar */}
      <div className="shrink-0 px-6 pt-4">
        <p className="mb-2 text-center text-xs font-medium uppercase tracking-widest text-white/50">
          {stepLabels[stepNum - 1]}
        </p>
        <div className="mx-auto h-2 max-w-2xl overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-teal transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Content — vertically centered */}
      <div className="flex flex-1 items-center justify-center px-4 py-6">
        {/* Side Nav: Back */}
        <div className="hidden w-24 shrink-0 md:flex md:flex-col md:items-start md:pl-4">
          {stepNum > 1 && (
            <button
              onClick={handleBack}
              className="group flex flex-col items-start text-white/50 hover:text-white transition-colors"
              aria-label="Go to previous question"
            >
              <svg className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-xs font-medium">{stepLabels[stepNum - 2]}</span>
              <span className="text-[10px] text-white/30">Back</span>
            </button>
          )}
        </div>

        {/* Quiz Content */}
        <div className="w-full max-w-xl">
          <QuizQuestionComponent
            question={question}
            selectedValue={currentValue as string | string[] | null}
            onSelect={handleSelect}
          />

          {/* Multi-select continue button */}
          {question.multiSelect && (
            <div className="mt-6 text-center">
              <button
                onClick={goNext}
                disabled={!hasSelection}
                className="inline-flex items-center gap-2 rounded-lg bg-teal px-8 py-3 text-base font-semibold text-white transition-all hover:bg-teal-dark disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label={stepNum === TOTAL_STEPS ? "See my results" : "Continue"}
              >
                {stepNum === TOTAL_STEPS ? "See My Results" : "Continue"}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* Mobile back button */}
          <div className="mt-6 text-center md:hidden">
            {stepNum > 1 && (
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-white/70 transition-colors"
                aria-label="Go to previous question"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            )}
          </div>
        </div>

        {/* Side Nav: Next */}
        <div className="hidden w-24 shrink-0 md:flex md:flex-col md:items-end md:pr-4">
          {stepNum < TOTAL_STEPS && (
            <div className="flex flex-col items-end text-white/30">
              <svg className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-xs font-medium">{stepLabels[stepNum]}</span>
              <span className="text-[10px]">Next</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
