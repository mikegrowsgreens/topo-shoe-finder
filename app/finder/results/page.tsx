"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ResultCard from "@/components/ResultCard";
import ComparisonTable from "@/components/ComparisonTable";
import { useQuizStore } from "@/lib/store";
import { matchShoes } from "@/lib/matching-engine";
import { ScoredShoe, Shoe } from "@/lib/types";
import catalog from "@/data/catalog.json";

export default function ResultsPage() {
  const router = useRouter();
  const { answers, reset } = useQuizStore();
  const [results, setResults] = useState<ScoredShoe[]>([]);
  const [loading, setLoading] = useState(true);

  // Safety reset: ensure body styles are clean when arriving at results
  useEffect(() => {
    document.body.style.overflow = "";
    const footer = document.querySelector("footer");
    if (footer) (footer as HTMLElement).style.display = "";
  }, []);

  useEffect(() => {
    if (!answers.activity) {
      router.push("/finder");
      return;
    }

    const matched = matchShoes(answers, catalog as Shoe[]);
    setResults(matched);
    setLoading(false);
  }, [answers, router]);

  const handleRetake = () => {
    reset();
    router.push("/finder/1");
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-gradient-to-br from-navy to-teal-dark">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-teal" role="status" aria-label="Finding your matches" />
          <p className="text-xl font-bold text-white">Finding your perfect match...</p>
          <p className="mt-1 text-white/60">Analyzing 20 models against your preferences</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Results Header */}
      <section className="bg-gradient-to-br from-navy via-navy/95 to-teal-dark px-6 py-12 text-center md:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-teal/20 px-4 py-1.5 text-sm font-medium text-teal">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Quiz Complete
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Your Top Matches
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-lg text-white/70">
            Based on your preferences, here are the best Topo Athletic shoes for you.
          </p>
        </div>
      </section>

      {/* Result Cards */}
      <section className="mx-auto max-w-6xl px-4 -mt-2 md:px-6">
        <div className="grid items-stretch gap-6 md:grid-cols-3">
          {results.map((result) => (
            <ResultCard key={result.shoe.id} result={result} />
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <h2 className="mb-4 text-2xl font-extrabold tracking-tight text-navy md:text-3xl">
          Side-by-Side Comparison
        </h2>
        <div className="overflow-hidden rounded-2xl border border-warm-gray-200 bg-white shadow-sm">
          <ComparisonTable results={results} />
        </div>
      </section>

      {/* Why These Matches */}
      <section className="bg-navy px-6 py-12 md:py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-4 text-2xl font-extrabold tracking-tight text-white md:text-3xl">
            Why These Matches?
          </h2>
          <p className="text-base leading-relaxed text-white/70">
            Our matching algorithm scored each shoe against your activity type, cushion preference,
            terrain needs, support requirements, and priorities. Every Topo shoe features a signature
            anatomical toe box and low 5mm drop for natural foot mechanics.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Activity", value: answers.activity },
              { label: "Cushion", value: answers.cushion },
              { label: "Support", value: answers.support },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                <span className="text-xs font-medium uppercase tracking-wide text-teal">{item.label}</span>
                <p className="mt-1 text-lg font-bold capitalize text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Actions */}
      <section className="px-6 py-12 text-center">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={handleRetake}
            className="rounded-xl border-2 border-navy px-6 py-3 font-bold text-navy transition-all hover:bg-navy hover:text-white active:scale-[0.98]"
          >
            Retake Quiz
          </button>
          <a
            href="https://www.topoathletic.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-navy px-6 py-3 font-bold text-white transition-all hover:bg-navy/90 hover:shadow-md active:scale-[0.98]"
          >
            Shop All Topo Shoes
          </a>
        </div>
      </section>
    </div>
  );
}
