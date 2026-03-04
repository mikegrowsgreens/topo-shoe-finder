"use client";

import { QuizQuestion as QuizQuestionType, QuizOption } from "@/lib/types";

interface QuizQuestionProps {
  question: QuizQuestionType;
  selectedValue: string | string[] | null;
  onSelect: (value: string) => void;
}

function OptionCard({
  option,
  isSelected,
  onSelect,
  multiSelect,
  compact,
}: {
  option: QuizOption;
  isSelected: boolean;
  onSelect: () => void;
  multiSelect?: boolean;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      role={multiSelect ? "checkbox" : "radio"}
      aria-checked={isSelected}
      onClick={onSelect}
      className={`
        w-full rounded-lg border text-center transition-all duration-200 ease-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-[#363A4A]
        ${compact ? "px-5 py-3" : "px-6 py-4"}
        ${
          isSelected
            ? "border-teal bg-teal/10 text-white"
            : "border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10"
        }
      `}
    >
      <span className={`font-semibold ${compact ? "text-base" : "text-lg"}`}>{option.label}</span>
    </button>
  );
}

export default function QuizQuestion({ question, selectedValue, onSelect }: QuizQuestionProps) {
  const isOptionSelected = (value: string): boolean => {
    if (question.multiSelect && Array.isArray(selectedValue)) {
      return selectedValue.includes(value);
    }
    return selectedValue === value;
  };

  const compact = question.options.length > 3;

  return (
    <div role="group" aria-labelledby={`question-${question.id}`}>
      <div className="mb-6 text-center">
        <h2
          id={`question-${question.id}`}
          className="text-2xl font-bold tracking-tight text-white sm:text-3xl"
        >
          {question.title}
        </h2>
        {question.subtitle && (
          <p className="mt-2 text-sm text-white/50">{question.subtitle}</p>
        )}
      </div>

      <div className="mx-auto flex max-w-xl flex-col gap-2">
        {question.options.map((option) => (
          <OptionCard
            key={option.value}
            option={option}
            isSelected={isOptionSelected(option.value)}
            onSelect={() => onSelect(option.value)}
            multiSelect={question.multiSelect}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
}
